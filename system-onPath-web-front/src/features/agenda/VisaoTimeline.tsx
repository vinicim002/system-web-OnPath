import type { ItemAgenda } from "@/dados/contratos";
import { dataLocal, diaDaSemana, minutosNoDia, somarDias } from "@/i18n/datas";
import { cn } from "@/lib/utils";

import { nomeDoDia } from "@/features/rotinas/dias";

import { HORA_FIM, HORA_INICIO, posicionar } from "./grade";
import { horarioDoItem, type Areas } from "./rotulos";
import { useAgora } from "./useAgora";

interface Props {
  inicioSemana: string;
  hoje: string;
  itens: ItemAgenda[];
  areas: Areas;
  aoClicarItem: (item: ItemAgenda) => void;
}

const ALTURA_LINHA = 56;
const TOTAL_MIN = (HORA_FIM - HORA_INICIO) * 60;
const MARCAS = Array.from({ length: (HORA_FIM - HORA_INICIO) / 2 + 1 }, (_, i) => HORA_INICIO + i * 2);
const porcento = (minutos: number) => `${((Math.min(Math.max(minutos, HORA_INICIO * 60), HORA_FIM * 60) - HORA_INICIO * 60) / TOTAL_MIN) * 100}%`;

/** Um dia por linha e as horas na horizontal, com a linha de agora (cenário 3). */
export function VisaoTimeline({ inicioSemana, hoje, itens, areas, aoClicarItem }: Props) {
  const agora = useAgora();
  const dias = Array.from({ length: 7 }, (_, i) => somarDias(inicioSemana, i));
  const semanaTemHoje = dias.includes(hoje);

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="relative grid min-w-240 grid-cols-[6rem_1fr]">
        <div className="border-b" />
        <div className="relative h-8 border-b">
          {MARCAS.map((hora) => (
            <span
              key={hora}
              className="absolute top-2 -translate-x-1/2 text-pequeno text-cinza-400 tabular-nums first:translate-x-0 last:-translate-x-full"
              style={{ left: porcento(hora * 60) }}
            >
              {String(hora).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        {dias.map((data) => {
          const doDia = posicionar(itens.filter((item) => dataLocal(item.inicio) === data));
          return (
            <div key={data} className="contents">
              <div className={cn("flex items-center gap-2 border-b px-3 text-pequeno", data === hoje ? "font-semibold" : "text-cinza-600")}>
                <span>{nomeDoDia(diaDaSemana(data))}</span>
                <span className={cn("grid size-6 place-items-center rounded-full", data === hoje && "bg-preto text-branco")}>
                  {Number(data.slice(8))}
                </span>
              </div>
              <div
                className={cn("relative border-b border-l", data === hoje && "bg-cinza-50")}
                style={{
                  height: ALTURA_LINHA,
                  backgroundImage: `repeating-linear-gradient(to right, var(--color-cinza-100) 0, var(--color-cinza-100) 1px, transparent 1px, transparent ${100 / ((HORA_FIM - HORA_INICIO) / 2)}%)`,
                }}
              >
                {doDia.map(({ item, faixa, faixas }) => {
                  const altura = (ALTURA_LINHA - 8) / faixas;
                  const compromisso = item.tipo === "compromisso";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={`${item.titulo} · ${horarioDoItem(item)}`}
                      onClick={() => aoClicarItem(item)}
                      className={cn(
                        "absolute flex items-center overflow-hidden rounded-md border-l-3 px-1.5 text-left text-pequeno leading-none shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        compromisso ? "bg-preto text-branco" : "bg-cinza-200 text-preto hover:bg-cinza-300",
                        item.status === "realizado" && "opacity-60",
                      )}
                      style={{
                        left: porcento(minutosNoDia(item.inicio)),
                        width: `max(calc(${porcento(minutosNoDia(item.fim) || HORA_FIM * 60)} - ${porcento(minutosNoDia(item.inicio))} - 2px), 6px)`,
                        top: 4 + faixa * altura,
                        height: altura - 2,
                        borderLeftColor: areas.cor(item.areaId) ?? "var(--color-cinza-400)",
                      }}
                    >
                      <span className="truncate font-medium">{item.titulo}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {semanaTemHoje && minutosNoDia(agora) >= HORA_INICIO * 60 && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-8 bottom-0 z-[1] w-0.5 -translate-x-1/2 bg-roxo"
            style={{ left: `calc(6rem + (100% - 6rem) * ${(minutosNoDia(agora) - HORA_INICIO * 60) / TOTAL_MIN})` }}
          />
        )}
      </div>
    </div>
  );
}
