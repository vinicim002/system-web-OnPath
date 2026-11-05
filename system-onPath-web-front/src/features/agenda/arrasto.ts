import type { ItemAgenda } from "@/dados/contratos";

/** O que se arrasta na Agenda (um só DndContext para a tela): um item do Board ou uma tarefa do painel. */
export type DadosArrasto =
  | { tipo: "item"; item: ItemAgenda }
  | { tipo: "tarefa"; tarefaId: string; titulo: string; estimadoMin: number | null };

/** Onde se solta: um dia do Board ou uma coluna da grade semanal. */
export type DadosAlvo = { tipo: "dia-board"; data: string } | { tipo: "dia-grade"; data: string };
