import { Link } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { TelaBase } from "@/components/TelaBase";
import { t } from "@/i18n";
import { cores, fontes, tamanhos } from "@/theme";

export default function TelaNaoEncontrada() {
  return (
    <TelaBase titulo={t("naoEncontrada.titulo")}>
      <Text style={estilos.mensagem}>{t("naoEncontrada.mensagem")}</Text>
      <Link href="/" style={estilos.link}>
        {t("naoEncontrada.voltar")}
      </Link>
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  mensagem: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.normal,
    color: cores.cinza[700],
  },
  link: {
    fontFamily: fontes.media,
    fontSize: tamanhos.normal,
    color: cores.preto,
    textDecorationLine: "underline",
  },
});
