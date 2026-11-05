import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { TelaBase } from "@/components/TelaBase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useAlterarRotina,
  useArquivarRotina,
  useCriarRotina,
  useOpcoesTarefa,
  useRecuperarRotina,
  useRotinas,
  useTotalRotina,
} from "@/dados/consultas";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import type { Area, Rotina } from "@/dados/tipos";
import { avisarErro } from "@/features/caixa/avisos";
import { useHoje } from "@/features/hoje/useHoje";
import { listaDeDias } from "@/features/rotinas/dias";
import { FormularioRotina, type ValoresRotina } from "@/features/rotinas/FormularioRotina";
import { paraDadosRotina } from "@/features/rotinas/valoresRotina";
import { t } from "@/i18n";
import { diaDaSemana, duracao } from "@/i18n/datas";

const NOVA: ValoresRotina = { nome: "", areaId: "", tipo: "horario", diasSemana: [1, 2, 3, 4, 5], horaInicio: "", duracaoMin: "", metaMin: "" };

function valoresDa(rotina: Rotina): ValoresRotina {
  return {
    nome: rotina.nome,
    areaId: rotina.areaId,
    tipo: rotina.tipo,
    diasSemana: rotina.diasSemana,
    horaInicio: rotina.horaInicio ?? "",
    duracaoMin: rotina.duracaoMin ? String(rotina.duracaoMin) : "",
    metaMin: rotina.metaMin ? String(rotina.metaMin) : "",
  };
}

/** Soma de hoje ao lado da meta (RN28). */
function TotalDeHoje({ rotina, hoje }: { rotina: Rotina; hoje: string }) {
  const { data: total = 0 } = useTotalRotina(rotina.id, hoje);
  if (!rotina.metaMin || !rotina.diasSemana.includes(diaDaSemana(hoje))) return null;
  return (
    <span className="text-pequeno font-medium">
      {t("rotinas.hojeTotal", { feito: duracao(total), meta: duracao(rotina.metaMin) })}
    </span>
  );
}

interface PropsSecao {
  titulo: string;
  lista: Rotina[];
  areas: Map<string, Area>;
  hoje: string;
  aoEditar: (rotina: Rotina) => void;
  aoArquivar: (id: string) => void;
}

function Secao({ titulo, lista, areas, hoje, aoEditar, aoArquivar }: PropsSecao) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-semibold">{titulo}</h2>
      {lista.length === 0 && <p className="text-cinza-600">{t("rotinas.vazio")}</p>}
      <ul className="flex flex-col divide-y divide-cinza-100 rounded-lg border">
        {lista.map((rotina) => {
          const area = areas.get(rotina.areaId);
          return (
            <li key={rotina.id} className="group flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
              <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: area?.cor }} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">{rotina.nome}</span>
                <span className="text-pequeno text-cinza-500">
                  {[area?.nome, listaDeDias(rotina.diasSemana)].filter(Boolean).join(" · ")}
                </span>
              </div>
              <span className="text-pequeno text-cinza-600 tabular-nums">
                {rotina.tipo === "horario"
                  ? [rotina.horaInicio, rotina.duracaoMin ? duracao(rotina.duracaoMin) : null].filter(Boolean).join(" · ")
                  : rotina.metaMin
                    ? `${t("rotinas.meta")}: ${duracao(rotina.metaMin)}`
                    : ""}
              </span>
              {rotina.tipo === "meta_horas" && <TotalDeHoje rotina={rotina} hoje={hoje} />}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                <Button size="xs" variant="ghost" onClick={() => aoEditar(rotina)}>
                  {t("rotinas.editar")}
                </Button>
                <Button size="xs" variant="ghost" onClick={() => void aoArquivar(rotina.id)}>
                  {t("rotinas.arquivar")}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Tela Rotinas: com horário e com meta de horas (seção 6.8). */
export function Rotinas() {
  const hoje = useHoje();
  const { data: rotinas = [] } = useRotinas();
  const { data: opcoes } = useOpcoesTarefa();
  const criar = useCriarRotina();
  const alterar = useAlterarRotina();
  const arquivar = useArquivarRotina();
  const recuperar = useRecuperarRotina();
  const [editando, setEditando] = useState<Rotina | "nova" | null>(null);

  const areas = new Map((opcoes?.areas ?? []).map((a) => [a.id, a]));

  async function aoSalvar(valores: ValoresRotina): Promise<ErroOnPath | null> {
    try {
      if (editando === "nova") {
        await criar.mutateAsync(paraDadosRotina(valores));
        toast(t("rotinas.avisos.criada"));
      } else if (editando) {
        await alterar.mutateAsync({ id: editando.id, dados: paraDadosRotina(valores) });
        toast(t("rotinas.avisos.salva"));
      }
      setEditando(null);
      return null;
    } catch (erro) {
      if (ehErroOnPath(erro) && erro.codigo === "dados_invalidos") return erro;
      avisarErro(erro);
      return ehErroOnPath(erro) ? erro : null;
    }
  }

  async function aoArquivar(id: string) {
    try {
      await arquivar.mutateAsync(id);
      toast(t("rotinas.avisos.arquivada"), {
        duration: 5000,
        action: { label: t("rotinas.avisos.desfazer"), onClick: () => recuperar.mutateAsync(id).catch(avisarErro) },
      });
    } catch (erro) {
      avisarErro(erro);
    }
  }

  const propsSecao = { areas, hoje, aoEditar: setEditando, aoArquivar: (id: string) => void aoArquivar(id) };

  return (
    <TelaBase titulo={t("telas.rotinas.titulo")}>
      <div className="-mt-2">
        <Button onClick={() => setEditando("nova")}>
          <Plus />
          {t("rotinas.nova")}
        </Button>
      </div>
      <div className="flex max-w-200 flex-col gap-8">
        <Secao titulo={t("rotinas.comHorario")} lista={rotinas.filter((r) => r.tipo === "horario")} {...propsSecao} />
        <Secao titulo={t("rotinas.comMeta")} lista={rotinas.filter((r) => r.tipo === "meta_horas")} {...propsSecao} />
      </div>
      <Dialog open={editando !== null} onOpenChange={(aberto) => !aberto && setEditando(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t(editando === "nova" ? "rotinas.novaTitulo" : "rotinas.editarTitulo")}</DialogTitle>
          </DialogHeader>
          {editando && (
            <FormularioRotina
              valoresIniciais={editando === "nova" ? NOVA : valoresDa(editando)}
              rotuloSalvar={t(editando === "nova" ? "rotinas.criar" : "rotinas.salvar")}
              aoSalvar={aoSalvar}
              aoCancelar={() => setEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </TelaBase>
  );
}
