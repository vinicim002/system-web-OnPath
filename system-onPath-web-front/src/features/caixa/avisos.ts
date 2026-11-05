import { toast } from "sonner";

import { ehErroOnPath } from "@/dados/erros";
import { t } from "@/i18n";

/** Aviso de erro com o que aconteceu e o que fazer (constituição: "todo erro informa…"). */
export function avisarErro(erro: unknown): void {
  if (!ehErroOnPath(erro)) {
    toast.error(t("erros.armazenamento_indisponivel"), {
      description: t("erros.acao.liberarArmazenamento"),
    });
    return;
  }
  toast.error(erro.mensagem, {
    description:
      erro.codigo === "armazenamento_indisponivel"
        ? t("erros.acao.liberarArmazenamento")
        : undefined,
  });
}
