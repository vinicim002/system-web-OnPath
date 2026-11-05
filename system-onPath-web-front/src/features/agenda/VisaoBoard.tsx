import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Check } from "lucide-react";

import type { ItemAgenda } from "@/dados/contratos";
import { t } from "@/i18n";
import { dataLocal, dataPrazo, diaDaSemana, somarDias } from "@/i18n/datas";
import { cn } from "@/lib/utils";

import { nomeDoDia } from "@/features/rotinas/dias";

import { horarioDoItem, tipoCurto, type Areas } from "./rotulos";

/** Dados de arrastar e soltar compartilhados com a tela (um só DndContext para a Agenda). */
export type DadosArrasto = { tipo: "item"; item: ItemAgenda } | { tipo: "tarefa"; tarefaId: string; titulo: string; estimadoMin: number | null };
export type DadosAlvo = { tipo: "dia-board"; data: string } | { tipo: "dia-grade"; data: string };

interface Props {
  inicioSemana: string;
  hoje: string;
  itens: ItemAgenda[];
  areas: Areas;
  aoClicarItem: (item: ItemAgenda) => void;
  aoMover: (item: ItemAgenda, data: string) => void;
}

export function CartaoItem({ item, areas, arrastando = false }: { item: ItemAgenda; areas: Areas; arrastando?: boolean }) {
  const compromisso = item.tipo === "compromisso";
  return (
    <span
      className={cn(
        "flex w-full flex-col gap-0.5 rounded-md border border-l-3 px-2.5 py-2 text-left text-pequeno shadow-xs",
        compromisso ? "border-preto bg-preto text-branco" : "bg-branco text-preto",
        item.status === "realizado" && "opacity-60",
        arrastando && "shadow-lg",
      )}
      style={{ borderLeftColor: areas.cor(item.areaId) ?? "var(--color-cinza-400)" }}
    >
      <span className="flex items-center gap-1 text-sm font-medium">
        {item.status === "realizado" && <Check aria-label={t("agenda.realizado")} className="size-3 shrink-0" />}
        <span className="truncate">{item.titulo}</span>
      </span>
      <span className="opacity-70 tabular-nums">{horarioDoItem(item)}</span>
      <span className="truncate opacity-70">{[tipoCurto(item), areas.nome(item.areaId)].filter(Boolean).join(" · ")}</span>
    </span>
  );
}

function Cartao({ item, areas, aoClicar, aoMoverDias }: { item: ItemAgenda; areas: Areas; aoClicar: () => void; aoMoverDias: (dias: number) => void }) {
  const dados: DadosArrasto = { tipo: "item", item };
  const { listeners, setNodeRef, isDragging } = useDraggable({ id: `item-${item.id}`, data: dados });
  return (
    <button
      ref={setNodeRef}
      type="button"
      // O arrastar é pelo ponteiro; pelo teclado, Alt + seta muda o dia (FR-006).
      {...listeners}
      aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
      title={`${item.titulo} · ${t("agenda.dicaMover")}`}
      onClick={aoClicar}
      onKeyDown={(evento) => {
        if (evento.altKey && (evento.key === "ArrowLeft" || evento.key === "ArrowRight")) {
          evento.preventDefault();
          aoMoverDias(evento.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      className={cn("w-full cursor-grab rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring", isDragging && "opacity-40")}
    >
      <CartaoItem item={item} areas={areas} />
    </button>
  );
}

function Coluna({ data, hoje, children }: { data: string; hoje: string; children: React.ReactNode }) {
  const alvo: DadosAlvo = { tipo: "dia-board", data };
  const { setNodeRef, isOver } = useDroppable({ id: `board-${data}`, data: alvo });
  return (
    <section
      ref={setNodeRef}
      aria-label={dataPrazo(data)}
      className={cn("flex min-h-60 flex-col gap-2 rounded-lg bg-cinza-50 p-2", isOver && "ring-2 ring-roxo")}
    >
      <h2 className={cn("flex items-center gap-2 px-1 text-pequeno", data === hoje ? "font-semibold" : "text-cinza-600")}>
        {nomeDoDia(diaDaSemana(data))}
        <span className={cn("grid size-6 place-items-center rounded-full", data === hoje && "bg-preto text-branco")}>
          {Number(data.slice(8))}
        </span>
      </h2>
      {children}
    </section>
  );
}

/** Uma coluna por dia com os cartões; arrastar para outro dia mantém o horário (cenário 2). */
export function VisaoBoard({ inicioSemana, hoje, itens, areas, aoClicarItem, aoMover }: Props) {
  const dias = Array.from({ length: 7 }, (_, i) => somarDias(inicioSemana, i));
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-240 grid-cols-7 gap-2">
        {dias.map((data) => (
          <Coluna key={data} data={data} hoje={hoje}>
            {itens
              .filter((item) => dataLocal(item.inicio) === data)
              .sort((a, b) => a.inicio.localeCompare(b.inicio))
              .map((item) => (
                <Cartao
                  key={item.id}
                  item={item}
                  areas={areas}
                  aoClicar={() => aoClicarItem(item)}
                  aoMoverDias={(deslocamento) => aoMover(item, somarDias(data, deslocamento))}
                />
              ))}
          </Coluna>
        ))}
      </div>
    </div>
  );
}
