import { useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCriarTarefaDeItem } from "@/dados/consultas";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import type { ItemCaixa } from "@/dados/tipos";
import { FormularioTarefa } from "@/features/tarefas/FormularioTarefa";
import { paraNovaTarefa, VALORES_VAZIOS, type ValoresFormulario } from "@/features/tarefas/valoresTarefa";
import { t } from "@/i18n";

import { avisarErro } from "./avisos";

interface Props {
  item: ItemCaixa;
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
}

/** Transforma um item da caixa em tarefa, sem sair da Caixa (história 4 de specs/003-tarefas). */
export function VirarTarefa({ item, aberto, aoMudar }: Props) {
  const criar = useCriarTarefaDeItem();
  const navegar = useNavigate();

  // A primeira linha vira o título; com mais de uma linha, o texto inteiro vai para as anotações.
  const valoresIniciais = useMemo<ValoresFormulario>(() => {
    const [primeira = ""] = item.conteudo.split("\n");
    const variasLinhas = item.conteudo.includes("\n");
    return { ...VALORES_VAZIOS, titulo: primeira.trim(), anotacoes: variasLinhas ? item.conteudo : "" };
  }, [item.conteudo]);

  async function aoSalvar(valores: ValoresFormulario): Promise<ErroOnPath | null> {
    try {
      const tarefa = await criar.mutateAsync({ itemId: item.id, dados: paraNovaTarefa(valores) });
      aoMudar(false);
      toast(t("caixa.avisos.virouTarefa"), {
        duration: 8000,
        action: {
          label: t("caixa.avisos.verTarefa"),
          onClick: () => navegar(`/tarefas?tarefa=${tarefa.id}`),
        },
      });
      return null;
    } catch (erro) {
      if (ehErroOnPath(erro) && erro.codigo === "dados_invalidos") return erro;
      avisarErro(erro);
      return ehErroOnPath(erro) ? erro : null;
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={aoMudar}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("caixa.virarTarefaTitulo")}</DialogTitle>
        </DialogHeader>
        <FormularioTarefa
          valoresIniciais={valoresIniciais}
          rotuloSalvar={t("tarefas.acoes.criar")}
          aoSalvar={aoSalvar}
          aoCancelar={() => aoMudar(false)}
          focarTitulo
        />
      </DialogContent>
    </Dialog>
  );
}
