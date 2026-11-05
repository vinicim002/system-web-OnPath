import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { TelaBase } from "@/components/TelaBase";
import { useAgenda, useOpcoesTarefa } from "@/dados/consultas";
import type { ItemAgenda } from "@/dados/contratos";
import { BarraAgenda } from "@/features/agenda/BarraAgenda";
import { ConfirmarConflito } from "@/features/agenda/ConfirmarConflito";
import { CriarNaAgenda } from "@/features/agenda/CriarNaAgenda";
import { DetalheItem } from "@/features/agenda/DetalheItem";
import { GradeSemana } from "@/features/agenda/GradeSemana";
import type { Areas } from "@/features/agenda/rotulos";
import { useMoverItem } from "@/features/agenda/useMoverItem";
import { CartaoItem, VisaoBoard, type DadosAlvo, type DadosArrasto } from "@/features/agenda/VisaoBoard";
import { VisaoLista } from "@/features/agenda/VisaoLista";
import { VisaoTabela } from "@/features/agenda/VisaoTabela";
import { VisaoTimeline } from "@/features/agenda/VisaoTimeline";
import { escreverFiltro, filtrarItens, lerFiltro, lerVisao, type Visao } from "@/features/agenda/visoes";
import { useHoje } from "@/features/hoje/useHoje";
import { t } from "@/i18n";
import { inicioDaSemana, instanteLocal, somarDias } from "@/i18n/datas";

/** Agenda: a semana em cinco visões, com filtro (seção 6.9; specs/010-agenda-visoes). */
export function Agenda() {
  const hoje = useHoje();
  const [parametros, setParametros] = useSearchParams();
  const semana = inicioDaSemana(parametros.get("semana") ?? hoje);
  const visao = lerVisao(parametros);
  const filtro = useMemo(() => lerFiltro(parametros), [parametros]);
  const { data: todos = [] } = useAgenda(instanteLocal(semana, "00:00"), instanteLocal(somarDias(semana, 7), "00:00"));
  const itens = useMemo(() => filtrarItens(todos, filtro), [todos, filtro]);
  const { data: opcoes } = useOpcoesTarefa();
  const [criarEm, setCriarEm] = useState<{ data: string; hora: string } | null>(null);
  const [aberto, setAberto] = useState<ItemAgenda | null>(null);
  const [arrastado, setArrastado] = useState<DadosArrasto | null>(null);
  const { mover, conflito } = useMoverItem();
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const areas: Areas = useMemo(() => {
    const porId = new Map((opcoes?.areas ?? []).map((a) => [a.id, a]));
    return {
      nome: (id) => (id ? (porId.get(id)?.nome ?? "") : ""),
      cor: (id) => (id ? porId.get(id)?.cor : undefined),
    };
  }, [opcoes]);

  /** Muda parâmetros do endereço sem perder os outros (semana, visão e filtro convivem). */
  function mudar(alterar: (novos: URLSearchParams) => URLSearchParams | void) {
    setParametros(
      (atuais) => {
        const novos = new URLSearchParams(atuais);
        return alterar(novos) ?? novos;
      },
      { replace: true },
    );
  }

  function aoSoltar({ active, over }: DragEndEvent) {
    setArrastado(null);
    const dados = active.data.current as DadosArrasto | undefined;
    const alvo = over?.data.current as DadosAlvo | undefined;
    if (!dados || !alvo) return;
    if (dados.tipo === "item" && alvo.tipo === "dia-board") mover(dados.item, alvo.data);
  }

  const props = { inicioSemana: semana, hoje, itens, areas, aoClicarItem: setAberto };

  return (
    <TelaBase titulo={t("telas.agenda.titulo")}>
      <DndContext
        sensors={sensores}
        onDragStart={({ active }: DragStartEvent) => setArrastado((active.data.current as DadosArrasto) ?? null)}
        onDragCancel={() => setArrastado(null)}
        onDragEnd={aoSoltar}
      >
        <div className="-mt-2 flex min-w-0 flex-col gap-4">
          <BarraAgenda
            semana={semana}
            visao={visao}
            filtro={filtro}
            areas={opcoes?.areas ?? []}
            painelRecolhido={false}
            aoAbrirPainel={() => undefined}
            aoIrPara={(data) =>
              mudar((novos) => {
                if (data === null || data === inicioDaSemana(hoje)) novos.delete("semana");
                else novos.set("semana", data);
              })
            }
            aoMudarVisao={(nova: Visao) =>
              mudar((novos) => {
                if (nova === "semana") novos.delete("visao");
                else novos.set("visao", nova);
              })
            }
            aoMudarFiltro={(novo) => mudar((novos) => escreverFiltro(novos, novo))}
          />
          {visao === "semana" && (
            <GradeSemana
              inicioSemana={semana}
              hoje={hoje}
              itens={itens}
              corDaArea={areas.cor}
              aoClicarHorario={(data, hora) => setCriarEm({ data, hora })}
              aoClicarItem={setAberto}
            />
          )}
          {visao === "board" && <VisaoBoard {...props} aoMover={mover} />}
          {visao === "timeline" && <VisaoTimeline {...props} />}
          {visao === "lista" && <VisaoLista {...props} />}
          {visao === "tabela" && <VisaoTabela itens={itens} areas={areas} aoClicarItem={setAberto} />}
        </div>
        <DragOverlay dropAnimation={null}>
          {arrastado?.tipo === "item" && (
            <div className="w-44">
              <CartaoItem item={arrastado.item} areas={areas} arrastando />
            </div>
          )}
        </DragOverlay>
      </DndContext>
      <CriarNaAgenda inicial={criarEm} aoFechar={() => setCriarEm(null)} />
      <DetalheItem key={aberto?.id} item={aberto} aoFechar={() => setAberto(null)} />
      <ConfirmarConflito ocupantes={conflito.ocupantes} aoConfirmar={conflito.confirmar} aoVoltar={conflito.voltar} />
    </TelaBase>
  );
}
