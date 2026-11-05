import type { ItemCaixa as Item } from "@/dados/tipos";
import { tempoRelativo } from "@/i18n/datas";

interface Props {
  item: Item;
}

/** Um item novo da caixa: o texto inteiro e há quanto tempo foi anotado. */
export function ItemCaixa({ item }: Props) {
  return (
    <li className="group flex items-start gap-3 rounded-md px-3 py-2.5 hover:bg-cinza-50 focus-within:bg-cinza-50">
      <p className="min-w-0 flex-1 break-words whitespace-pre-wrap">{item.conteudo}</p>
      <time dateTime={item.criadoEm} className="shrink-0 pt-0.5 text-pequeno text-cinza-500">
        {tempoRelativo(item.criadoEm)}
      </time>
    </li>
  );
}
