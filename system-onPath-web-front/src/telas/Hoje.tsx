import { TelaBase } from "@/components/TelaBase";
import { usePendencias } from "@/dados/consultas";
import { PlanoDoDia } from "@/features/hoje/PlanoDoDia";
import { RevisaoPendencias } from "@/features/hoje/RevisaoPendencias";
import { useHoje } from "@/features/hoje/useHoje";
import { useAcoesTarefas } from "@/features/tarefas/acoes";
import { ConfirmarSubtarefas } from "@/features/tarefas/ConfirmarSubtarefas";
import { t } from "@/i18n";

/**
 * Tela inicial: a revisão das pendências, enquanto houver (RN25), ou o plano do dia
 * (specs/004-hoje/contracts/interface.md).
 */
export function Hoje() {
  const hoje = useHoje();
  const { acoes, pedido } = useAcoesTarefas();
  const { data: pendencias } = usePendencias(hoje);

  return (
    <TelaBase titulo={t("telas.hoje.titulo")}>
      {pendencias === undefined ? null : pendencias.length > 0 ? (
        <RevisaoPendencias hoje={hoje} pendencias={pendencias} />
      ) : (
        <PlanoDoDia data={hoje} acoes={acoes} />
      )}
      <ConfirmarSubtarefas pedido={pedido} />
    </TelaBase>
  );
}
