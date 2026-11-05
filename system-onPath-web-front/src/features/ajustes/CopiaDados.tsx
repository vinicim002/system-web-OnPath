import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Botao } from "@/components/Botao";
import { useExistemDados, useExportarDados, useImportarDados } from "@/dados/consultas";
import { ehErroOnPath } from "@/dados/erros";
import { t } from "@/i18n";
import { baixarJson, escolherArquivoJson } from "@/plataforma/arquivos.web";
import { cores, espaco, fontes, tamanhos } from "@/theme";

type Aviso = { tipo: "sucesso" | "erro"; mensagem: string; acao?: string } | null;

function dataLocal(data: Date): string {
  const doisDigitos = (n: number) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

function avisoDeErro(erro: unknown): Aviso {
  if (ehErroOnPath(erro)) {
    return {
      tipo: "erro",
      mensagem: erro.mensagem,
      acao:
        erro.codigo === "armazenamento_indisponivel"
          ? t("erros.acao.liberarArmazenamento")
          : undefined,
    };
  }
  return { tipo: "erro", mensagem: t("erros.copia_invalida") };
}

export function CopiaDados() {
  const exportar = useExportarDados();
  const importar = useImportarDados();
  const existemDados = useExistemDados();

  const [aviso, setAviso] = useState<Aviso>(null);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState<string | null>(null);
  const ocupado = exportar.isPending || importar.isPending;

  async function aoExportar() {
    setAviso(null);
    try {
      const copia = await exportar.mutateAsync();
      baixarJson(`onpath-copia-${dataLocal(new Date())}.json`, copia);
      setAviso({ tipo: "sucesso", mensagem: t("ajustes.copia.exportado") });
    } catch (erro) {
      setAviso(avisoDeErro(erro));
    }
  }

  async function substituir(conteudo: string) {
    setAguardandoConfirmacao(null);
    try {
      const { registros } = await importar.mutateAsync(conteudo);
      setAviso({ tipo: "sucesso", mensagem: t("ajustes.copia.importado", { registros }) });
    } catch (erro) {
      setAviso(avisoDeErro(erro));
    }
  }

  async function aoImportar() {
    setAviso(null);
    try {
      const conteudo = await escolherArquivoJson();
      if (conteudo === null) return;
      if (await existemDados()) setAguardandoConfirmacao(conteudo);
      else await substituir(conteudo);
    } catch (erro) {
      setAviso(avisoDeErro(erro));
    }
  }

  return (
    <View style={estilos.secao}>
      <Text role="heading" aria-level={2} style={estilos.titulo}>
        {t("ajustes.copia.titulo")}
      </Text>
      <Text style={estilos.descricao}>{t("ajustes.copia.descricao")}</Text>

      <View style={estilos.acoes}>
        <Botao
          rotulo={exportar.isPending ? t("ajustes.copia.exportando") : t("ajustes.copia.exportar")}
          aoPressionar={aoExportar}
          desativado={ocupado || aguardandoConfirmacao !== null}
        />
        <Botao
          rotulo={importar.isPending ? t("ajustes.copia.importando") : t("ajustes.copia.importar")}
          aoPressionar={aoImportar}
          desativado={ocupado || aguardandoConfirmacao !== null}
        />
      </View>

      {aguardandoConfirmacao !== null && (
        <View role="alertdialog" style={estilos.confirmacao}>
          <Text style={estilos.textoAviso}>{t("ajustes.copia.confirmarSubstituir")}</Text>
          <View style={estilos.acoes}>
            <Botao
              variante="principal"
              rotulo={t("ajustes.copia.confirmar")}
              aoPressionar={() => substituir(aguardandoConfirmacao)}
            />
            <Botao
              rotulo={t("ajustes.copia.cancelar")}
              aoPressionar={() => setAguardandoConfirmacao(null)}
            />
          </View>
        </View>
      )}

      {aviso && (
        <View
          role={aviso.tipo === "erro" ? "alert" : "status"}
          style={[estilos.aviso, aviso.tipo === "erro" && estilos.avisoErro]}
        >
          <Text style={estilos.textoAviso}>{aviso.mensagem}</Text>
          {aviso.acao && <Text style={estilos.descricao}>{aviso.acao}</Text>}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  secao: {
    maxWidth: 560,
    gap: espaco(3),
  },
  titulo: {
    fontFamily: fontes.seminegrito,
    fontSize: tamanhos.subtitulo,
    color: cores.preto,
  },
  descricao: {
    fontFamily: fontes.regular,
    fontSize: tamanhos.normal,
    color: cores.cinza[600],
  },
  acoes: {
    flexDirection: "row",
    gap: espaco(2),
  },
  confirmacao: {
    gap: espaco(3),
    padding: espaco(4),
    borderRadius: espaco(2),
    borderWidth: 1,
    borderColor: cores.cinza[300],
    backgroundColor: cores.cinza[50],
  },
  aviso: {
    gap: espaco(1),
    padding: espaco(3),
    borderRadius: espaco(2),
    backgroundColor: cores.cinza[100],
  },
  avisoErro: {
    borderLeftWidth: 3,
    borderLeftColor: cores.preto,
  },
  textoAviso: {
    fontFamily: fontes.media,
    fontSize: tamanhos.normal,
    color: cores.preto,
  },
});
