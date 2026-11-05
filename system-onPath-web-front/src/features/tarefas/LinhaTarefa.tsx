import { ChevronDown, ChevronRight } from "lucide-react";
import { memo } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import type { Tarefa } from "@/dados/tipos";
import { t } from "@/i18n";
import { dataPrazo, duracao } from "@/i18n/datas";
import { cn } from "@/lib/utils";

import type { AcoesTarefas } from "./acoes";

interface Props {
  tarefa: Tarefa;
  nivel: number;
  quantidadeSubtarefas: number;
  expandida: boolean;
  selecionada: boolean;
  atrasada: boolean;
  /** "Trabalho · Site" — área e vínculo já resolvidos. */
  contexto: string;
  acoes: AcoesTarefas;
  aoAbrir: (id: string) => void;
  aoExpandir: (id: string) => void;
}

/** Uma linha da lista de tarefas (FR-015, FR-018 e FR-020). */
function LinhaTarefaBase({
  tarefa,
  nivel,
  quantidadeSubtarefas,
  expandida,
  selecionada,
  atrasada,
  contexto,
  acoes,
  aoAbrir,
  aoExpandir,
}: Props) {
  const feita = tarefa.status !== "aberta";
  return (
    <li
      className={cn(
        "group flex items-center gap-2 rounded-md py-2 pr-3 hover:bg-cinza-50",
        selecionada && "bg-cinza-100 hover:bg-cinza-100",
      )}
      style={{ paddingLeft: `calc(var(--spacing) * ${2 + nivel * 6})` }}
    >
      <span className="flex w-5 shrink-0 justify-center">
        {quantidadeSubtarefas > 0 && (
          <button
            type="button"
            onClick={() => aoExpandir(tarefa.id)}
            aria-expanded={expandida}
            aria-label={t(expandida ? "tarefas.acoes.recolher" : "tarefas.acoes.expandir")}
            className="rounded-sm text-cinza-500 hover:text-preto"
          >
            {expandida ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        )}
      </span>
      <Checkbox
        checked={tarefa.status === "concluida"}
        onCheckedChange={() => void acoes.alternarConclusao(tarefa)}
        aria-label={t(tarefa.status === "aberta" ? "tarefas.acoes.concluir" : "tarefas.acoes.reabrir")}
      />
      <button
        type="button"
        onClick={() => aoAbrir(tarefa.id)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:underline"
      >
        <span className={cn("min-w-0 flex-1 truncate", feita && "text-cinza-500 line-through")}>
          {tarefa.titulo}
          {quantidadeSubtarefas > 0 && (
            <span className="ml-2 text-pequeno text-cinza-400">{quantidadeSubtarefas}</span>
          )}
        </span>
        {nivel === 0 && (
          <span className="hidden shrink-0 text-pequeno text-cinza-500 md:inline">
            {t(`tarefas.prioridades.${tarefa.prioridade}`)} · {contexto}
          </span>
        )}
        {tarefa.tempoEstimadoMin !== null && (
          <span className="w-20 shrink-0 text-right text-pequeno text-cinza-500">
            {duracao(tarefa.tempoEstimadoMin)}
          </span>
        )}
        <span
          className={cn(
            "w-24 shrink-0 text-right text-pequeno",
            atrasada ? "font-medium text-preto" : "text-cinza-500",
          )}
        >
          {tarefa.prazo ? (atrasada ? `${t("tarefas.atrasada")} · ` : "") + dataPrazo(tarefa.prazo) : ""}
        </span>
      </button>
    </li>
  );
}

export const LinhaTarefa = memo(
  LinhaTarefaBase,
  (antes, depois) =>
    antes.tarefa.id === depois.tarefa.id &&
    antes.tarefa.atualizadoEm === depois.tarefa.atualizadoEm &&
    antes.nivel === depois.nivel &&
    antes.quantidadeSubtarefas === depois.quantidadeSubtarefas &&
    antes.expandida === depois.expandida &&
    antes.selecionada === depois.selecionada &&
    antes.atrasada === depois.atrasada &&
    antes.contexto === depois.contexto &&
    antes.acoes === depois.acoes &&
    antes.aoAbrir === depois.aoAbrir &&
    antes.aoExpandir === depois.aoExpandir,
);
