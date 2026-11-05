import { toast } from "sonner";

import { useCriarTarefa } from "@/dados/consultas";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";

import { FormularioTarefa, paraNovaTarefa, type ValoresFormulario } from "./FormularioTarefa";

interface Props {
  aoCriar: (id: string) => void;
  aoCancelar: () => void;
}

/** Painel de criação de uma tarefa principal (história 1). */
export function NovaTarefa({ aoCriar, aoCancelar }: Props) {
  const criar = useCriarTarefa();

  async function aoSalvar(valores: ValoresFormulario): Promise<ErroOnPath | null> {
    try {
      const tarefa = await criar.mutateAsync(paraNovaTarefa(valores));
      toast(t("tarefas.avisos.criada"));
      aoCriar(tarefa.id);
      return null;
    } catch (erro) {
      if (ehErroOnPath(erro) && erro.codigo === "dados_invalidos") return erro;
      avisarErro(erro);
      return ehErroOnPath(erro) ? erro : null;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-subtitulo font-semibold">{t("tarefas.novaTitulo")}</h2>
      <FormularioTarefa rotuloSalvar={t("tarefas.acoes.criar")} aoSalvar={aoSalvar} aoCancelar={aoCancelar} focarTitulo />
    </div>
  );
}
