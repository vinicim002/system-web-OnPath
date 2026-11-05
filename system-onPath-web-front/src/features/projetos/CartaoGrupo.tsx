import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAlterarGrupo, useReordenarFila } from "@/dados/consultas";
import type { GrupoNaVisao, ProjetoNaVisao } from "@/dados/contratos";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import { FormularioGrupo, type ValoresGrupo } from "@/features/areas/FormularioGrupo";
import { avisarErro } from "@/features/caixa/avisos";
import { t, tPlural } from "@/i18n";
import { cn } from "@/lib/utils";

import { LinhaProjeto } from "./LinhaProjeto";

function ItemFila({ projeto, grupo, posicao }: { projeto: ProjetoNaVisao; grupo: string; posicao: number }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: projeto.id,
  });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "relative z-10 rounded-md bg-branco shadow-md")}
    >
      <LinhaProjeto
        projeto={projeto}
        grupo={grupo}
        posicao={posicao}
        alca={
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={t("projetos.acoes.arrastar")}
            className="cursor-grab rounded-sm text-cinza-400 hover:text-preto active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
        }
      />
    </li>
  );
}

function Secao({ titulo, children, vazia }: { titulo: string; children: React.ReactNode; vazia: boolean }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[6rem_1fr]">
      <p className="pt-1.5 text-pequeno font-medium text-cinza-500">{titulo}</p>
      {vazia ? <p className="pt-1.5 text-pequeno text-cinza-400">{t("projetos.vazioSecao")}</p> : children}
    </div>
  );
}

/** Um grupo: vagas, ativos, fila ordenável, pausados e encerrados (FR-009, FR-011 e FR-014). */
export function CartaoGrupo({ grupo }: { grupo: GrupoNaVisao }) {
  const reordenar = useReordenarFila();
  const alterarGrupo = useAlterarGrupo();
  const [editando, setEditando] = useState(false);
  const [verEncerrados, setVerEncerrados] = useState(false);
  const [ordemLocal, setOrdemLocal] = useState<string[] | null>(null);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fila = useMemo(() => {
    if (!ordemLocal) return grupo.fila;
    const porId = new Map(grupo.fila.map((p) => [p.id, p]));
    return ordemLocal.map((id) => porId.get(id)).filter((p) => p !== undefined);
  }, [grupo.fila, ordemLocal]);

  async function aoSoltar({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const ids = fila.map((p) => p.id);
    const nova = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    setOrdemLocal(nova);
    try {
      await reordenar.mutateAsync({ grupoId: grupo.id, ids: nova });
    } catch (erro) {
      avisarErro(erro);
    } finally {
      setOrdemLocal(null);
    }
  }

  async function salvarGrupo(valores: ValoresGrupo): Promise<ErroOnPath | null> {
    try {
      await alterarGrupo.mutateAsync({ id: grupo.id, dados: { nome: valores.nome, limiteAtivos: Number(valores.limiteAtivos) } });
      toast(t("grupos.avisos.salvo"));
      setEditando(false);
      return null;
    } catch (erro) {
      if (ehErroOnPath(erro) && (erro.codigo === "dados_invalidos" || erro.codigo === "nome_repetido")) return erro;
      avisarErro(erro);
      return ehErroOnPath(erro) ? erro : null;
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border p-4">
      <header className="flex flex-wrap items-center gap-3">
        <h3 className="font-semibold">{grupo.nome}</h3>
        <span className="text-pequeno text-cinza-600">
          {tPlural("grupos.vagas", grupo.limiteAtivos, { ativos: grupo.ativos, limite: grupo.limiteAtivos })}
        </span>
        {grupo.acimaDoLimite && (
          <span className="rounded-sm bg-preto px-1.5 py-0.5 text-pequeno text-branco">{t("grupos.acimaDoLimite")}</span>
        )}
        <Button size="xs" variant="ghost" className="ml-auto" onClick={() => setEditando((atual) => !atual)}>
          {t("projetos.acoes.editarGrupo")}
        </Button>
      </header>

      {editando && (
        <FormularioGrupo
          valoresIniciais={{ nome: grupo.nome, limiteAtivos: String(grupo.limiteAtivos) }}
          rotuloSalvar={t("grupos.salvar")}
          aoSalvar={salvarGrupo}
          aoCancelar={() => setEditando(false)}
        />
      )}

      <Secao titulo={t("projetos.secoes.ativos")} vazia={grupo.projetosAtivos.length === 0}>
        <ul className="flex flex-col">
          {grupo.projetosAtivos.map((projeto) => (
            <li key={projeto.id}>
              <LinhaProjeto projeto={projeto} grupo={grupo.nome} />
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo={t("projetos.secoes.fila")} vazia={fila.length === 0}>
        <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={(evento) => void aoSoltar(evento)}>
          <SortableContext items={fila.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col">
              {fila.map((projeto, indice) => (
                <ItemFila key={projeto.id} projeto={projeto} grupo={grupo.nome} posicao={indice + 1} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </Secao>

      <Secao titulo={t("projetos.secoes.pausados")} vazia={grupo.pausados.length === 0}>
        <ul className="flex flex-col">
          {grupo.pausados.map((projeto) => (
            <li key={projeto.id}>
              <LinhaProjeto projeto={projeto} grupo={grupo.nome} />
            </li>
          ))}
        </ul>
      </Secao>

      {grupo.encerrados.length > 0 && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setVerEncerrados((atual) => !atual)}
            aria-expanded={verEncerrados}
            className="flex items-center gap-1 self-start text-pequeno font-medium text-cinza-500 hover:text-preto"
          >
            {verEncerrados ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            {tPlural("projetos.secoes.encerrados", grupo.encerrados.length)}
          </button>
          {verEncerrados && (
            <ul className="flex flex-col">
              {grupo.encerrados.map((projeto) => (
                <li key={projeto.id}>
                  <LinhaProjeto projeto={projeto} grupo={grupo.nome} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
