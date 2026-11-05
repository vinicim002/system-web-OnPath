import { Plus } from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useCriarSubtarefa } from "@/dados/consultas";
import { idsDaArvore, montarArvore, type TarefaNaArvore } from "@/dados/regrasTarefas";
import type { Tarefa } from "@/dados/tipos";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";

import type { AcoesTarefas } from "./acoes";

/** Campo "Nova subtarefa…": Enter cria só com o título (RN33). */
function CampoSubtarefa({ tarefaPaiId, focar = false, aoTerminar }: { tarefaPaiId: string; focar?: boolean; aoTerminar?: () => void }) {
  const criar = useCriarSubtarefa();
  const [titulo, setTitulo] = useState("");

  async function aoTeclar(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "Escape" && aoTerminar) {
      evento.preventDefault();
      aoTerminar();
      return;
    }
    if (evento.key !== "Enter" || evento.nativeEvent.isComposing) return;
    evento.preventDefault();
    if (titulo.trim() === "") return;
    try {
      await criar.mutateAsync({ tarefaPaiId, titulo });
      setTitulo("");
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <Input
      value={titulo}
      onChange={(evento) => setTitulo(evento.target.value)}
      onKeyDown={aoTeclar}
      autoFocus={focar}
      placeholder={t("tarefas.acoes.novaSubtarefa")}
      aria-label={t("tarefas.acoes.adicionarSubtarefa")}
      className="h-8"
    />
  );
}

function No({
  no,
  acoes,
  aoAbrir,
}: {
  no: TarefaNaArvore;
  acoes: AcoesTarefas;
  aoAbrir: (id: string) => void;
}) {
  const [adicionando, setAdicionando] = useState(false);
  const feita = no.status !== "aberta";
  return (
    <li className="flex flex-col">
      <div className="group flex items-center gap-2 rounded-md py-1 pr-1 hover:bg-cinza-50">
        <Checkbox
          checked={no.status === "concluida"}
          onCheckedChange={() => void acoes.alternarConclusao(no)}
          aria-label={t(no.status === "aberta" ? "tarefas.acoes.concluir" : "tarefas.acoes.reabrir")}
        />
        <button
          type="button"
          onClick={() => aoAbrir(no.id)}
          className={cn("min-w-0 flex-1 truncate text-left", feita && "text-cinza-500 line-through")}
        >
          {no.titulo}
        </button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={t("tarefas.acoes.adicionarSubtarefa")}
          onClick={() => setAdicionando(true)}
        >
          <Plus />
        </Button>
      </div>
      {(no.subtarefas.length > 0 || adicionando) && (
        <ul className="ml-3 flex flex-col border-l pl-3">
          {no.subtarefas.map((filha) => (
            <No key={filha.id} no={filha} acoes={acoes} aoAbrir={aoAbrir} />
          ))}
          {adicionando && (
            <li className="py-1">
              <CampoSubtarefa tarefaPaiId={no.id} focar aoTerminar={() => setAdicionando(false)} />
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

interface Props {
  tarefa: Tarefa;
  todas: Tarefa[];
  acoes: AcoesTarefas;
  aoAbrir: (id: string) => void;
}

/** Subtarefas da tarefa aberta, em vários níveis (RN30). */
export function ArvoreSubtarefas({ tarefa, todas, acoes, aoAbrir }: Props) {
  const filhas = useMemo(() => {
    const ids = idsDaArvore(tarefa.id, todas);
    const arvore = montarArvore(todas.filter((t) => ids.has(t.id)));
    return arvore.find((no) => no.id === tarefa.id)?.subtarefas ?? [];
  }, [tarefa.id, todas]);

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{t("tarefas.subtarefas")}</h3>
      {filhas.length > 0 && (
        <ul className="flex flex-col">
          {filhas.map((no) => (
            <No key={no.id} no={no} acoes={acoes} aoAbrir={aoAbrir} />
          ))}
        </ul>
      )}
      <CampoSubtarefa key={tarefa.id} tarefaPaiId={tarefa.id} />
    </section>
  );
}
