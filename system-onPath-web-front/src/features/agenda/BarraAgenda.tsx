import { CalendarDays, ChartGantt, ChevronLeft, ChevronRight, Columns3, List, PanelLeftOpen, Table2, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Area } from "@/dados/tipos";
import { t } from "@/i18n";
import { dataPrazo, somarDias } from "@/i18n/datas";
import { cn } from "@/lib/utils";

import { FiltroAgenda } from "./FiltroAgenda";
import { VISOES, type FiltroAgenda as Filtro, type Visao } from "./visoes";

const ICONES: Record<Visao, LucideIcon> = {
  semana: CalendarDays,
  board: Columns3,
  timeline: ChartGantt,
  lista: List,
  tabela: Table2,
};

interface Props {
  semana: string;
  visao: Visao;
  filtro: Filtro;
  areas: Area[];
  painelRecolhido: boolean;
  aoAbrirPainel: () => void;
  aoIrPara: (semana: string | null) => void;
  aoMudarVisao: (visao: Visao) => void;
  aoMudarFiltro: (filtro: Filtro) => void;
}

/** Semana, visões (como abas, à moda do Board/Timeline/List/Table) e filtro (FR-001 e FR-002). */
export function BarraAgenda({ semana, visao, filtro, areas, painelRecolhido, aoAbrirPainel, aoIrPara, aoMudarVisao, aoMudarFiltro }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {painelRecolhido && (
          <Button variant="outline" size="icon-sm" aria-label={t("agenda.painel.abrir")} title={t("agenda.painel.abrir")} onClick={aoAbrirPainel}>
            <PanelLeftOpen />
          </Button>
        )}
        <Button variant="outline" size="icon-sm" aria-label={t("agenda.semanaAnterior")} onClick={() => aoIrPara(somarDias(semana, -7))}>
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label={t("agenda.proximaSemana")} onClick={() => aoIrPara(somarDias(semana, 7))}>
          <ChevronRight />
        </Button>
        <Button variant="outline" size="sm" onClick={() => aoIrPara(null)}>
          {t("agenda.hoje")}
        </Button>
        <span className="ml-2 font-medium">
          {dataPrazo(semana)} – {dataPrazo(somarDias(semana, 6))}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b">
        <div role="group" aria-label={t("agenda.visoes.rotulo")} className="-mb-px flex">
          {VISOES.map((opcao) => {
            const Icone = ICONES[opcao];
            const ativa = opcao === visao;
            return (
              <button
                key={opcao}
                type="button"
                aria-pressed={ativa}
                onClick={() => aoMudarVisao(opcao)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  ativa ? "border-roxo font-medium text-preto" : "border-transparent text-cinza-500 hover:text-preto",
                )}
              >
                <Icone className="size-4" aria-hidden />
                {t(`agenda.visoes.${opcao}`)}
              </button>
            );
          })}
        </div>
        <FiltroAgenda filtro={filtro} areas={areas} aoMudar={aoMudarFiltro} />
      </div>
    </div>
  );
}
