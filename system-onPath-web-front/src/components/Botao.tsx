import { Pressable, StyleSheet, Text } from "react-native";

import { cores, espaco, fontes, tamanhos } from "@/theme";

interface Props {
  rotulo: string;
  aoPressionar: () => void;
  variante?: "principal" | "secundario";
  desativado?: boolean;
}

export function Botao({ rotulo, aoPressionar, variante = "secundario", desativado = false }: Props) {
  const principal = variante === "principal";
  return (
    <Pressable
      role="button"
      onPress={aoPressionar}
      disabled={desativado}
      style={({ pressed }) => [
        estilos.botao,
        principal ? estilos.principal : estilos.secundario,
        pressed && (principal ? estilos.principalPressionado : estilos.secundarioPressionado),
        desativado && estilos.desativado,
      ]}
    >
      <Text style={[estilos.rotulo, principal && estilos.rotuloPrincipal]}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    paddingHorizontal: espaco(4),
    paddingVertical: espaco(2),
    borderRadius: espaco(2),
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  principal: {
    backgroundColor: cores.preto,
    borderColor: cores.preto,
  },
  principalPressionado: {
    backgroundColor: cores.cinza[800],
  },
  secundario: {
    backgroundColor: cores.branco,
    borderColor: cores.cinza[300],
  },
  secundarioPressionado: {
    backgroundColor: cores.cinza[100],
  },
  desativado: {
    opacity: 0.5,
  },
  rotulo: {
    fontFamily: fontes.media,
    fontSize: tamanhos.normal,
    color: cores.preto,
  },
  rotuloPrincipal: {
    color: cores.branco,
  },
});
