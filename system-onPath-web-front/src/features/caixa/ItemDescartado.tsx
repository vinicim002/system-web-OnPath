import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRecuperarItem } from "@/dados/consultas";
import type { ItemCaixa } from "@/dados/tipos";
import { t } from "@/i18n";
import { dataCurta } from "@/i18n/datas";

import { avisarErro } from "./avisos";

interface Props {
  item: ItemCaixa;
}

/** Um item descartado: o texto, a data do descarte e o botão de recuperar (RN31). */
export function ItemDescartado({ item }: Props) {
  const recuperar = useRecuperarItem();

  async function aoRecuperar() {
    try {
      await recuperar.mutateAsync(item.id);
      toast(t("caixa.avisos.recuperado"));
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <li className="flex items-start gap-3 rounded-md px-3 py-2.5">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="break-words whitespace-pre-wrap text-cinza-600">{item.conteudo}</p>
        {item.arquivadoEm && (
          <p className="text-pequeno text-cinza-500">
            {t("caixa.descartadoEm", { data: dataCurta(item.arquivadoEm) })}
          </p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={aoRecuperar} disabled={recuperar.isPending}>
        <RotateCcw />
        {t("caixa.recuperar")}
      </Button>
    </li>
  );
}
