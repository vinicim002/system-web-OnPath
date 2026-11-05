import { t } from "@/i18n";

import { documento } from "./documentos";
import { Markdown } from "./Markdown";
import { Progresso } from "./Progresso";
import { calcularAndamento, type Etapa } from "./tarefas";

/** Trecho de um documento entre um título "## …" e o próximo. */
function secao(markdown: string, titulo: string): string {
  const inicio = markdown.indexOf(`## ${titulo}`);
  if (inicio === -1) return "";
  const resto = markdown.slice(inicio).split("\n").slice(1).join("\n");
  const fim = resto.search(/^## /m);
  return fim === -1 ? resto : resto.slice(0, fim);
}

function CartaoEtapa({ rotulo, etapa }: { rotulo: string; etapa: Etapa | null }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <p className="text-pequeno text-cinza-500">{rotulo}</p>
      {etapa ? (
        <>
          <p className="font-semibold">{etapa.nome}</p>
          <ul className="flex flex-col gap-1 text-pequeno">
            {etapa.tarefas.map((tarefa) => (
              <li key={tarefa.id} className={tarefa.feita ? "text-cinza-400 line-through" : ""}>
                {tarefa.id} · {tarefa.titulo}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-cinza-600">{t("painel.visao.semEtapa")}</p>
      )}
    </div>
  );
}

export function VisaoGeral({ etapas }: { etapas: Etapa[] }) {
  const andamento = calcularAndamento(etapas);
  const objetivo = secao(documento("docs/spec.md")?.conteudo ?? "", "1. Objetivo");

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h2 className="text-subtitulo font-semibold">{t("painel.visao.objetivo")}</h2>
        <Markdown conteudo={objetivo} />
      </section>

      <section className="flex max-w-200 flex-col gap-3">
        <h2 className="text-subtitulo font-semibold">{t("painel.visao.andamento")}</h2>
        <Progresso feitas={andamento.feitas} total={andamento.total} />
        <p className="text-cinza-600">
          {t("painel.visao.tarefasFeitas", { feitas: andamento.feitas, total: andamento.total })}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <CartaoEtapa rotulo={t("painel.visao.etapaAtual")} etapa={andamento.atual} />
          <CartaoEtapa rotulo={t("painel.visao.proximaEtapa")} etapa={andamento.proxima} />
        </div>
      </section>

      <section className="flex max-w-200 flex-col gap-3">
        <h2 className="text-subtitulo font-semibold">{t("painel.visao.etapas")}</h2>
        <ul className="flex flex-col gap-3">
          {etapas.map((etapa) => {
            const feitas = etapa.tarefas.filter((tarefa) => tarefa.feita).length;
            return (
              <li key={etapa.nome} className="grid grid-cols-[1fr_8rem_3rem] items-center gap-3">
                <span className={feitas === etapa.tarefas.length ? "text-cinza-500" : ""}>
                  {etapa.nome}
                </span>
                <Progresso feitas={feitas} total={etapa.tarefas.length} />
                <span className="text-right text-pequeno text-cinza-500">
                  {feitas}/{etapa.tarefas.length}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
