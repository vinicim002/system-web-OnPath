import { Link } from "react-router";

import { TelaBase } from "@/components/TelaBase";
import { t } from "@/i18n";

import estilos from "./NaoEncontrada.module.css";

export function NaoEncontrada() {
  return (
    <TelaBase titulo={t("naoEncontrada.titulo")}>
      <p className={estilos.mensagem}>{t("naoEncontrada.mensagem")}</p>
      <Link to="/" className={estilos.link}>
        {t("naoEncontrada.voltar")}
      </Link>
    </TelaBase>
  );
}
