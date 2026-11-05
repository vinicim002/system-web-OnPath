import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { Tarefa } from "@/dados/tipos";
import { t, tPlural } from "@/i18n";
import { dataPrazo } from "@/i18n/datas";
import { cn } from "@/lib/utils";

interface Props {
  tarefa: Tarefa;
  subtarefasAbertas: number;
  aoAbrir: (tarefaId: string) => void;
}

/** Um cartão do Kanban: arrastável por ponteiro e teclado (FR-012). */
export function CartaoKanban({ tarefa, subtarefasAbertas, aoAbrir }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: tarefa.id });
  const concluida = tarefa.status === "concluida";

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
      aria-roledescription={t("kanban.arrastarCartao")}
      onClick={() => aoAbrir(tarefa.id)}
      onKeyDown={(evento) => {
        listeners?.onKeyDown?.(evento);
        if (evento.key === "Enter" && !evento.defaultPrevented) aoAbrir(tarefa.id);
      }}
      className={cn(
        "flex cursor-grab flex-col gap-1 rounded-md border bg-branco p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
        isDragging && "relative z-20 shadow-lg",
      )}
    >
      <span className={cn("text-sm", concluida && "text-cinza-500 line-through")}>{tarefa.titulo}</span>
      <span className="text-pequeno text-cinza-500">
        {[
          t(`tarefas.prioridades.${tarefa.prioridade}`),
          tarefa.prazo ? dataPrazo(tarefa.prazo) : null,
          subtarefasAbertas > 0 ? tPlural("kanban.subtarefas", subtarefasAbertas) : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </span>
    </li>
  );
}
