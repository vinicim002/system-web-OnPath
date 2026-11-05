import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDescartarItem, useRecuperarItem } from "@/dados/consultas";
import type { ItemCaixa as Item } from "@/dados/tipos";
import { t } from "@/i18n";
import { tempoRelativo } from "@/i18n/datas";

import { avisarErro } from "./avisos";

interface Props {
  item: Item;
}

/** Um item novo da caixa: o texto inteiro, há quanto tempo foi anotado e as ações. */
export function ItemCaixa({ item }: Props) {
  const descartar = useDescartarItem();
  const recuperar = useRecuperarItem();

  async function aoDescartar() {
    try {
      await descartar.mutateAsync(item.id);
      toast(t("caixa.avisos.descartado"), {
        duration: 5000,
        action: {
          label: t("caixa.avisos.desfazer"),
          onClick: () => recuperar.mutateAsync(item.id).catch(avisarErro),
        },
      });
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <li className="group flex items-start gap-3 rounded-md px-3 py-2.5 hover:bg-cinza-50 focus-within:bg-cinza-50">
      <p className="min-w-0 flex-1 break-words whitespace-pre-wrap">{item.conteudo}</p>
      <time dateTime={item.criadoEm} className="shrink-0 pt-0.5 text-pequeno text-cinza-500">
        {tempoRelativo(item.criadoEm)}
      </time>
      <div className="-my-1 flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("caixa.descartar")}
          title={t("caixa.descartar")}
          onClick={aoDescartar}
          disabled={descartar.isPending}
        >
          <X />
        </Button>
      </div>
    </li>
  );
}
