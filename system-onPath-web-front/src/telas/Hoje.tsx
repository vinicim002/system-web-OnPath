import { TelaBase } from "@/components/TelaBase";
import { PlanoDoDia } from "@/features/hoje/PlanoDoDia";
import { useHoje } from "@/features/hoje/useHoje";
import { t } from "@/i18n";

/** Tela inicial: o plano do dia (specs/004-hoje/contracts/interface.md). */
export function Hoje() {
  const hoje = useHoje();
  return (
    <TelaBase titulo={t("telas.hoje.titulo")}>
      <PlanoDoDia data={hoje} />
    </TelaBase>
  );
}
