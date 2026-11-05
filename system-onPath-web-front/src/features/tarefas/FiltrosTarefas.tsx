import { useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOpcoesTarefa } from "@/dados/consultas";
import type { FiltrosTarefas as Filtros } from "@/dados/contratos";
import { t } from "@/i18n";

import { PARAMETROS } from "./filtros";

/** Valor da opção "todas/todos": o Select não aceita valor vazio. */
const TODOS = "_";

interface Opcao {
  valor: string;
  rotulo: string;
}

function Filtro({
  rotulo,
  valor,
  opcoes,
  rotuloTodos,
  aoMudar,
}: {
  rotulo: string;
  valor: string | undefined;
  opcoes: Opcao[];
  rotuloTodos?: string;
  aoMudar: (valor: string | null) => void;
}) {
  return (
    <Select value={valor ?? TODOS} onValueChange={(novo) => aoMudar(novo === TODOS ? null : novo)}>
      <SelectTrigger size="sm" aria-label={rotulo} className="min-w-32">
        <span className="text-cinza-500">{rotulo}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {rotuloTodos && <SelectItem value={TODOS}>{rotuloTodos}</SelectItem>}
        {opcoes.map((opcao) => (
          <SelectItem key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Filtros da lista, guardados no endereço (research.md, item 8). */
export function FiltrosTarefas({ filtros }: { filtros: Filtros }) {
  const [parametros, setParametros] = useSearchParams();
  const { data: opcoes } = useOpcoesTarefa();

  function mudar(chave: keyof Filtros, valor: string | null) {
    const novos = new URLSearchParams(parametros);
    if (valor === null) novos.delete(PARAMETROS[chave]);
    else novos.set(PARAMETROS[chave], valor);
    setParametros(novos);
  }

  function limpar() {
    const novos = new URLSearchParams();
    const aberta = parametros.get("tarefa");
    if (aberta) novos.set("tarefa", aberta);
    setParametros(novos);
  }

  const algumFiltro = Object.keys(filtros).length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filtro
        rotulo={t("tarefas.filtros.area")}
        valor={filtros.areaId}
        rotuloTodos={t("tarefas.filtros.todas")}
        opcoes={(opcoes?.areas ?? []).map((a) => ({ valor: a.id, rotulo: a.nome }))}
        aoMudar={(valor) => mudar("areaId", valor)}
      />
      <Filtro
        rotulo={t("tarefas.filtros.projeto")}
        valor={filtros.projetoId}
        rotuloTodos={t("tarefas.filtros.todos")}
        opcoes={[
          { valor: "avulsa", rotulo: t("tarefas.filtros.avulsas") },
          ...(opcoes?.projetos ?? []).map((p) => ({ valor: p.id, rotulo: p.nome })),
        ]}
        aoMudar={(valor) => mudar("projetoId", valor)}
      />
      {(opcoes?.materias.length ?? 0) > 0 && (
        <Filtro
          rotulo={t("tarefas.filtros.materia")}
          valor={filtros.materiaId}
          rotuloTodos={t("tarefas.filtros.todas")}
          opcoes={(opcoes?.materias ?? []).map((m) => ({ valor: m.id, rotulo: m.nome }))}
          aoMudar={(valor) => mudar("materiaId", valor)}
        />
      )}
      <Filtro
        rotulo={t("tarefas.filtros.prioridade")}
        valor={filtros.prioridade}
        rotuloTodos={t("tarefas.filtros.todas")}
        opcoes={(["alta", "media", "baixa"] as const).map((p) => ({
          valor: p,
          rotulo: t(`tarefas.prioridades.${p}`),
        }))}
        aoMudar={(valor) => mudar("prioridade", valor)}
      />
      <Filtro
        rotulo={t("tarefas.filtros.status")}
        valor={filtros.status ?? "aberta"}
        opcoes={(["aberta", "concluida", "cancelada", "todas"] as const).map((s) => ({
          valor: s,
          rotulo: t(`tarefas.status.${s}`),
        }))}
        aoMudar={(valor) => mudar("status", valor === "aberta" ? null : valor)}
      />
      {algumFiltro && (
        <Button variant="ghost" size="sm" onClick={limpar}>
          {t("tarefas.filtros.limpar")}
        </Button>
      )}
    </div>
  );
}
