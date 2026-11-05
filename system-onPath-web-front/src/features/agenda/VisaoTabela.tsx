import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

import type { ItemAgenda } from "@/dados/contratos";
import { t } from "@/i18n";
import { dataLocal, dataPrazo } from "@/i18n/datas";

import { duracaoDoItem, horarioDoItem, statusDoItem, tipoCurto, type Areas } from "./rotulos";
import { ordenarItens, type ColunaTabela, type Direcao } from "./visoes";

interface Props {
  itens: ItemAgenda[];
  areas: Areas;
  aoClicarItem: (item: ItemAgenda) => void;
}

const COLUNAS: { coluna: ColunaTabela | null; chave: "titulo" | "tipo" | "area" | "inicio" | "duracao" | "status" }[] = [
  { coluna: "titulo", chave: "titulo" },
  { coluna: "tipo", chave: "tipo" },
  { coluna: null, chave: "area" },
  { coluna: "inicio", chave: "inicio" },
  { coluna: "duracao", chave: "duracao" },
  { coluna: "status", chave: "status" },
];

/** Uma linha por item, com colunas ordenáveis (cenário 5). */
export function VisaoTabela({ itens, areas, aoClicarItem }: Props) {
  const [ordem, setOrdem] = useState<{ coluna: ColunaTabela; direcao: Direcao }>({ coluna: "inicio", direcao: "asc" });

  if (itens.length === 0) return <p className="py-8 text-center text-cinza-500">{t("agenda.vazia")}</p>;
  const linhas = ordenarItens(itens, ordem.coluna, ordem.direcao);

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-180 text-sm">
        <thead className="bg-cinza-50 text-left text-pequeno text-cinza-500">
          <tr>
            {COLUNAS.map(({ coluna, chave }) => {
              const ativa = coluna !== null && coluna === ordem.coluna;
              return (
                <th
                  key={chave}
                  scope="col"
                  className="px-3 py-2 font-medium"
                  aria-sort={ativa ? (ordem.direcao === "asc" ? "ascending" : "descending") : undefined}
                >
                  {coluna === null ? (
                    t(`agenda.colunas.${chave}`)
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-sm outline-none hover:text-preto focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() =>
                        setOrdem({ coluna, direcao: ativa && ordem.direcao === "asc" ? "desc" : "asc" })
                      }
                    >
                      {t(`agenda.colunas.${chave}`)}
                      {ativa && (ordem.direcao === "asc" ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />)}
                    </button>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y">
          {linhas.map((item) => (
            <tr key={item.id} className="hover:bg-cinza-50">
              <td className="px-3 py-2">
                <button
                  type="button"
                  className="flex items-center gap-2 text-left font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => aoClicarItem(item)}
                >
                  <span aria-hidden className="h-4 w-1 shrink-0 rounded-full" style={{ background: areas.cor(item.areaId) ?? "var(--color-cinza-400)" }} />
                  {item.titulo}
                </button>
              </td>
              <td className="px-3 py-2 text-cinza-600">{tipoCurto(item)}</td>
              <td className="px-3 py-2 text-cinza-600">{areas.nome(item.areaId)}</td>
              <td className="px-3 py-2 text-cinza-600 tabular-nums">
                {dataPrazo(dataLocal(item.inicio))}, {horarioDoItem(item)}
              </td>
              <td className="px-3 py-2 text-cinza-600 tabular-nums">{duracaoDoItem(item)}</td>
              <td className="px-3 py-2 text-cinza-600">{statusDoItem(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
