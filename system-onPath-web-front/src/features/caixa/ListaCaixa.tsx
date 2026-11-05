import { useItensNovos } from "@/dados/consultas";
import { t } from "@/i18n";

import { ItemCaixa } from "./ItemCaixa";

/** Itens novos da caixa, do mais novo para o mais antigo. */
export function ListaCaixa() {
  const { data: itens = [] } = useItensNovos();

  if (itens.length === 0) {
    return <p className="max-w-140 text-cinza-600">{t("caixa.vazia")}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-cinza-100">
      {itens.map((item) => (
        <ItemCaixa key={item.id} item={item} />
      ))}
    </ul>
  );
}
