import { useCallback, useMemo, useState } from "react";

import { useOpcoesTarefa } from "@/dados/consultas";
import { estaAtrasada, montarArvore, type TarefaNaArvore } from "@/dados/regrasTarefas";
import type { Tarefa } from "@/dados/tipos";
import { t } from "@/i18n";
import { hoje } from "@/i18n/datas";

import type { AcoesTarefas } from "./acoes";
import { LinhaTarefa } from "./LinhaTarefa";

interface Props {
  tarefas: Tarefa[];
  selecionada: string | null;
  acoes: AcoesTarefas;
  aoAbrir: (id: string) => void;
}

interface Linha {
  tarefa: TarefaNaArvore;
  nivel: number;
}

/** Lista de tarefas com as subtarefas expansíveis (FR-015). */
export function ListaTarefas({ tarefas, selecionada, acoes, aoAbrir }: Props) {
  const { data: opcoes } = useOpcoesTarefa();
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  const dataDeHoje = hoje();

  const aoExpandir = useCallback((id: string) => {
    setExpandidas((atuais) => {
      const novas = new Set(atuais);
      if (novas.has(id)) novas.delete(id);
      else novas.add(id);
      return novas;
    });
  }, []);

  const linhas = useMemo(() => {
    const resultado: Linha[] = [];
    const visitar = (no: TarefaNaArvore, nivel: number) => {
      resultado.push({ tarefa: no, nivel });
      if (expandidas.has(no.id)) for (const filha of no.subtarefas) visitar(filha, nivel + 1);
    };
    for (const raiz of montarArvore(tarefas)) visitar(raiz, 0);
    return resultado;
  }, [tarefas, expandidas]);

  const nomes = useMemo(() => {
    const porId = new Map<string, string>();
    for (const area of opcoes?.areas ?? []) porId.set(area.id, area.nome);
    for (const projeto of opcoes?.projetos ?? []) porId.set(projeto.id, projeto.nome);
    for (const materia of opcoes?.materias ?? []) porId.set(materia.id, materia.nome);
    return porId;
  }, [opcoes]);

  if (linhas.length === 0) {
    return <p className="px-3 text-cinza-600">{t("tarefas.vazia")}</p>;
  }

  return (
    <ul className="flex flex-col">
      {linhas.map(({ tarefa, nivel }) => {
        const vinculo = tarefa.projetoId ?? tarefa.materiaId;
        const contexto = [nomes.get(tarefa.areaId), vinculo ? nomes.get(vinculo) : t("tarefas.campos.avulsa")]
          .filter(Boolean)
          .join(" · ");
        return (
          <LinhaTarefa
            key={tarefa.id}
            tarefa={tarefa}
            nivel={nivel}
            quantidadeSubtarefas={tarefa.subtarefas.length}
            expandida={expandidas.has(tarefa.id)}
            selecionada={tarefa.id === selecionada}
            atrasada={estaAtrasada(tarefa, dataDeHoje)}
            contexto={contexto}
            acoes={acoes}
            aoAbrir={aoAbrir}
            aoExpandir={aoExpandir}
          />
        );
      })}
    </ul>
  );
}
