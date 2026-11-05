/**
 * Regras puras de lista das tarefas (specs/003-tarefas/data-model.md): filtrar, ordenar,
 * montar a árvore e saber se está atrasada. Usadas pelo serviço local e pela tela.
 */
import type { FiltrosTarefas } from "./contratos";
import type { Prioridade, Tarefa } from "./tipos";

const PESO_PRIORIDADE: Record<Prioridade, number> = { alta: 0, media: 1, baixa: 2 };

export interface TarefaNaArvore extends Tarefa {
  subtarefas: TarefaNaArvore[];
}

function atendeAosFiltros(tarefa: Tarefa, filtros: FiltrosTarefas): boolean {
  const status = filtros.status ?? "aberta";
  if (status !== "todas" && tarefa.status !== status) return false;
  if (filtros.areaId && tarefa.areaId !== filtros.areaId) return false;
  if (filtros.prioridade && tarefa.prioridade !== filtros.prioridade) return false;
  if (filtros.materiaId && tarefa.materiaId !== filtros.materiaId) return false;
  if (filtros.projetoId === "avulsa") {
    if (tarefa.projetoId !== null || tarefa.materiaId !== null) return false;
  } else if (filtros.projetoId && tarefa.projetoId !== filtros.projetoId) {
    return false;
  }
  return true;
}

/** Sobe pelos pais até a tarefa do topo. */
export function tarefaDoTopo(tarefa: Tarefa, porId: Map<string, Tarefa>): Tarefa {
  let atual = tarefa;
  const vistas = new Set<string>();
  while (atual.tarefaPaiId && !vistas.has(atual.id)) {
    vistas.add(atual.id);
    const pai = porId.get(atual.tarefaPaiId);
    if (!pai) break;
    atual = pai;
  }
  return atual;
}

/**
 * Tarefas principais que atendem aos filtros, ou que têm alguma subtarefa que atende, junto com
 * todas as subtarefas delas (para a árvore não perder o contexto).
 */
export function filtrarTarefas(tarefas: Tarefa[], filtros: FiltrosTarefas = {}): Tarefa[] {
  const porId = new Map(tarefas.map((tarefa) => [tarefa.id, tarefa]));
  const topos = new Set<string>();
  for (const tarefa of tarefas) {
    if (atendeAosFiltros(tarefa, filtros)) topos.add(tarefaDoTopo(tarefa, porId).id);
  }
  return tarefas.filter((tarefa) => topos.has(tarefaDoTopo(tarefa, porId).id));
}

/** Prioridade (alta → baixa), prazo mais próximo (vazio por último) e criação. */
export function compararTarefas(a: Tarefa, b: Tarefa): number {
  const prioridade = PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade];
  if (prioridade !== 0) return prioridade;
  if (a.prazo !== b.prazo) {
    if (a.prazo === null) return 1;
    if (b.prazo === null) return -1;
    return a.prazo.localeCompare(b.prazo);
  }
  return a.criadoEm.localeCompare(b.criadoEm);
}

export function ordenarTarefas(tarefas: Tarefa[]): Tarefa[] {
  return [...tarefas].sort(compararTarefas);
}

/** Principais com as subtarefas aninhadas, cada nível na ordem da lista. */
export function montarArvore(tarefas: Tarefa[]): TarefaNaArvore[] {
  const nos = new Map<string, TarefaNaArvore>(
    ordenarTarefas(tarefas).map((tarefa) => [tarefa.id, { ...tarefa, subtarefas: [] }]),
  );
  const raizes: TarefaNaArvore[] = [];
  for (const no of nos.values()) {
    const pai = no.tarefaPaiId ? nos.get(no.tarefaPaiId) : undefined;
    if (pai) pai.subtarefas.push(no);
    else raizes.push(no);
  }
  return raizes;
}

/** Aberta e com prazo anterior a hoje (AAAA-MM-DD no fuso do usuário). */
export function estaAtrasada(tarefa: Tarefa, hoje: string): boolean {
  return tarefa.status === "aberta" && tarefa.prazo !== null && tarefa.prazo < hoje;
}

/** Ids da tarefa e de todas as descendentes. */
export function idsDaArvore(id: string, tarefas: Tarefa[]): Set<string> {
  const filhos = new Map<string, string[]>();
  for (const tarefa of tarefas) {
    if (!tarefa.tarefaPaiId) continue;
    filhos.set(tarefa.tarefaPaiId, [...(filhos.get(tarefa.tarefaPaiId) ?? []), tarefa.id]);
  }
  const ids = new Set<string>();
  const pendentes = [id];
  while (pendentes.length > 0) {
    const atual = pendentes.pop()!;
    if (ids.has(atual)) continue;
    ids.add(atual);
    pendentes.push(...(filhos.get(atual) ?? []));
  }
  return ids;
}
