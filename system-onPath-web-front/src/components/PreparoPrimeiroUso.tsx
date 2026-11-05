import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ehErroOnPath } from "@/dados/erros";
import { useServicos } from "@/dados/ServicosProvider";
import { t } from "@/i18n";
import { cores, espaco, fontes, tamanhos } from "@/theme";

type Estado = { fase: "carregando" } | { fase: "pronto" } | { fase: "erro"; mensagem: string };

/** Garante os dados iniciais antes de mostrar as telas. */
export function PreparoPrimeiroUso({ children }: { children: ReactNode }) {
  const { dados } = useServicos();
  const [estado, setEstado] = useState<Estado>({ fase: "carregando" });

  useEffect(() => {
    let ativo = true;
    dados
      .prepararPrimeiroUso()
      .then(() => ativo && setEstado({ fase: "pronto" }))
      .catch((erro: unknown) => {
        if (!ativo) return;
        const mensagem = ehErroOnPath(erro) ? erro.mensagem : t("erros.armazenamento_indisponivel");
        setEstado({ fase: "erro", mensagem });
      });
    return () => {
      ativo = false;
    };
  }, [dados]);

  if (estado.fase === "pronto") return children;

  return (
    <View style={estilos.centro}>
      {estado.fase === "carregando" ? (
        <>
          <ActivityIndicator color={cores.cinza[500]} />
          <Text style={estilos.texto}>{t("carregando")}</Text>
        </>
      ) : (
        <View role="alert" style={estilos.erro}>
          <Text style={estilos.titulo}>{estado.mensagem}</Text>
          <Text style={estilos.texto}>{t("erros.acao.liberarArmazenamento")}</Text>
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: espaco(3),
    padding: espaco(8),
    backgroundColor: cores.branco,
  },
  erro: {
    maxWidth: 480,
    gap: espaco(2),
  },
  titulo: {
    fontFamily: fontes.media,
    fontSize: tamanhos.normal,
    color: cores.preto,
  },
  texto: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.normal,
    color: cores.cinza[600],
  },
});
