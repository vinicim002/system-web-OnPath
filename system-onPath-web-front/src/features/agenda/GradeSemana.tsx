import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import type { ItemAgenda } from "@/dados/contratos";
import { t } from "@/i18n";
import { dataLocal, diaDaSemana, horaLocal, minutosNoDia, somarDias } from "@/i18n/datas";
import { cn } from "@/lib/utils";

import { nomeDoDia } from "@/features/rotinas/dias";

import { HORA_FIM, HORA_INICIO, PX_POR_HORA, horaDoClique, posicionar } from "./grade";

interface Props {
  inicioSemana: string;
  hoje: string;
  itens: ItemAgenda[];
  corDaArea: (areaId: string | null) => string | undefined;
  aoClicarHorario: (data: string, hora: string) => void;
  aoClicarItem: (item: ItemAgenda) => void;
}

const HORAS = Array.from({ length: HORA_FIM - HORA_INICIO }, (_, i) => HORA_INICIO + i);

/** Minuto atual, atualizado a cada minuto, para a linha da hora. */
function useAgora(): string {
  const [agora, setAgora] = useState(() => new Date().toISOString());
  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(new Date().toISOString()), 60_000);
    return () => window.clearInterval(intervalo);
  }, []);
  return agora;
}

/** Grade da semana: sete dias, das 6h às 24h, com blocos e compromissos (FR-010). */
export function GradeSemana({ inicioSemana, hoje, itens, corDaArea, aoClicarHorario, aoClicarItem }: Props) {
  const agora = useAgora();
  const dias = Array.from({ length: 7 }, (_, i) => somarDias(inicioSemana, i));
  const alturaTotal = (HORA_FIM - HORA_INICIO) * PX_POR_HORA;
  const topoAgora = ((minutosNoDia(agora) - HORA_INICIO * 60) * PX_POR_HORA) / 60;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="grid min-w-200 grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
        <div className="sticky top-0 z-10 border-b bg-branco" />
        {dias.map((data) => (
          <div
            key={data}
            className={cn(
              "sticky top-0 z-10 flex flex-col items-center border-b border-l bg-branco py-2 text-pequeno",
              data === hoje && "font-semibold",
            )}
          >
            <span className="text-cinza-500">{nomeDoDia(diaDaSemana(data))}</span>
            <span className={cn("grid size-7 place-items-center rounded-full text-sm", data === hoje && "bg-preto text-branco")}>
              {Number(data.slice(8))}
            </span>
          </div>
        ))}

        <div className="relative" style={{ height: alturaTotal }}>
          {HORAS.map((hora) => (
            <span
              key={hora}
              className="absolute right-2 -translate-y-1/2 text-pequeno text-cinza-400 tabular-nums"
              style={{ top: (hora - HORA_INICIO) * PX_POR_HORA }}
            >
              {hora > HORA_INICIO ? `${String(hora).padStart(2, "0")}:00` : ""}
            </span>
          ))}
        </div>

        {dias.map((data) => {
          const doDia = posicionar(itens.filter((item) => dataLocal(item.inicio) === data));
          return (
            <div
              key={data}
              role="button"
              tabIndex={-1}
              aria-label={data}
              className={cn("relative cursor-pointer border-l", data === hoje && "bg-cinza-50")}
              style={{
                height: alturaTotal,
                backgroundImage: `repeating-linear-gradient(to bottom, var(--color-cinza-100) 0, var(--color-cinza-100) 1px, transparent 1px, transparent ${PX_POR_HORA}px)`,
              }}
              onClick={(evento) => {
                if (evento.target !== evento.currentTarget) return;
                const caixa = evento.currentTarget.getBoundingClientRect();
                aoClicarHorario(data, horaDoClique(evento.clientY - caixa.top));
              }}
            >
              {doDia.map(({ item, topo, altura, faixa, faixas }) => {
                const compromisso = item.tipo === "compromisso";
                const realizado = item.status === "realizado";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => aoClicarItem(item)}
                    className={cn(
                      "absolute flex flex-col items-start justify-start overflow-hidden rounded-md border-l-3 px-1.5 py-0.5 text-left text-pequeno leading-tight shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      compromisso ? "bg-preto text-branco" : "bg-cinza-100 text-preto hover:bg-cinza-200",
                      realizado && "opacity-60",
                    )}
                    style={{
                      top: topo + 1,
                      height: altura - 2,
                      left: `calc(${(faixa / faixas) * 100}% + 2px)`,
                      width: `calc(${100 / faixas}% - 4px)`,
                      borderLeftColor: corDaArea(item.areaId) ?? "var(--color-cinza-400)",
                    }}
                  >
                    <span className="flex max-w-full items-center gap-1 font-medium">
                      {realizado && <Check aria-label={t("agenda.realizado")} className="size-3 shrink-0" />}
                      <span className="truncate">{item.titulo}</span>
                    </span>
                    {altura >= 32 && (
                      <span className="block max-w-full truncate opacity-70 tabular-nums">
                        {horaLocal(item.inicio)}–{horaLocal(item.fim)}
                      </span>
                    )}
                  </button>
                );
              })}
              {data === hoje && topoAgora >= 0 && topoAgora <= alturaTotal && (
                <div aria-hidden className="pointer-events-none absolute inset-x-0 z-[1] h-0.5 bg-roxo" style={{ top: topoAgora }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
