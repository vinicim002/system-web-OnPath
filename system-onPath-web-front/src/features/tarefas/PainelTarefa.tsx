import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAlterarTarefa } from "@/dados/consultas";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import { tarefaDoTopo } from "@/dados/regrasTarefas";
import type { Tarefa } from "@/dados/tipos";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";

import type { AcoesTarefas } from "./acoes";
import { ArvoreSubtarefas } from "./ArvoreSubtarefas";
import { FormularioTarefa, paraNovaTarefa, valoresDaTarefa, type ValoresFormulario } from "./FormularioTarefa";
import { MoverTarefa } from "./MoverTarefa";

interface Props {
  tarefa: Tarefa;
  /** Todas as tarefas ativas, para achar a tarefa do topo. */
  todas: Tarefa[];
  acoes: AcoesTarefas;
  aoFechar: () => void;
  aoAbrir: (id: string) => void;
}

/** Fecha com Esc, menos quando há uma seleção ou um diálogo aberto por cima. */
function useFecharComEsc(aoFechar: () => void) {
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key !== "Escape" || evento.defaultPrevented) return;
      if (document.querySelector("[role=listbox], [role=dialog], [role=alertdialog]")) return;
      aoFechar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);
}

/** Painel lateral com os detalhes da tarefa (FR-019). */
export function PainelTarefa({ tarefa, todas, acoes, aoFechar, aoAbrir }: Props) {
  const alterar = useAlterarTarefa();
  const [movendo, setMovendo] = useState(false);
  useFecharComEsc(aoFechar);

  const topo = useMemo(
    () => (tarefa.tarefaPaiId ? tarefaDoTopo(tarefa, new Map(todas.map((x) => [x.id, x]))) : null),
    [tarefa, todas],
  );
  // Os valores só mudam quando a tarefa muda de fato, para não apagar o que está sendo digitado.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const valoresIniciais = useMemo(() => valoresDaTarefa(tarefa), [tarefa.id, tarefa.atualizadoEm]);

  async function aoSalvar(valores: ValoresFormulario): Promise<ErroOnPath | null> {
    try {
      await alterar.mutateAsync({ id: tarefa.id, dados: paraNovaTarefa(valores) });
      toast(t("tarefas.avisos.salva"));
      return null;
    } catch (erro) {
      if (ehErroOnPath(erro) && erro.codigo === "dados_invalidos") return erro;
      avisarErro(erro);
      return ehErroOnPath(erro) ? erro : null;
    }
  }

  const aberta = tarefa.status === "aberta";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-sm bg-cinza-100 px-2 py-0.5 text-pequeno text-cinza-700">
          {t(`tarefas.situacao.${tarefa.status}`)}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={aoFechar} aria-label={t("tarefas.acoes.fechar")}>
          <X />
        </Button>
      </div>

      <FormularioTarefa
        valoresIniciais={valoresIniciais}
        modo={tarefa.tarefaPaiId ? "subtarefa" : "principal"}
        herdadoDe={topo?.titulo}
        rotuloSalvar={t("tarefas.acoes.salvar")}
        aoSalvar={aoSalvar}
        somenteComMudancas
      />

      {tarefa.tarefaPaiId && topo && (
        <button
          type="button"
          onClick={() => aoAbrir(tarefa.tarefaPaiId!)}
          className="-mt-2 self-start text-pequeno text-cinza-600 underline underline-offset-4"
        >
          ↑ {todas.find((x) => x.id === tarefa.tarefaPaiId)?.titulo}
        </button>
      )}

      <ArvoreSubtarefas tarefa={tarefa} todas={todas} acoes={acoes} aoAbrir={aoAbrir} />

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Button variant="outline" onClick={() => void acoes.alternarConclusao(tarefa)}>
          {t(aberta ? "tarefas.acoes.concluir" : "tarefas.acoes.reabrir")}
        </Button>
        {aberta && (
          <Button variant="outline" onClick={() => void acoes.cancelar(tarefa.id)}>
            {t("tarefas.acoes.cancelar")}
          </Button>
        )}
        <Button variant="outline" onClick={() => setMovendo(true)}>
          {t("tarefas.acoes.mover")}
        </Button>
        <Button variant="ghost" onClick={() => void acoes.excluir(tarefa.id)}>
          {t("tarefas.acoes.excluir")}
        </Button>
      </div>
      {movendo && <MoverTarefa tarefa={tarefa} todas={todas} aberto={movendo} aoMudar={setMovendo} />}
    </div>
  );
}
