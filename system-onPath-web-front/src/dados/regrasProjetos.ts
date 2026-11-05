/** Regras puras de projetos (specs/006-projetos/research.md, itens 2 e 3). */
import type { Projeto, StatusProjeto, Tarefa } from "./tipos";

/** Transições de status permitidas (RN05). */
export const TRANSICOES: Record<StatusProjeto, StatusProjeto[]> = {
  fila: ["ativo", "concluido", "cancelado"],
  ativo: ["pausado", "concluido", "cancelado"],
  pausado: ["ativo", "fila", "concluido", "cancelado"],
  concluido: ["fila"],
  cancelado: ["fila"],
};

export function podeMudar(de: StatusProjeto, para: StatusProjeto): boolean {
  return TRANSICOES[de].includes(para);
}

/** Tarefas que contam como próxima ação do projeto (RN08). */
export function tarefasAbertasDoProjeto(projetoId: string, tarefas: Tarefa[]): Tarefa[] {
  return tarefas.filter(
    (tarefa) => tarefa.projetoId === projetoId && tarefa.arquivadoEm === null && tarefa.status === "aberta",
  );
}

/** Ativo e sem tarefa aberta: precisa de uma próxima ação (RN08). */
export function semProximaAcao(projeto: Projeto, tarefas: Tarefa[]): boolean {
  return projeto.status === "ativo" && tarefasAbertasDoProjeto(projeto.id, tarefas).length === 0;
}
