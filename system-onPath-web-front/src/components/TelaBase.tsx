import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { cores, espaco, fontes, tamanhos } from "@/theme";

interface Props {
  titulo: string;
  children?: ReactNode;
}

export function TelaBase({ titulo, children }: Props) {
  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text role="heading" aria-level={1} style={estilos.titulo}>
        {titulo}
      </Text>
      {children}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.branco,
  },
  conteudo: {
    paddingHorizontal: espaco(10),
    paddingVertical: espaco(8),
    gap: espaco(6),
  },
  titulo: {
    fontFamily: fontes.seminegrito,
    fontSize: tamanhos.titulo,
    color: cores.preto,
  },
});
