import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useExistemDados, useExportarDados, useImportarDados } from "@/dados/consultas";
import { ehErroOnPath } from "@/dados/erros";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { baixarJson, escolherArquivoJson } from "@/plataforma/arquivos";

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
    <section className="flex max-w-140 flex-col gap-3">
      <h2 className="text-subtitulo font-semibold">{t("ajustes.copia.titulo")}</h2>
      <p className="text-cinza-600">{t("ajustes.copia.descricao")}</p>

      <div className="flex gap-2">
        <Button variant="outline" onClick={aoExportar} disabled={bloqueado}>
          {exportar.isPending ? t("ajustes.copia.exportando") : t("ajustes.copia.exportar")}
        </Button>
        <Button variant="outline" onClick={aoImportar} disabled={bloqueado}>
          {importar.isPending ? t("ajustes.copia.importando") : t("ajustes.copia.importar")}
        </Button>
      </div>

      <AlertDialog
        open={aguardandoConfirmacao !== null}
        onOpenChange={(aberto) => !aberto && setAguardandoConfirmacao(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ajustes.copia.tituloSubstituir")}</AlertDialogTitle>
            <AlertDialogDescription>{t("ajustes.copia.confirmarSubstituir")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("ajustes.copia.cancelar")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => aguardandoConfirmacao !== null && substituir(aguardandoConfirmacao)}
            >
              {t("ajustes.copia.confirmar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {aviso && (
        <div
          role={aviso.tipo === "erro" ? "alert" : "status"}
          className={cn(
            "flex flex-col gap-1 rounded-md bg-cinza-100 p-3",
            aviso.tipo === "erro" && "border-l-3 border-preto",
          )}
        >
          <p className="font-medium">{aviso.mensagem}</p>
          {aviso.acao && <p className="text-cinza-600">{aviso.acao}</p>}
        </div>
      )}
    </section>
  );
}
