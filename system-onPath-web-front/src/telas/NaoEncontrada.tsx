import { Link } from "react-router";

import { TelaBase } from "@/components/TelaBase";
import { t } from "@/i18n";

export function NaoEncontrada() {
  return (
    <TelaBase titulo={t("naoEncontrada.titulo")}>
      <p className="text-cinza-700">{t("naoEncontrada.mensagem")}</p>
      <Link to="/" className="self-start font-medium text-preto underline underline-offset-4">
        {t("naoEncontrada.voltar")}
      </Link>
    </TelaBase>
  );
}
