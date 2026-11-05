import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import type { ItemDoPlano } from "@/dados/contratos";
import { t } from "@/i18n";
import { duracao } from "@/i18n/datas";
import { cn } from "@/lib/utils";

interface Props {
  linha: ItemDoPlano;
  proxima: boolean;
  contexto: string;
  aoTirar: (itemId: string) => void;
}

/** Uma tarefa do dia, ordenável por arrastar ou pelo teclado (FR-004 e FR-007). */
export function ItemDoDia({ linha, proxima, contexto, aoTirar }: Props) {
  const { item, tarefa, tituloPrincipal } = linha;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-transparent bg-branco px-2 py-2.5",
        proxima && "border-preto py-3",
        isDragging && "relative z-10 shadow-md",
      )}
    >
      {proxima && <span className="ml-8 text-pequeno font-semibold tracking-wide uppercase">{t("hoje.proxima")}</span>}
      <div className="group flex items-center gap-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={t("hoje.arrastar")}
          className="cursor-grab rounded-sm text-cinza-400 hover:text-preto active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link
            to={`/tarefas?tarefa=${tarefa.id}`}
            className={cn("truncate hover:underline", proxima && "text-subtitulo font-medium")}
          >
            {tarefa.titulo}
          </Link>
          <span className="truncate text-pequeno text-cinza-500">
            {[t(`tarefas.prioridades.${tarefa.prioridade}`), tituloPrincipal, contexto].filter(Boolean).join(" · ")}
          </span>
        </div>
        {tarefa.tempoEstimadoMin !== null && (
          <span className="shrink-0 text-pequeno text-cinza-500">{duracao(tarefa.tempoEstimadoMin)}</span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("hoje.tirar")}
          title={t("hoje.tirar")}
          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          onClick={() => aoTirar(item.id)}
        >
          <X />
        </Button>
      </div>
    </li>
  );
}
