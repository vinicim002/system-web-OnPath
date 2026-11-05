import { ArrowLeft, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { TelaBase } from "@/components/TelaBase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAlterarProjeto,
  useCriarTarefa,
  useExcluirProjeto,
  useOpcoesProjeto,
  useProjeto,
  useRecuperarProjeto,
  useTarefas,
} from "@/dados/consultas";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import type { Projeto as TipoProjeto, StatusTarefa } from "@/dados/tipos";
import { avisarErro } from "@/features/caixa/avisos";
import { AcoesStatus } from "@/features/projetos/AcoesStatus";
import { FormularioProjeto, type ValoresProjeto } from "@/features/projetos/FormularioProjeto";
import { paraDadosProjeto, valoresDoProjeto } from "@/features/projetos/valoresProjeto";
import { useAcoesTarefas } from "@/features/tarefas/acoes";
import { ConfirmarSubtarefas } from "@/features/tarefas/ConfirmarSubtarefas";
import { FormularioTarefa } from "@/features/tarefas/FormularioTarefa";
import { ListaTarefas } from "@/features/tarefas/ListaTarefas";
import { paraNovaTarefa, VALORES_VAZIOS, type ValoresFormulario } from "@/features/tarefas/valoresTarefa";
import { t } from "@/i18n";
import { NaoEncontrada } from "@/telas/NaoEncontrada";

function erroDeCampo(erro: unknown): ErroOnPath | null {
  if (ehErroOnPath(erro) && (erro.codigo === "dados_invalidos" || erro.codigo === "nome_repetido")) return erro;
  avisarErro(erro);
  return ehErroOnPath(erro) ? erro : null;
}

/** Tarefas do projeto, com filtro de status e criação já no projeto (FR-019). */
function TarefasDoProjeto({ projeto }: { projeto: TipoProjeto }) {
  const [status, setStatus] = useState<StatusTarefa | "todas">("aberta");
  const { data: tarefas = [] } = useTarefas({ projetoId: projeto.id, status });
  const { acoes, pedido } = useAcoesTarefas();
  const criar = useCriarTarefa();
  const navegar = useNavigate();
  const [criando, setCriando] = useState(false);

  const valoresNovaTarefa = useMemo<ValoresFormulario>(
    () => ({ ...VALORES_VAZIOS, vinculo: "projeto", projetoId: projeto.id, areaId: projeto.areaId, prioridade: projeto.prioridade }),
    [projeto.id, projeto.areaId, projeto.prioridade],
  );

  async function aoCriar(valores: ValoresFormulario): Promise<ErroOnPath | null> {
    try {
      await criar.mutateAsync(paraNovaTarefa(valores));
      toast(t("tarefas.avisos.criada"));
      setCriando(false);
      return null;
    } catch (erro) {
      return erroDeCampo(erro);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-subtitulo font-semibold">{t("projetos.tarefas")}</h2>
        <Select value={status} onValueChange={(valor) => setStatus(valor as StatusTarefa | "todas")}>
          <SelectTrigger size="sm" aria-label={t("tarefas.filtros.status")} className="min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["aberta", "concluida", "cancelada", "todas"] as const).map((s) => (
              <SelectItem key={s} value={s}>
                {t(`tarefas.status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => setCriando(true)}>
          <Plus />
          {t("projetos.acoes.novaTarefa")}
        </Button>
      </div>
      {tarefas.length === 0 ? (
        <p className="text-cinza-600">{t("projetos.semTarefas")}</p>
      ) : (
        <ListaTarefas
          tarefas={tarefas}
          selecionada={null}
          acoes={acoes}
          aoAbrir={(id) => navegar(`/tarefas?tarefa=${id}`)}
        />
      )}
      <ConfirmarSubtarefas pedido={pedido} />
      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("tarefas.novaTitulo")}</DialogTitle>
          </DialogHeader>
          {criando && (
            <FormularioTarefa
              valoresIniciais={valoresNovaTarefa}
              rotuloSalvar={t("tarefas.acoes.criar")}
              aoSalvar={aoCriar}
              aoCancelar={() => setCriando(false)}
              focarTitulo
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** Detalhe do projeto: dados, status e tarefas (specs/006-projetos, história 3). */
export function Projeto() {
  const { id = "" } = useParams();
  const { data: projeto, isError } = useProjeto(id);
  const { data: opcoes } = useOpcoesProjeto();
  const alterar = useAlterarProjeto();
  const excluir = useExcluirProjeto();
  const recuperar = useRecuperarProjeto();
  const navegar = useNavigate();

  const valoresIniciais = useMemo(
    () => (projeto ? valoresDoProjeto(projeto) : null),
    // Só muda quando o projeto muda de fato, para não apagar o que está sendo digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projeto?.id, projeto?.atualizadoEm],
  );

  if (isError || (projeto && projeto.arquivadoEm !== null)) return <NaoEncontrada />;
  if (!projeto || !valoresIniciais) return null;

  const grupo = opcoes?.grupos.find((g) => g.id === projeto.grupoId);
  const area = opcoes?.areas.find((a) => a.id === projeto.areaId);

  async function aoSalvar(valores: ValoresProjeto): Promise<ErroOnPath | null> {
    try {
      await alterar.mutateAsync({ id, dados: paraDadosProjeto(valores) });
      toast(t("projetos.avisos.salvo"));
      return null;
    } catch (erro) {
      return erroDeCampo(erro);
    }
  }

  async function aoExcluir() {
    try {
      await excluir.mutateAsync(id);
      navegar("/projetos");
      toast(t("projetos.avisos.excluido"), {
        duration: 5000,
        action: { label: t("projetos.avisos.desfazer"), onClick: () => recuperar.mutateAsync(id).catch(avisarErro) },
      });
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <TelaBase titulo={projeto.nome}>
      <div className="-mt-4 flex flex-col gap-3">
        <Link to="/projetos" className="flex items-center gap-1 self-start text-pequeno text-cinza-600 hover:text-preto">
          <ArrowLeft className="size-3.5" />
          {t("projetos.acoes.voltar")}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-sm bg-cinza-100 px-2 py-0.5 text-pequeno text-cinza-700">
            {t(`projetos.status.${projeto.status}`)}
          </span>
          <span className="text-pequeno text-cinza-500">{[area?.nome, grupo?.nome].filter(Boolean).join(" · ")}</span>
          <AcoesStatus projeto={projeto} grupo={grupo?.nome ?? ""} tamanho="sm" />
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => void aoExcluir()}>
            {t("projetos.acoes.excluir")}
          </Button>
        </div>
      </div>

      <div className="grid gap-10 xl:grid-cols-[1fr_24rem]">
        <TarefasDoProjeto projeto={projeto} />
        <section className="flex flex-col gap-3">
          <FormularioProjeto
            valoresIniciais={valoresIniciais}
            rotuloSalvar={t("projetos.acoes.salvar")}
            aoSalvar={aoSalvar}
            somenteComMudancas
          />
        </section>
      </div>
    </TelaBase>
  );
}
