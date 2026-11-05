import type { FiltrosProjetos } from "@/dados/contratos";
import type { StatusProjeto } from "@/dados/tipos";

export const STATUS_PROJETO: StatusProjeto[] = ["ativo", "fila", "pausado", "concluido", "cancelado"];

/** Filtros de projetos lidos do endereço. */
export function filtrosDeProjetos(parametros: URLSearchParams): FiltrosProjetos {
  const filtros: FiltrosProjetos = {};
  const area = parametros.get("area");
  const status = parametros.get("status") as StatusProjeto | null;
  if (area) filtros.areaId = area;
  if (status && STATUS_PROJETO.includes(status)) filtros.status = status;
  return filtros;
}

