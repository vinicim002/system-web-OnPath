import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import {
  useCancelarTarefa,
  useConcluirTarefa,
  useExcluirTarefa,
  useReabrirTarefa,
  useRecuperarTarefa,
} from "@/dados/consultas";
import { useServicos } from "@/dados/ServicosProvider";
import { ehErroOnPath } from "@/dados/erros";
import type { Tarefa } from "@/dados/tipos";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";

export interface AcoesTarefas {
  /** Conclui a tarefa aberta ou reabre a concluída/cancelada. */
  alternarConclusao: (tarefa: Pick<Tarefa, "id" | "status" | "projetoId">) => Promise<void>;
  cancelar: (id: string) => Promise<void>;
  excluir: (id: string) => Promise<void>;
}

export interface PedidoConfirmacao {
  quantidade: number;
  confirmar: () => void;
  cancelar: () => void;
}

/**
 * Ações da lista e do painel, criadas uma vez para a tela (como em features/caixa/acoes.ts).
 * Concluir com subtarefas abertas gera um pedido de confirmação (research.md, item 6).
 */
export function useAcoesTarefas(): { acoes: AcoesTarefas; pedido: PedidoConfirmacao | null } {
  const { mutateAsync: concluir } = useConcluirTarefa();
  const { mutateAsync: reabrir } = useReabrirTarefa();
  const { mutateAsync: cancelar } = useCancelarTarefa();
  const { mutateAsync: excluir } = useExcluirTarefa();
  const { mutateAsync: recuperar } = useRecuperarTarefa();
  const [pedido, setPedido] = useState<PedidoConfirmacao | null>(null);
  const { projetos } = useServicos();
  const navegar = useNavigate();

  /** Depois de concluir, avisa se o projeto ativo ficou sem tarefa aberta (RN08, FR-016 de specs/006). */
  const avisarSemProximaAcao = useCallback(
    async (projetoId: string | null) => {
      if (!projetoId) return;
      try {
        if (!(await projetos.semProximaAcao(projetoId))) return;
        const projeto = await projetos.obter(projetoId);
        toast(t("projetos.avisos.semProximaAcao", { projeto: projeto.nome }), {
          duration: 8000,
          action: { label: t("projetos.avisos.abrirProjeto"), onClick: () => navegar(`/projetos/${projetoId}`) },
        });
      } catch {
        // O aviso é só uma ajuda; se a consulta falhar, a conclusão já foi feita.
      }
    },
    [projetos, navegar],
  );

  const fechar = useCallback(() => setPedido(null), []);

  const acoes = useMemo<AcoesTarefas>(
    () => ({
      async alternarConclusao(tarefa) {
        try {
          if (tarefa.status !== "aberta") {
            await reabrir(tarefa.id);
            return;
          }
          await concluir({ id: tarefa.id });
          await avisarSemProximaAcao(tarefa.projetoId);
        } catch (erro) {
          if (ehErroOnPath(erro) && erro.codigo === "subtarefas_abertas") {
            setPedido({
              quantidade: Number(erro.detalhes.quantidade ?? 0),
              confirmar: () => {
                setPedido(null);
                concluir({ id: tarefa.id, incluirSubtarefas: true })
                  .then(() => avisarSemProximaAcao(tarefa.projetoId))
                  .catch(avisarErro);
              },
              cancelar: fechar,
            });
            return;
          }
          avisarErro(erro);
        }
      },
      async cancelar(id) {
        try {
          await cancelar(id);
          toast(t("tarefas.avisos.cancelada"));
        } catch (erro) {
          avisarErro(erro);
        }
      },
      async excluir(id) {
        try {
          await excluir(id);
          toast(t("tarefas.avisos.excluida"), {
            duration: 5000,
            action: {
              label: t("tarefas.avisos.desfazer"),
              onClick: () => recuperar(id).catch(avisarErro),
            },
          });
        } catch (erro) {
          avisarErro(erro);
        }
      },
    }),
    [concluir, reabrir, cancelar, excluir, recuperar, fechar, avisarSemProximaAcao],
  );

  return { acoes, pedido };
}
