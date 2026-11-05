import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDecidirPendencia, useOpcoesTarefa, useRemarcarTodas } from "@/dados/consultas";
import type { Destino, Pendencia } from "@/dados/contratos";
import { avisarErro } from "@/features/caixa/avisos";
import { t, type ChaveTexto } from "@/i18n";
import { dataPrazo, somarDias } from "@/i18n/datas";

const AVISO: Record<Destino["tipo"], ChaveTexto> = {
  remarcar: "hoje.avisos.remarcada",
  devolver: "hoje.avisos.devolvida",
  cancelar: "hoje.avisos.cancelada",
};

function LinhaPendencia({ pendencia, hoje, contexto }: { pendencia: Pendencia; hoje: string; contexto: string }) {
  const decidir = useDecidirPendencia();
  const [escolhendoData, setEscolhendoData] = useState(false);
  const [data, setData] = useState(somarDias(hoje, 1));

  async function aplicar(destino: Destino) {
    try {
      await decidir.mutateAsync({ tarefaId: pendencia.tarefa.id, destino, hoje });
      toast(t(AVISO[destino.tipo]));
    } catch (erro) {
      avisarErro(erro);
    }
  }

  const ocupado = decidir.isPending;

  return (
    <li className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-col gap-0.5">
        <p className="font-medium">{pendencia.tarefa.titulo}</p>
        <p className="text-pequeno text-cinza-500">
          {[pendencia.tituloPrincipal, contexto, t("hoje.revisao.eraDe", { data: dataPrazo(pendencia.data) })]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={ocupado} onClick={() => void aplicar({ tipo: "remarcar", data: hoje })}>
          {t("hoje.revisao.hoje")}
        </Button>
        <Button size="sm" variant="outline" disabled={ocupado} onClick={() => setEscolhendoData((atual) => !atual)}>
          {t("hoje.revisao.outraData")}
        </Button>
        <Button size="sm" variant="outline" disabled={ocupado} onClick={() => void aplicar({ tipo: "devolver" })}>
          {t("hoje.revisao.devolver")}
        </Button>
        <Button size="sm" variant="ghost" disabled={ocupado} onClick={() => void aplicar({ tipo: "cancelar" })}>
          {t("hoje.revisao.cancelar")}
        </Button>
      </div>
      {escolhendoData && (
        <form
          className="flex items-center gap-2"
          onSubmit={(evento) => {
            evento.preventDefault();
            void aplicar({ tipo: "remarcar", data });
          }}
        >
          <Input
            type="date"
            min={hoje}
            value={data}
            onChange={(evento) => setData(evento.target.value)}
            aria-label={t("hoje.revisao.novaData")}
            className="h-8 w-44"
            autoFocus
          />
          <Button size="sm" type="submit" disabled={ocupado || data === ""}>
            {t("hoje.revisao.remarcar")}
          </Button>
        </form>
      )}
    </li>
  );
}

/** Revisão das pendências de dias anteriores, antes do plano do dia (RN11 e RN25). */
export function RevisaoPendencias({ hoje, pendencias }: { hoje: string; pendencias: Pendencia[] }) {
  const remarcarTodas = useRemarcarTodas();
  const { data: opcoes } = useOpcoesTarefa();
  const nomes = new Map<string, string>();
  for (const projeto of opcoes?.projetos ?? []) nomes.set(projeto.id, projeto.nome);
  for (const materia of opcoes?.materias ?? []) nomes.set(materia.id, materia.nome);

  async function aoRemarcarTodas() {
    try {
      await remarcarTodas.mutateAsync(hoje);
      toast(t("hoje.avisos.todasRemarcadas"));
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <section className="flex max-w-180 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-subtitulo font-semibold">{t("hoje.revisao.titulo")}</h2>
        <p className="text-cinza-600">
          {pendencias.length === 1
            ? t("hoje.revisao.descricaoUma")
            : t("hoje.revisao.descricao", { quantidade: pendencias.length })}
        </p>
      </div>
      {pendencias.length > 1 && (
        <div>
          <Button onClick={() => void aoRemarcarTodas()} disabled={remarcarTodas.isPending}>
            {t("hoje.revisao.remarcarTodas")}
          </Button>
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {pendencias.map((pendencia) => {
          const vinculo = pendencia.tarefa.projetoId ?? pendencia.tarefa.materiaId;
          return (
            <LinhaPendencia
              key={pendencia.tarefa.id}
              pendencia={pendencia}
              hoje={hoje}
              contexto={vinculo ? (nomes.get(vinculo) ?? "") : t("tarefas.campos.avulsa")}
            />
          );
        })}
      </ul>
    </section>
  );
}
