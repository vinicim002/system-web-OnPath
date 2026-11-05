import { Link, usePathname, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { t, type ChaveTexto } from "@/i18n";
import { cores, espaco, fontes, tamanhos } from "@/theme";

const ITENS: { rota: Href & string; rotulo: ChaveTexto }[] = [
  { rota: "/", rotulo: "menu.hoje" },
  { rota: "/caixa", rotulo: "menu.caixa" },
  { rota: "/tarefas", rotulo: "menu.tarefas" },
  { rota: "/projetos", rotulo: "menu.projetos" },
  { rota: "/areas", rotulo: "menu.areas" },
  { rota: "/agenda", rotulo: "menu.agenda" },
  { rota: "/rotinas", rotulo: "menu.rotinas" },
  { rota: "/estudos", rotulo: "menu.estudos" },
  { rota: "/ajustes", rotulo: "menu.ajustes" },
];

export function MenuLateral() {
  const caminho = usePathname();

  return (
    <View role="navigation" style={estilos.menu}>
      <View style={estilos.logo}>
        <View style={estilos.marca} />
        <Text style={estilos.nome}>{t("app.nome")}</Text>
      </View>

      {ITENS.map((item) => {
        const ativo = caminho === item.rota;
        return (
          <Link
            key={item.rota}
            href={item.rota}
            aria-current={ativo ? "page" : undefined}
            style={StyleSheet.flatten([
              estilos.item,
              estilos.rotulo,
              ativo && estilos.itemAtivo,
              ativo && estilos.rotuloAtivo,
            ])}
          >
            {t(item.rotulo)}
          </Link>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  menu: {
    width: 240,
    height: "100%",
    backgroundColor: cores.cinza[50],
    borderRightWidth: 1,
    borderRightColor: cores.cinza[200],
    paddingHorizontal: espaco(3),
    paddingVertical: espaco(6),
    gap: espaco(1),
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco(2),
    paddingHorizontal: espaco(3),
    marginBottom: espaco(6),
  },
  marca: {
    width: espaco(3),
    height: espaco(3),
    borderRadius: espaco(1),
    backgroundColor: cores.roxo,
  },
  nome: {
    fontFamily: fontes.seminegrito,
    fontSize: tamanhos.subtitulo,
    color: cores.preto,
  },
  item: {
    paddingHorizontal: espaco(3),
    paddingVertical: espaco(2),
    borderRadius: espaco(2),
  },
  itemAtivo: {
    backgroundColor: cores.cinza[200],
  },
  rotulo: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.normal,
    color: cores.cinza[700],
  },
  rotuloAtivo: {
    fontFamily: fontes.media,
    color: cores.preto,
  },
});
