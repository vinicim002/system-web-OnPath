import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Tarefa } from "@/dados/tipos";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";

import { CartaoKanban } from "./CartaoKanban";

interface Props {
  id: string;
  nome: string;
  final: boolean;
  tarefas: Tarefa[];
  subtarefasAbertas: Map<string, number>;
  aoNovaTarefa?: () => void;
  aoAbrir: (tarefaId: string) => void;
}

/** Uma coluna do Kanban, onde os cartões podem ser soltos. */
export function ColunaKanban({ id, nome, final, tarefas, subtarefasAbertas, aoNovaTarefa, aoAbrir }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section
      ref={setNodeRef}
      aria-label={nome}
      className={cn(
        "flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-cinza-50 p-3",
        final && "border border-preto",
        isOver && "bg-cinza-100",
      )}
    >
      <header className="flex items-center gap-2 px-1">
        <h3 className="min-w-0 flex-1 truncate font-medium">{nome}</h3>
        {final && <span className="rounded-sm border border-preto px-1.5 text-pequeno">{t("kanban.final")}</span>}
        <span className="text-pequeno text-cinza-500">{tarefas.length}</span>
      </header>
      <ul className="flex min-h-12 flex-col gap-2">
        {tarefas.map((tarefa) => (
          <CartaoKanban key={tarefa.id} tarefa={tarefa} subtarefasAbertas={subtarefasAbertas.get(tarefa.id) ?? 0} aoAbrir={aoAbrir} />
        ))}
      </ul>
      {aoNovaTarefa && (
        <Button size="sm" variant="ghost" className="justify-start text-cinza-600" onClick={aoNovaTarefa}>
          <Plus />
          {t("kanban.novaTarefa")}
        </Button>
      )}
    </section>
  );
}
