import { TelaBase } from "@/components/TelaBase";
import { PlanoDoDia } from "@/features/hoje/PlanoDoDia";
import { useHoje } from "@/features/hoje/useHoje";
import { useAcoesTarefas } from "@/features/tarefas/acoes";
import { ConfirmarSubtarefas } from "@/features/tarefas/ConfirmarSubtarefas";
import { t } from "@/i18n";

/** Tela inicial: o plano do dia (specs/004-hoje/contracts/interface.md). */
export function Hoje() {
  const hoje = useHoje();
  const { acoes, pedido } = useAcoesTarefas();
  return (
    <TelaBase titulo={t("telas.hoje.titulo")}>
      <PlanoDoDia data={hoje} acoes={acoes} />
      <ConfirmarSubtarefas pedido={pedido} />
    </TelaBase>
  );
}
