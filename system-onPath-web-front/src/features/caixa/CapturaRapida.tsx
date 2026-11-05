import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCapturarItem } from "@/dados/consultas";
import { t } from "@/i18n";

import { avisarErro } from "./avisos";
import { CampoAnotacao } from "./CampoAnotacao";

interface Props {
  aberta: boolean;
  aoMudar: (aberta: boolean) => void;
}

/** Campo rápido para anotar na caixa de qualquer tela (história 4). */
export function CapturaRapida({ aberta, aoMudar }: Props) {
  const capturar = useCapturarItem();

  async function aoSalvar(conteudo: string) {
    try {
      await capturar.mutateAsync(conteudo);
      aoMudar(false);
      toast(t("caixa.avisos.anotado"));
      return true;
    } catch (erro) {
      avisarErro(erro);
      return false;
    }
  }

  return (
    <Dialog open={aberta} onOpenChange={aoMudar}>
      <DialogContent className="top-[20%] translate-y-0 gap-3">
        <DialogHeader>
          <DialogTitle>{t("caixa.rapida.titulo")}</DialogTitle>
          <DialogDescription className="sr-only">{t("caixa.rapida.dica")}</DialogDescription>
        </DialogHeader>
        <CampoAnotacao
          aoSalvar={aoSalvar}
          focarAoMontar
          rotulo={t("caixa.campo")}
          placeholder={t("caixa.campo")}
          dica={t("caixa.rapida.dica")}
        />
      </DialogContent>
    </Dialog>
  );
}
