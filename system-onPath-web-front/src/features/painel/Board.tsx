import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import type { ReactNode } from "react";

import { t } from "@/i18n";

import { calcularAndamento, type Etapa, type Tarefa } from "./tarefas";

function Cartao({ tarefa, icone }: { tarefa: Tarefa; icone: ReactNode }) {
  return (
    <li className="flex flex-col gap-1.5 rounded-md border bg-branco p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-cinza-500 [&_svg]:size-4">{icone}</span>
        <p className="font-medium">
          <span className="text-cinza-500">{tarefa.id}</span> {tarefa.titulo}
        </p>
      </div>
      {tarefa.descricao && <p className="text-pequeno text-cinza-600">{tarefa.descricao}</p>}
      {tarefa.prontoQuando && !tarefa.feita && (
        <p className="text-pequeno text-cinza-500">
          {t("painel.board.prontoQuando")}: {tarefa.prontoQuando}
        </p>
      )}
      <p className="text-pequeno text-cinza-400">{tarefa.etapa}</p>
    </li>
  );
}

function Coluna({ titulo, quantidade, children }: { titulo: string; quantidade: number; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-lg bg-cinza-50 p-3">
      <h2 className="flex items-center justify-between px-1 font-semibold">
        {titulo}
        <span className="text-pequeno font-normal text-cinza-500">{quantidade}</span>
      </h2>
      <ul className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto">{children}</ul>
    </section>
  );
}

/** Board das tarefas do docs/tasks.md: a fazer, etapa atual e feito. */
export function Board({ etapas }: { etapas: Etapa[] }) {
  const { atual } = calcularAndamento(etapas);
  const tarefas = etapas.flatMap((etapa) => etapa.tarefas);
  const naEtapaAtual = tarefas.filter((tarefa) => !tarefa.feita && tarefa.etapa === atual?.nome);
  const aFazer = tarefas.filter((tarefa) => !tarefa.feita && tarefa.etapa !== atual?.nome);
  const feitas = tarefas.filter((tarefa) => tarefa.feita).reverse();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Coluna titulo={t("painel.board.aFazer")} quantidade={aFazer.length}>
        {aFazer.map((tarefa) => (
          <Cartao key={tarefa.id} tarefa={tarefa} icone={<Circle />} />
        ))}
      </Coluna>
      <Coluna titulo={t("painel.board.etapaAtual")} quantidade={naEtapaAtual.length}>
        {naEtapaAtual.map((tarefa) => (
          <Cartao key={tarefa.id} tarefa={tarefa} icone={<CircleDot />} />
        ))}
      </Coluna>
      <Coluna titulo={t("painel.board.feito")} quantidade={feitas.length}>
        {feitas.map((tarefa) => (
          <Cartao key={tarefa.id} tarefa={tarefa} icone={<CheckCircle2 />} />
        ))}
      </Coluna>
    </div>
  );
}
