import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { TelaBase } from "@/components/TelaBase";
import { useAgenda, useOpcoesTarefa } from "@/dados/consultas";
import type { ItemAgenda } from "@/dados/contratos";
import { BarraAgenda } from "@/features/agenda/BarraAgenda";
import { ConfirmarConflito } from "@/features/agenda/ConfirmarConflito";
import { CriarNaAgenda, type InicioCriacao } from "@/features/agenda/CriarNaAgenda";
import { DetalheItem } from "@/features/agenda/DetalheItem";
import { GradeSemana } from "@/features/agenda/GradeSemana";
import { PainelTarefas } from "@/features/agenda/PainelTarefas";
import type { Areas } from "@/features/agenda/rotulos";
import { useMoverItem } from "@/features/agenda/useMoverItem";
import { useReservarTarefa } from "@/features/agenda/useReservarTarefa";
import type { DadosAlvo, DadosArrasto } from "@/features/agenda/arrasto";
import { CartaoItem, VisaoBoard } from "@/features/agenda/VisaoBoard";
import { VisaoLista } from "@/features/agenda/VisaoLista";
import { VisaoTabela } from "@/features/agenda/VisaoTabela";
import { VisaoTimeline } from "@/features/agenda/VisaoTimeline";
import { escreverFiltro, filtrarItens, horaDoSoltar, intervaloDaTarefa, lerFiltro, lerVisao, type Visao } from "@/features/agenda/visoes";
import { useHoje } from "@/features/hoje/useHoje";
import { t } from "@/i18n";
import { horaLocal, inicioDaSemana, instanteLocal, somarDias } from "@/i18n/datas";

const CHAVE_PAINEL = "onpath:agenda-painel";

function lerPainelRecolhido(): boolean {
  try {
    return localStorage.getItem(CHAVE_PAINEL) === "recolhido";
  } catch {
    return false;
  }
}

/** Próxima hora cheia de hoje, para o botão "Agendar" (história 3, cenário 4). */
function proximaHoraCheia(): string {
  const hora = Math.min(Number(horaLocal(new Date().toISOString()).slice(0, 2)) + 1, 23);
  return `${String(hora).padStart(2, "0")}:00`;
}

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
  const [criarEm, setCriarEm] = useState<InicioCriacao | null>(null);
  const [aberto, setAberto] = useState<ItemAgenda | null>(null);
  const [arrastado, setArrastado] = useState<DadosArrasto | null>(null);
  const { mover, conflito } = useMoverItem();
  const reserva = useReservarTarefa();
  const [painelRecolhido, setPainelRecolhido] = useState(lerPainelRecolhido);

  function recolherPainel(recolher: boolean) {
    setPainelRecolhido(recolher);
    try {
      localStorage.setItem(CHAVE_PAINEL, recolher ? "recolhido" : "aberto");
    } catch {
      // Sem armazenamento, a escolha vale só até recarregar.
    }
  }
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

  function aoSoltar({ active, over, activatorEvent, delta }: DragEndEvent) {
    setArrastado(null);
    const dados = active.data.current as DadosArrasto | undefined;
    const alvo = over?.data.current as DadosAlvo | undefined;
    if (!over || !dados || !alvo) return;
    if (dados.tipo === "item" && alvo.tipo === "dia-board") mover(dados.item, alvo.data);
    if (dados.tipo === "tarefa" && alvo.tipo === "dia-grade") {
      // Onde o ponteiro soltou, medido do topo da coluna do dia (research.md, item 3).
      const inicioY = activatorEvent instanceof PointerEvent || activatorEvent instanceof MouseEvent ? activatorEvent.clientY : over.rect.top;
      reserva.reservar(dados, alvo.data, horaDoSoltar(inicioY + delta.y - over.rect.top));
    }
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
        <div className="-mt-2 flex items-start gap-4">
          {!painelRecolhido && (
            <PainelTarefas
              hoje={hoje}
              areas={areas}
              aoRecolher={() => recolherPainel(true)}
              aoClicarItem={setAberto}
              aoAgendar={(tarefa) => {
                const { inicio, fim } = intervaloDaTarefa(proximaHoraCheia(), tarefa.tempoEstimadoMin);
                setCriarEm({ data: hoje, hora: inicio, fim, tarefaId: tarefa.id });
              }}
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <BarraAgenda
              semana={semana}
              visao={visao}
              filtro={filtro}
              areas={opcoes?.areas ?? []}
              painelRecolhido={painelRecolhido}
              aoAbrirPainel={() => recolherPainel(false)}
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
        </div>
        <DragOverlay dropAnimation={null}>
          {arrastado?.tipo === "item" && (
            <div className="w-44">
              <CartaoItem item={arrastado.item} areas={areas} arrastando />
            </div>
          )}
          {arrastado?.tipo === "tarefa" && (
            <div className="w-56 rounded-md border border-l-3 border-l-roxo bg-branco px-2.5 py-2 text-sm font-medium shadow-lg">
              {arrastado.titulo}
            </div>
          )}
        </DragOverlay>
      </DndContext>
      <CriarNaAgenda key={criarEm ? `${criarEm.data}-${criarEm.hora}-${criarEm.tarefaId ?? ""}` : "fechado"} inicial={criarEm} aoFechar={() => setCriarEm(null)} />
      <DetalheItem key={aberto?.id} item={aberto} aoFechar={() => setAberto(null)} />
      <ConfirmarConflito ocupantes={conflito.ocupantes} aoConfirmar={conflito.confirmar} aoVoltar={conflito.voltar} />
      <ConfirmarConflito ocupantes={reserva.conflito.ocupantes} aoConfirmar={reserva.conflito.confirmar} aoVoltar={reserva.conflito.voltar} />
    </TelaBase>
  );
}
