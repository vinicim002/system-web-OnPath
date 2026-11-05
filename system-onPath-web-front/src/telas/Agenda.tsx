import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";

import { TelaBase } from "@/components/TelaBase";
import { Button } from "@/components/ui/button";
import { useAgenda, useOpcoesTarefa } from "@/dados/consultas";
import type { ItemAgenda } from "@/dados/contratos";
import { CriarNaAgenda } from "@/features/agenda/CriarNaAgenda";
import { DetalheItem } from "@/features/agenda/DetalheItem";
import { GradeSemana } from "@/features/agenda/GradeSemana";
import { useHoje } from "@/features/hoje/useHoje";
import { t } from "@/i18n";
import { dataPrazo, inicioDaSemana, instanteLocal, somarDias } from "@/i18n/datas";

/** Agenda semanal com compromissos e blocos (seção 6.9). */
export function Agenda() {
  const hoje = useHoje();
  const [parametros, setParametros] = useSearchParams();
  const semana = inicioDaSemana(parametros.get("semana") ?? hoje);
  const { data: itens = [] } = useAgenda(instanteLocal(semana, "00:00"), instanteLocal(somarDias(semana, 7), "00:00"));
  const { data: opcoes } = useOpcoesTarefa();
  const [criarEm, setCriarEm] = useState<{ data: string; hora: string } | null>(null);
  const [aberto, setAberto] = useState<ItemAgenda | null>(null);

  const cores = new Map((opcoes?.areas ?? []).map((a) => [a.id, a.cor]));
  const irPara = (data: string) => setParametros(data === inicioDaSemana(hoje) ? {} : { semana: data }, { replace: true });

  return (
    <TelaBase titulo={t("telas.agenda.titulo")}>
      <div className="-mt-2 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon-sm" aria-label={t("agenda.semanaAnterior")} onClick={() => irPara(somarDias(semana, -7))}>
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label={t("agenda.proximaSemana")} onClick={() => irPara(somarDias(semana, 7))}>
          <ChevronRight />
        </Button>
        <Button variant="outline" size="sm" onClick={() => irPara(inicioDaSemana(hoje))}>
          {t("agenda.hoje")}
        </Button>
        <span className="ml-2 font-medium">
          {dataPrazo(semana)} – {dataPrazo(somarDias(semana, 6))}
        </span>
      </div>
      <GradeSemana
        inicioSemana={semana}
        hoje={hoje}
        itens={itens}
        corDaArea={(areaId) => (areaId ? cores.get(areaId) : undefined)}
        aoClicarHorario={(data, hora) => setCriarEm({ data, hora })}
        aoClicarItem={setAberto}
      />
      <CriarNaAgenda inicial={criarEm} aoFechar={() => setCriarEm(null)} />
      <DetalheItem key={aberto?.id} item={aberto} aoFechar={() => setAberto(null)} />
    </TelaBase>
  );
}
