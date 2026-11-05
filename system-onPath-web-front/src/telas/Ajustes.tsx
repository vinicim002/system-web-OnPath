import { TelaBase } from "@/components/TelaBase";
import { CopiaDados } from "@/features/ajustes/CopiaDados";
import { Preferencias } from "@/features/ajustes/Preferencias";
import { t } from "@/i18n";

export function Ajustes() {
  return (
    <TelaBase titulo={t("telas.ajustes.titulo")}>
      <div className="flex flex-col gap-10">
        <Preferencias />
        <CopiaDados />
      </div>
    </TelaBase>
  );
}
