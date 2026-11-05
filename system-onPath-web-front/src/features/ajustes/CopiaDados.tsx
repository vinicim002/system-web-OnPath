import { useState } from "react";

import { Botao } from "@/components/Botao";
import { useExistemDados, useExportarDados, useImportarDados } from "@/dados/consultas";
import { ehErroOnPath } from "@/dados/erros";
import { t } from "@/i18n";
import { baixarJson, escolherArquivoJson } from "@/plataforma/arquivos";

import estilos from "./CopiaDados.module.css";

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
  const bloqueado = exportar.isPending || importar.isPending || aguardandoConfirmacao !== null;

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
    <section className={estilos.secao}>
      <h2 className={estilos.titulo}>{t("ajustes.copia.titulo")}</h2>
      <p className={estilos.descricao}>{t("ajustes.copia.descricao")}</p>

      <div className={estilos.acoes}>
        <Botao
          rotulo={exportar.isPending ? t("ajustes.copia.exportando") : t("ajustes.copia.exportar")}
          aoClicar={aoExportar}
          desativado={bloqueado}
        />
        <Botao
          rotulo={importar.isPending ? t("ajustes.copia.importando") : t("ajustes.copia.importar")}
          aoClicar={aoImportar}
          desativado={bloqueado}
        />
      </div>

      {aguardandoConfirmacao !== null && (
        <div role="alertdialog" aria-label={t("ajustes.copia.titulo")} className={estilos.confirmacao}>
          <p className={estilos.destaque}>{t("ajustes.copia.confirmarSubstituir")}</p>
          <div className={estilos.acoes}>
            <Botao
              variante="principal"
              rotulo={t("ajustes.copia.confirmar")}
              aoClicar={() => substituir(aguardandoConfirmacao)}
            />
            <Botao
              rotulo={t("ajustes.copia.cancelar")}
              aoClicar={() => setAguardandoConfirmacao(null)}
            />
          </div>
        </div>
      )}

      {aviso && (
        <div
          role={aviso.tipo === "erro" ? "alert" : "status"}
          className={`${estilos.aviso} ${aviso.tipo === "erro" ? estilos.avisoErro : ""}`}
        >
          <p className={estilos.destaque}>{aviso.mensagem}</p>
          {aviso.acao && <p className={estilos.descricao}>{aviso.acao}</p>}
        </div>
      )}
    </section>
  );
}
