import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAlterarColuna,
  useColunas,
  useCriarColuna,
  useExcluirColuna,
  useMarcarFinal,
  useRecuperarColuna,
  useReordenarColunas,
} from "@/dados/consultas";
import { ehErroOnPath } from "@/dados/erros";
import type { Coluna } from "@/dados/tipos";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";

function LinhaColuna({ coluna }: { coluna: Coluna }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: coluna.id });
  const alterar = useAlterarColuna();
  const marcarFinal = useMarcarFinal();
  const excluir = useExcluirColuna();
  const recuperar = useRecuperarColuna();
  const [renomeando, setRenomeando] = useState(false);
  const [nome, setNome] = useState(coluna.nome);
  const [erro, setErro] = useState<string | null>(null);

  async function aoRenomear(evento: FormEvent) {
    evento.preventDefault();
    try {
      await alterar.mutateAsync({ id: coluna.id, nome });
      setRenomeando(false);
      setErro(null);
    } catch (e) {
      if (ehErroOnPath(e) && (e.codigo === "nome_repetido" || e.codigo === "dados_invalidos")) setErro(e.mensagem);
      else avisarErro(e);
    }
  }

  async function aoArquivar() {
    try {
      await excluir.mutateAsync(coluna.id);
      toast(t("kanban.avisos.colunaArquivada"), {
        duration: 5000,
        action: { label: t("kanban.avisos.desfazer"), onClick: () => recuperar.mutateAsync(coluna.id).catch(avisarErro) },
      });
    } catch (e) {
      avisarErro(e);
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex flex-col gap-1 rounded-md border bg-branco px-2 py-2", isDragging && "relative z-10 shadow-md")}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={t("kanban.arrastarColuna")}
          className="cursor-grab rounded-sm text-cinza-400 hover:text-preto active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        {renomeando ? (
          <form className="flex flex-1 items-center gap-2" onSubmit={(e) => void aoRenomear(e)}>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} aria-label={t("kanban.nomeColuna")} className="h-8" autoFocus />
            <Button size="xs" type="submit">{t("kanban.salvar")}</Button>
            <Button size="xs" type="button" variant="ghost" onClick={() => { setRenomeando(false); setNome(coluna.nome); setErro(null); }}>
              {t("kanban.cancelar")}
            </Button>
          </form>
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate">{coluna.nome}</span>
            {coluna.final && <span className="rounded-sm border border-preto px-1.5 text-pequeno">{t("kanban.final")}</span>}
            <Button size="xs" variant="ghost" onClick={() => setRenomeando(true)}>{t("kanban.renomear")}</Button>
            <Button size="xs" variant="ghost" onClick={() => marcarFinal.mutateAsync({ id: coluna.id, final: !coluna.final }).catch(avisarErro)}>
              {coluna.final ? t("kanban.desmarcarFinal") : t("kanban.marcarFinal")}
            </Button>
            <Button size="xs" variant="ghost" onClick={() => void aoArquivar()}>{t("kanban.arquivar")}</Button>
          </>
        )}
      </div>
      {erro && <p className="pl-6 text-pequeno text-cinza-700">{erro}</p>}
    </li>
  );
}

/** Criar, renomear, ordenar, marcar a final e arquivar colunas (FR-002 a FR-005). */
export function EditarColunas({ projetoId }: { projetoId: string }) {
  const { data: colunas = [] } = useColunas(projetoId);
  const criar = useCriarColuna();
  const reordenar = useReordenarColunas();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ordemLocal, setOrdemLocal] = useState<string[] | null>(null);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const visiveis = useMemo(() => {
    if (!ordemLocal) return colunas;
    const porId = new Map(colunas.map((c) => [c.id, c]));
    return ordemLocal.map((id) => porId.get(id)).filter((c) => c !== undefined);
  }, [colunas, ordemLocal]);

  async function aoSoltar({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const ids = visiveis.map((c) => c.id);
    const nova = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    setOrdemLocal(nova);
    try {
      await reordenar.mutateAsync({ projetoId, ids: nova });
    } catch (e) {
      avisarErro(e);
    } finally {
      setOrdemLocal(null);
    }
  }

  async function aoCriar(evento: FormEvent) {
    evento.preventDefault();
    try {
      await criar.mutateAsync({ projetoId, nome });
      setNome("");
      setErro(null);
      toast(t("kanban.avisos.colunaCriada"));
    } catch (e) {
      if (ehErroOnPath(e) && (e.codigo === "nome_repetido" || e.codigo === "dados_invalidos")) setErro(e.mensagem);
      else avisarErro(e);
    }
  }

  return (
    <div className="flex max-w-140 flex-col gap-3 rounded-lg border p-4">
      <p className="text-pequeno text-cinza-600">{t("kanban.dicaFinal")}</p>
      <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={(e) => void aoSoltar(e)}>
        <SortableContext items={visiveis.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-1">
            {visiveis.map((coluna) => (
              <LinhaColuna key={coluna.id} coluna={coluna} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <form className="flex items-center gap-2" onSubmit={(e) => void aoCriar(e)}>
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder={t("kanban.novaColuna")}
          aria-label={t("kanban.nomeColuna")}
          className="h-8"
        />
        <Button size="sm" type="submit" disabled={nome.trim() === "" || criar.isPending}>
          {t("kanban.criarColuna")}
        </Button>
      </form>
      {erro && <p className="text-pequeno text-cinza-700">{erro}</p>}
    </div>
  );
}
