import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAreasArquivadas, useAreasComResumo, useRecuperarArea, useReordenarAreas } from "@/dados/consultas";
import type { AreaComResumo } from "@/dados/contratos";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";

function LinhaArea({ area, selecionada, aoAbrir }: { area: AreaComResumo; selecionada: boolean; aoAbrir: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: area.id,
  });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 hover:bg-cinza-50",
        selecionada && "bg-cinza-100 hover:bg-cinza-100",
        isDragging && "relative z-10 bg-branco shadow-md",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={t("areas.arrastar")}
        className="cursor-grab rounded-sm text-cinza-400 hover:text-preto active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => aoAbrir(area.id)}
        aria-current={selecionada ? "true" : undefined}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: area.cor }} />
        <span className="flex min-w-0 flex-col">
          <span className={cn("truncate", selecionada && "font-medium")}>{area.nome}</span>
          <span className="truncate text-pequeno text-cinza-500">
            {t("areas.resumo", { metas: area.contagem.metasAtivas, tarefas: area.contagem.tarefasAbertas })}
          </span>
        </span>
      </button>
    </li>
  );
}

/** Áreas ativas, ordenáveis, e as arquivadas recolhidas no fim (FR-001, FR-004 e FR-007). */
export function ListaAreas({ selecionada, aoAbrir }: { selecionada: string | null; aoAbrir: (id: string) => void }) {
  const { data: areas = [] } = useAreasComResumo();
  const { data: arquivadas = [] } = useAreasArquivadas();
  const reordenar = useReordenarAreas();
  const recuperar = useRecuperarArea();
  const [ordemLocal, setOrdemLocal] = useState<string[] | null>(null);
  const [verArquivadas, setVerArquivadas] = useState(false);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const visiveis = useMemo(() => {
    if (!ordemLocal) return areas;
    const porId = new Map(areas.map((area) => [area.id, area]));
    return ordemLocal.map((id) => porId.get(id)).filter((area) => area !== undefined);
  }, [areas, ordemLocal]);

  async function aoSoltar({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const ids = visiveis.map((area) => area.id);
    const nova = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    setOrdemLocal(nova);
    try {
      await reordenar.mutateAsync(nova);
    } catch (erro) {
      avisarErro(erro);
    } finally {
      setOrdemLocal(null);
    }
  }

  async function aoRecuperar(id: string) {
    try {
      await recuperar.mutateAsync(id);
      toast(t("areas.avisos.recuperada"));
      aoAbrir(id);
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={(evento) => void aoSoltar(evento)}>
        <SortableContext items={visiveis.map((area) => area.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-0.5">
            {visiveis.map((area) => (
              <LinhaArea key={area.id} area={area} selecionada={area.id === selecionada} aoAbrir={aoAbrir} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {arquivadas.length > 0 && (
        <section className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setVerArquivadas((atual) => !atual)}
            aria-expanded={verArquivadas}
            className="flex items-center gap-1 px-2 text-pequeno font-medium text-cinza-500 hover:text-preto"
          >
            {verArquivadas ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            {t("areas.arquivadas", { quantidade: arquivadas.length })}
          </button>
          {verArquivadas && (
            <ul className="flex flex-col">
              {arquivadas.map((area) => (
                <li key={area.id} className="flex items-center gap-3 px-2 py-1.5">
                  <span aria-hidden className="size-3 shrink-0 rounded-full opacity-50" style={{ backgroundColor: area.cor }} />
                  <span className="min-w-0 flex-1 truncate text-cinza-500">{area.nome}</span>
                  <Button size="sm" variant="ghost" onClick={() => void aoRecuperar(area.id)}>
                    {t("areas.recuperar")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
