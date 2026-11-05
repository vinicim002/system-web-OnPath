import type { ItemAgenda } from "@/dados/contratos";
import { t } from "@/i18n";
import { dataLocal, dataPorExtenso, somarDias } from "@/i18n/datas";
import { cn } from "@/lib/utils";

import { horarioDoItem, statusDoItem, tipoCurto, type Areas } from "./rotulos";

interface Props {
  inicioSemana: string;
  hoje: string;
  itens: ItemAgenda[];
  areas: Areas;
  aoClicarItem: (item: ItemAgenda) => void;
}

/** Itens da semana agrupados por dia, em ordem de horário (cenário 4). */
export function VisaoLista({ inicioSemana, hoje, itens, areas, aoClicarItem }: Props) {
  const dias = Array.from({ length: 7 }, (_, i) => somarDias(inicioSemana, i))
    .map((data) => ({ data, doDia: itens.filter((item) => dataLocal(item.inicio) === data) }))
    .filter(({ doDia }) => doDia.length > 0);

  if (dias.length === 0) return <p className="py-8 text-center text-cinza-500">{t("agenda.vazia")}</p>;

  return (
    <div className="flex max-w-200 flex-col gap-6">
      {dias.map(({ data, doDia }) => (
        <section key={data} aria-labelledby={`lista-${data}`} className="flex flex-col gap-1">
          <h2 id={`lista-${data}`} className={cn("text-sm font-semibold first-letter:uppercase", data !== hoje && "text-cinza-600")}>
            {dataPorExtenso(data)}
          </h2>
          <ul className="flex flex-col divide-y rounded-lg border">
            {[...doDia]
              .sort((a, b) => a.inicio.localeCompare(b.inicio))
              .map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => aoClicarItem(item)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left outline-none hover:bg-cinza-50 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="w-24 shrink-0 text-pequeno text-cinza-500 tabular-nums">{horarioDoItem(item)}</span>
                    <span
                      aria-hidden
                      className="h-5 w-1 shrink-0 rounded-full"
                      style={{ background: areas.cor(item.areaId) ?? "var(--color-cinza-400)" }}
                    />
                    <span className={cn("min-w-0 flex-1 truncate", item.status === "realizado" && "text-cinza-500 line-through")}>
                      {item.titulo}
                    </span>
                    <span className="hidden text-pequeno text-cinza-500 sm:block">{areas.nome(item.areaId)}</span>
                    <span className="shrink-0 text-right text-pequeno whitespace-nowrap text-cinza-500">
                      {[tipoCurto(item), statusDoItem(item)].filter(Boolean).join(" · ")}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
