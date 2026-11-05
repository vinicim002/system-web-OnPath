import { TelaBase } from "@/components/TelaBase";
import { CopiaDados } from "@/features/ajustes/CopiaDados";
import { t } from "@/i18n";

export function Ajustes() {
  return (
    <TelaBase titulo={t("telas.ajustes.titulo")}>
      <CopiaDados />
    </TelaBase>
  );
}
