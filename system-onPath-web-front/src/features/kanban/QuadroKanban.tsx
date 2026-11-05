import { DndContext, KeyboardSensor, PointerSensor, rectIntersection, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useColunas, useCriarTarefa, useMoverParaColuna, useTarefas } from "@/dados/consultas";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import type { Projeto, Tarefa } from "@/dados/tipos";
import { avisarErro } from "@/features/caixa/avisos";
import type { PedidoConfirmacao } from "@/features/tarefas/acoes";
import { ConfirmarSubtarefas } from "@/features/tarefas/ConfirmarSubtarefas";
import { FormularioTarefa } from "@/features/tarefas/FormularioTarefa";
import { paraNovaTarefa, VALORES_VAZIOS, type ValoresFormulario } from "@/features/tarefas/valoresTarefa";
import { t } from "@/i18n";

import { ColunaKanban } from "./ColunaKanban";
import { coordenadasEntreColunas } from "./teclado";

const SEM_COLUNA = "sem-coluna";

/** Kanban do projeto: só tarefas principais, abertas ou concluídas (RN29), arrastáveis entre colunas (RN32). */
export function QuadroKanban({ projeto }: { projeto: Projeto }) {
  const { data: colunas = [] } = useColunas(projeto.id);
  const { data: todas = [] } = useTarefas({ projetoId: projeto.id, status: "todas" });
  const mover = useMoverParaColuna();
  const criar = useCriarTarefa();
  const navegar = useNavigate();
  const [movimento, setMovimento] = useState<{ tarefaId: string; colunaId: string | null } | null>(null);
  const [pedido, setPedido] = useState<PedidoConfirmacao | null>(null);
  const [novaEm, setNovaEm] = useState<{ id: string | null; nome: string } | null>(null);
  const arrastouAgora = useRef(false);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: coordenadasEntreColunas }),
  );

  const principais = useMemo(
    () => todas.filter((tarefa) => tarefa.tarefaPaiId === null && tarefa.status !== "cancelada"),
    [todas],
  );
  const subtarefasAbertas = useMemo(() => {
    const contagem = new Map<string, number>();
    for (const tarefa of todas) {
      if (tarefa.tarefaPaiId && tarefa.status === "aberta") contagem.set(tarefa.tarefaPaiId, (contagem.get(tarefa.tarefaPaiId) ?? 0) + 1);
    }
    return contagem;
  }, [todas]);

  // O movimento aparece na hora; se o serviço recusar, o cartão volta (research.md, item 3).
  const colunaDe = (tarefa: Tarefa) => (movimento?.tarefaId === tarefa.id ? movimento.colunaId : tarefa.colunaId);
  const idsColunas = new Set(colunas.map((c) => c.id));
  const semColuna = principais.filter((tarefa) => {
    const coluna = colunaDe(tarefa);
    return coluna === null || !idsColunas.has(coluna);
  });

  async function moverPara(tarefa: Tarefa, colunaId: string | null, incluirSubtarefas = false) {
    setMovimento({ tarefaId: tarefa.id, colunaId });
    try {
      await mover.mutateAsync({ id: tarefa.id, colunaId, incluirSubtarefas });
    } catch (erro) {
      if (ehErroOnPath(erro) && erro.codigo === "subtarefas_abertas") {
        setPedido({
          quantidade: Number(erro.detalhes.quantidade ?? 0),
          confirmar: () => {
            setPedido(null);
            void moverPara(tarefa, colunaId, true);
          },
          cancelar: () => {
            setPedido(null);
            setMovimento(null);
          },
        });
        return;
      }
      avisarErro(erro);
    }
    setMovimento(null);
  }

  function aoSoltar({ active, over }: DragEndEvent) {
    arrastouAgora.current = true;
    window.setTimeout(() => (arrastouAgora.current = false), 0);
    if (!over) return;
    const tarefa = principais.find((t) => t.id === active.id);
    if (!tarefa) return;
    const destino = over.id === SEM_COLUNA ? null : String(over.id);
    if (destino === colunaDe(tarefa)) return;
    void moverPara(tarefa, destino);
  }

  function aoAbrir(tarefaId: string) {
    if (!arrastouAgora.current) navegar(`/tarefas?tarefa=${tarefaId}`);
  }

  const valoresNova = useMemo<ValoresFormulario>(
    () => ({ ...VALORES_VAZIOS, vinculo: "projeto", projetoId: projeto.id, areaId: projeto.areaId, prioridade: projeto.prioridade }),
    [projeto.id, projeto.areaId, projeto.prioridade],
  );

  async function aoCriarTarefa(valores: ValoresFormulario): Promise<ErroOnPath | null> {
    try {
      const tarefa = await criar.mutateAsync(paraNovaTarefa(valores));
      if (novaEm?.id) await mover.mutateAsync({ id: tarefa.id, colunaId: novaEm.id });
      toast(t("tarefas.avisos.criada"));
      setNovaEm(null);
      return null;
    } catch (erro) {
      if (ehErroOnPath(erro) && erro.codigo === "dados_invalidos") return erro;
      avisarErro(erro);
      return ehErroOnPath(erro) ? erro : null;
    }
  }

  return (
    <>
      {colunas.length === 0 && <p className="max-w-140 text-cinza-600">{t("kanban.semColunas")}</p>}
      <DndContext sensors={sensores} collisionDetection={rectIntersection} onDragEnd={aoSoltar}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {(colunas.length === 0 || semColuna.length > 0) && (
            <ColunaKanban
              id={SEM_COLUNA}
              nome={t("kanban.semColuna")}
              final={false}
              tarefas={semColuna}
              subtarefasAbertas={subtarefasAbertas}
              aoNovaTarefa={() => setNovaEm({ id: null, nome: t("kanban.semColuna") })}
              aoAbrir={aoAbrir}
            />
          )}
          {colunas.map((coluna) => (
            <ColunaKanban
              key={coluna.id}
              id={coluna.id}
              nome={coluna.nome}
              final={coluna.final}
              tarefas={principais.filter((tarefa) => colunaDe(tarefa) === coluna.id)}
              subtarefasAbertas={subtarefasAbertas}
              aoNovaTarefa={() => setNovaEm({ id: coluna.id, nome: coluna.nome })}
              aoAbrir={aoAbrir}
            />
          ))}
        </div>
      </DndContext>

      <ConfirmarSubtarefas pedido={pedido} />

      <Dialog open={novaEm !== null} onOpenChange={(aberto) => !aberto && setNovaEm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("kanban.novaTarefaTitulo", { coluna: novaEm?.nome ?? "" })}</DialogTitle>
          </DialogHeader>
          {novaEm && (
            <FormularioTarefa
              valoresIniciais={valoresNova}
              rotuloSalvar={t("tarefas.acoes.criar")}
              aoSalvar={aoCriarTarefa}
              aoCancelar={() => setNovaEm(null)}
              focarTitulo
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
