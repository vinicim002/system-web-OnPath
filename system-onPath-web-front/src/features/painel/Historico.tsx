import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";

import { lerCommit, type Categoria, type CommitBruto, type EntradaHistorico } from "./historico";

const CATEGORIAS: Categoria[] = [
  "adicionado",
  "alterado",
  "corrigido",
  "retirado",
  "documentacao",
  "manutencao",
];

const dia = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const hora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

async function buscarHistorico(): Promise<EntradaHistorico[]> {
  const resposta = await fetch("/__onpath/historico");
  if (!resposta.ok) throw new Error(String(resposta.status));
  const commits = (await resposta.json()) as CommitBruto[];
  return commits.map(lerCommit);
}

function agruparPorDia(entradas: EntradaHistorico[]): [string, EntradaHistorico[]][] {
  const grupos = new Map<string, EntradaHistorico[]>();
  for (const entrada of entradas) {
    const chave = dia.format(new Date(entrada.data));
    grupos.set(chave, [...(grupos.get(chave) ?? []), entrada]);
  }
  return [...grupos];
}

/** Histórico do git, com as categorias dos commits (adicionado, alterado, retirado…). */
export function Historico() {
  const [filtro, setFiltro] = useState<Categoria | null>(null);
  const { data = [], isError } = useQuery({ queryKey: ["painel", "historico"], queryFn: buscarHistorico });

  if (isError) return <p className="text-cinza-600">{t("painel.historico.erro")}</p>;

  const filtradas = filtro ? data.filter((entrada) => entrada.categoria === filtro) : data;

  return (
    <div className="flex max-w-200 flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={filtro === null ? "default" : "outline"} onClick={() => setFiltro(null)}>
          {t("painel.historico.todos")} <span className="opacity-60">{data.length}</span>
        </Button>
        {CATEGORIAS.map((categoria) => {
          const quantidade = data.filter((entrada) => entrada.categoria === categoria).length;
          if (quantidade === 0) return null;
          return (
            <Button
              key={categoria}
              size="sm"
              variant={filtro === categoria ? "default" : "outline"}
              onClick={() => setFiltro(categoria)}
            >
              {t(`painel.historico.categorias.${categoria}`)} <span className="opacity-60">{quantidade}</span>
            </Button>
          );
        })}
      </div>

      {filtradas.length === 0 && <p className="text-cinza-600">{t("painel.historico.vazio")}</p>}

      {agruparPorDia(filtradas).map(([data, entradas]) => (
        <section key={data} className="flex flex-col gap-2">
          <h2 className="text-pequeno font-medium text-cinza-500 first-letter:uppercase">{data}</h2>
          <ul className="flex flex-col divide-y divide-cinza-100 rounded-lg border">
            {entradas.map((entrada) => (
              <li key={entrada.hash} className="flex items-start gap-3 px-4 py-2.5">
                <span
                  className={cn(
                    "mt-0.5 w-28 shrink-0 rounded-sm px-1.5 py-0.5 text-center text-pequeno",
                    entrada.categoria === "retirado"
                      ? "bg-preto text-branco"
                      : entrada.categoria === "adicionado"
                        ? "bg-cinza-800 text-branco"
                        : "bg-cinza-100 text-cinza-700",
                  )}
                >
                  {t(`painel.historico.categorias.${entrada.categoria}`)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p>
                    {entrada.escopo && <span className="text-cinza-500">{entrada.escopo}: </span>}
                    {entrada.descricao}
                  </p>
                  {entrada.quebra && (
                    <p className="text-pequeno font-medium">{t("painel.historico.quebra")}</p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-pequeno text-cinza-400">
                  {hora.format(new Date(entrada.data))} · {entrada.hash.slice(0, 7)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
