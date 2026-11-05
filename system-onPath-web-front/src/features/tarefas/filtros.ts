import type { FiltrosTarefas } from "@/dados/contratos";
import type { Prioridade, StatusTarefa } from "@/dados/tipos";

/** Nomes dos parâmetros do endereço para cada filtro. */
export const PARAMETROS = {
  areaId: "area",
  projetoId: "projeto",
  materiaId: "materia",
  prioridade: "prioridade",
  status: "status",
} as const satisfies Record<keyof FiltrosTarefas, string>;

const PRIORIDADES: Prioridade[] = ["alta", "media", "baixa"];
const STATUS: (StatusTarefa | "todas")[] = ["aberta", "concluida", "cancelada", "todas"];

/** Filtros lidos do endereço, ignorando valores desconhecidos. */
export function filtrosDoEndereco(parametros: URLSearchParams): FiltrosTarefas {
  const filtros: FiltrosTarefas = {};
  const area = parametros.get(PARAMETROS.areaId);
  const projeto = parametros.get(PARAMETROS.projetoId);
  const materia = parametros.get(PARAMETROS.materiaId);
  const prioridade = parametros.get(PARAMETROS.prioridade) as Prioridade | null;
  const status = parametros.get(PARAMETROS.status) as StatusTarefa | "todas" | null;
  if (area) filtros.areaId = area;
  if (projeto) filtros.projetoId = projeto;
  if (materia) filtros.materiaId = materia;
  if (prioridade && PRIORIDADES.includes(prioridade)) filtros.prioridade = prioridade;
  if (status && STATUS.includes(status)) filtros.status = status;
  return filtros;
}
