import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useOpcoesTarefa, usePlanoDoDia, useReordenarDia, useTirarDoDia } from "@/dados/consultas";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";
import { dataPorExtenso, duracao } from "@/i18n/datas";
import type { AcoesTarefas } from "@/features/tarefas/acoes";

import { AdicionarAoDia } from "./AdicionarAoDia";
import { ItemDoDia } from "./ItemDoDia";

/** Plano do dia: tarefas na ordem escolhida, com a próxima em destaque (RN20). */
export function PlanoDoDia({ data, acoes }: { data: string; acoes: AcoesTarefas }) {
  const { data: plano } = usePlanoDoDia(data);
  const { data: opcoes } = useOpcoesTarefa();
  const reordenar = useReordenarDia();
  const tirar = useTirarDoDia();
  const [adicionando, setAdicionando] = useState(false);
  // Ordem otimista enquanto a gravação não volta, para o item não "pular" ao soltar.
  const [ordemLocal, setOrdemLocal] = useState<string[] | null>(null);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const nomes = useMemo(() => {
    const porId = new Map<string, string>();
    for (const projeto of opcoes?.projetos ?? []) porId.set(projeto.id, projeto.nome);
    for (const materia of opcoes?.materias ?? []) porId.set(materia.id, materia.nome);
    return porId;
  }, [opcoes]);

  const itens = useMemo(() => {
    const lista = plano?.itens ?? [];
    if (!ordemLocal) return lista;
    const porId = new Map(lista.map((linha) => [linha.item.id, linha]));
    return ordemLocal.map((id) => porId.get(id)).filter((linha) => linha !== undefined);
  }, [plano, ordemLocal]);

  const noDia = useMemo(() => new Set(itens.map((linha) => linha.tarefa.id)), [itens]);

  async function aoSoltar({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const ids = itens.map((linha) => linha.item.id);
    const nova = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    setOrdemLocal(nova);
    try {
      await reordenar.mutateAsync({ data, itemIds: nova });
    } catch (erro) {
      avisarErro(erro);
    } finally {
      setOrdemLocal(null);
    }
  }

  async function aoTirar(itemId: string) {
    try {
      await tirar.mutateAsync(itemId);
      toast(t("hoje.avisos.tirada"));
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <div className="flex max-w-180 flex-col gap-5">
      <div className="-mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-cinza-600 first-letter:uppercase">{dataPorExtenso(data)}</p>
        {plano && plano.itens.length > 0 && (
          <p className="text-pequeno text-cinza-600">
            {t("hoje.planejado", { tempo: duracao(plano.planejadoMin) })} ·{" "}
            {t("hoje.feito", { tempo: duracao(plano.feitoMin) })}
          </p>
        )}
      </div>

      <div>
        <Button variant="outline" onClick={() => setAdicionando(true)}>
          <Plus />
          {t("hoje.adicionar")}
        </Button>
      </div>

      {plano && itens.length === 0 && <p className="text-cinza-600">{t("hoje.vazio")}</p>}
      {plano && itens.length > 0 && plano.proximaId === null && (
        <p className="font-medium">{t("hoje.concluido")}</p>
      )}

      <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={(evento) => void aoSoltar(evento)}>
        <SortableContext items={itens.map((linha) => linha.item.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-1">
            {itens.map((linha) => {
              const vinculo = linha.tarefa.projetoId ?? linha.tarefa.materiaId;
              return (
                <ItemDoDia
                  key={linha.item.id}
                  linha={linha}
                  proxima={linha.item.id === plano?.proximaId}
                  contexto={vinculo ? (nomes.get(vinculo) ?? "") : t("tarefas.campos.avulsa")}
                  aoTirar={(id) => void aoTirar(id)}
                  acoes={acoes}
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>

      {adicionando && <AdicionarAoDia data={data} noDia={noDia} aberto={adicionando} aoMudar={setAdicionando} />}
    </div>
  );
}
