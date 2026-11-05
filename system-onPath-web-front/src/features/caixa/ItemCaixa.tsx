import { ListChecks, Pencil, X } from "lucide-react";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ItemCaixa as Item } from "@/dados/tipos";
import { t } from "@/i18n";
import { tempoRelativo } from "@/i18n/datas";

import type { AcoesCaixa } from "./acoes";
import { CampoAnotacao } from "./CampoAnotacao";
import { VirarTarefa } from "./VirarTarefa";

interface Props {
  item: Item;
  acoes: AcoesCaixa;
}

/** Um item novo da caixa: o texto inteiro, há quanto tempo foi anotado e as ações. */
function ItemCaixaBase({ item, acoes }: Props) {
  const [editando, setEditando] = useState(false);
  const [virando, setVirando] = useState(false);

  async function aoSalvarEdicao(conteudo: string) {
    const salvou = conteudo === item.conteudo || (await acoes.editar(item.id, conteudo));
    if (salvou) setEditando(false);
    return salvou;
  }

  if (editando) {
    return (
      <li className="px-3 py-2.5">
        <CampoAnotacao
          aoSalvar={aoSalvarEdicao}
          aoCancelar={() => setEditando(false)}
          valorInicial={item.conteudo}
          limparAoSalvar={false}
          focarAoMontar
          rotulo={t("caixa.editar")}
          dica={t("caixa.dicaEdicao")}
        />
      </li>
    );
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
          aria-label={t("caixa.virarTarefa")}
          title={t("caixa.virarTarefa")}
          onClick={() => setVirando(true)}
        >
          <ListChecks />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("caixa.editar")}
          title={t("caixa.editar")}
          onClick={() => setEditando(true)}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("caixa.descartar")}
          title={t("caixa.descartar")}
          onClick={() => void acoes.descartar(item.id)}
        >
          <X />
        </Button>
      </div>
      {virando && <VirarTarefa item={item} aberto={virando} aoMudar={setVirando} />}
    </li>
  );
}

/** Só redesenha o item quando o texto ou as ações mudam. */
export const ItemCaixa = memo(
  ItemCaixaBase,
  (antes, depois) =>
    antes.acoes === depois.acoes &&
    antes.item.id === depois.item.id &&
    antes.item.conteudo === depois.item.conteudo &&
    antes.item.criadoEm === depois.item.criadoEm,
);
