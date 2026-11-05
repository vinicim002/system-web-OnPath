import { useDraggable } from "@dnd-kit/core";
import { CalendarPlus, ChevronDown, ChevronRight, GripVertical, PanelLeftClose } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgenda, useTarefas } from "@/dados/consultas";
import type { ItemAgenda } from "@/dados/contratos";
import type { Tarefa } from "@/dados/tipos";
import { useAcoesTarefas } from "@/features/tarefas/acoes";
import { ConfirmarSubtarefas } from "@/features/tarefas/ConfirmarSubtarefas";
import { t } from "@/i18n";
import { dataPrazo, duracao, instanteLocal, somarDias } from "@/i18n/datas";
import { cn } from "@/lib/utils";

import type { DadosArrasto } from "./arrasto";
import { horarioDoItem, type Areas } from "./rotulos";
import { agruparPorPrazo, GRUPOS_PRAZO, type GrupoPrazo } from "./visoes";

interface Props {
  hoje: string;
  areas: Areas;
  aoRecolher: () => void;
  aoAgendar: (tarefa: Tarefa) => void;
  aoClicarItem: (item: ItemAgenda) => void;
}

function LinhaTarefa({
  tarefa,
  principal,
  aoConcluir,
  aoAgendar,
}: {
  tarefa: Tarefa;
  principal: string | undefined;
  aoConcluir: () => void;
  aoAgendar: () => void;
}) {
  const dados: DadosArrasto = { tipo: "tarefa", tarefaId: tarefa.id, titulo: tarefa.titulo, estimadoMin: tarefa.tempoEstimadoMin };
  const { listeners, setNodeRef, isDragging } = useDraggable({ id: `tarefa-${tarefa.id}`, data: dados });
  const detalhes = [
    tarefa.prazo ? dataPrazo(tarefa.prazo) : null,
    tarefa.tempoEstimadoMin ? duracao(tarefa.tempoEstimadoMin) : null,
    principal ? `↳ ${principal}` : null,
  ].filter(Boolean);

  return (
    <li className={cn("group flex items-start gap-2 rounded-md px-1.5 py-1.5 hover:bg-cinza-100", isDragging && "opacity-40")}>
      <Checkbox className="mt-0.5" aria-label={t("agenda.painel.concluir", { titulo: tarefa.titulo })} checked={false} onCheckedChange={aoConcluir} />
      <div
        ref={setNodeRef}
        {...listeners}
        title={t("agenda.painel.arrastar")}
        className="flex min-w-0 flex-1 cursor-grab touch-none items-start gap-1"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{tarefa.titulo}</p>
          {detalhes.length > 0 && <p className="truncate text-pequeno text-cinza-500">{detalhes.join(" · ")}</p>}
        </div>
        <GripVertical aria-hidden className="mt-0.5 size-3.5 shrink-0 text-cinza-400 opacity-0 group-hover:opacity-100" />
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        aria-label={t("agenda.painel.agendar", { titulo: tarefa.titulo })}
        title={t("agenda.painel.agendar", { titulo: tarefa.titulo })}
        onClick={aoAgendar}
      >
        <CalendarPlus />
      </Button>
    </li>
  );
}

function AbaTarefas({ hoje, aoAgendar }: Pick<Props, "hoje" | "aoAgendar">) {
  const { data: tarefas = [] } = useTarefas();
  const { acoes, pedido } = useAcoesTarefas();
  const [fechados, setFechados] = useState<Set<GrupoPrazo>>(() => new Set());
  const grupos = useMemo(() => agruparPorPrazo(tarefas, hoje), [tarefas, hoje]);
  const titulos = useMemo(() => new Map(tarefas.map((tarefa) => [tarefa.id, tarefa.titulo])), [tarefas]);

  if (tarefas.length === 0) return <p className="px-1.5 py-4 text-pequeno text-cinza-500">{t("agenda.painel.semTarefas")}</p>;

  return (
    <div className="flex flex-col gap-3">
      {GRUPOS_PRAZO.filter((grupo) => grupos[grupo].length > 0).map((grupo) => {
        const aberto = !fechados.has(grupo);
        const Seta = aberto ? ChevronDown : ChevronRight;
        return (
          <section key={grupo} className="flex flex-col gap-0.5">
            <button
              type="button"
              aria-expanded={aberto}
              onClick={() =>
                setFechados((atuais) => {
                  const novos = new Set(atuais);
                  if (aberto) novos.add(grupo);
                  else novos.delete(grupo);
                  return novos;
                })
              }
              className={cn(
                "flex items-center gap-1 rounded-sm px-1 py-0.5 text-left text-pequeno font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                grupo === "atrasadas" ? "text-roxo" : "text-cinza-600",
              )}
            >
              <Seta aria-hidden className="size-3.5" />
              {t(`agenda.painel.grupos.${grupo}`)}
              <span className="ml-auto font-normal text-cinza-400 tabular-nums">{grupos[grupo].length}</span>
            </button>
            {aberto && (
              <ul className="flex flex-col">
                {grupos[grupo].map((tarefa) => (
                  <LinhaTarefa
                    key={tarefa.id}
                    tarefa={tarefa}
                    principal={tarefa.tarefaPaiId ? titulos.get(tarefa.tarefaPaiId) : undefined}
                    aoConcluir={() => void acoes.alternarConclusao(tarefa)}
                    aoAgendar={() => aoAgendar(tarefa)}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
      <ConfirmarSubtarefas pedido={pedido} />
    </div>
  );
}

function AbaEventos({ hoje, areas, aoClicarItem }: Pick<Props, "hoje" | "areas" | "aoClicarItem">) {
  const { data: itens = [] } = useAgenda(instanteLocal(hoje, "00:00"), instanteLocal(somarDias(hoje, 1), "00:00"));
  if (itens.length === 0) return <p className="px-1.5 py-4 text-pequeno text-cinza-500">{t("agenda.painel.semEventos")}</p>;
  return (
    <ul className="flex flex-col gap-1">
      {itens.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => aoClicarItem(item)}
            className="flex w-full items-start gap-2 rounded-md px-1.5 py-1.5 text-left outline-none hover:bg-cinza-100 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden className="mt-1 h-7 w-1 shrink-0 rounded-full" style={{ background: areas.cor(item.areaId) ?? "var(--color-cinza-400)" }} />
            <span className="min-w-0">
              <span className={cn("block truncate text-sm", item.status === "realizado" && "text-cinza-500 line-through")}>{item.titulo}</span>
              <span className="block text-pequeno text-cinza-500 tabular-nums">{horarioDoItem(item)}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Painel ao lado da Agenda: tarefas por prazo (arrastáveis para a grade) e os eventos de hoje (FR-004). */
export function PainelTarefas({ hoje, areas, aoRecolher, aoAgendar, aoClicarItem }: Props) {
  return (
    <aside aria-label={t("agenda.painel.titulo")} className="flex w-68 shrink-0 flex-col gap-3 rounded-xl border p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-subtitulo font-semibold">{t("agenda.painel.titulo")}</h2>
        <Button variant="ghost" size="icon-sm" aria-label={t("agenda.painel.recolher")} title={t("agenda.painel.recolher")} onClick={aoRecolher}>
          <PanelLeftClose />
        </Button>
      </div>
      <Tabs defaultValue="tarefas" className="gap-3">
        <TabsList variant="line" className="w-full justify-start border-b">
          <TabsTrigger value="tarefas">{t("agenda.painel.tarefas")}</TabsTrigger>
          <TabsTrigger value="eventos">{t("agenda.painel.eventos")}</TabsTrigger>
        </TabsList>
        <TabsContent value="tarefas">
          <AbaTarefas hoje={hoje} aoAgendar={aoAgendar} />
        </TabsContent>
        <TabsContent value="eventos">
          <AbaEventos hoje={hoje} areas={areas} aoClicarItem={aoClicarItem} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
