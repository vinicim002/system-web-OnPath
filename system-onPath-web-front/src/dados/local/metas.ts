import type { ServicoMetas } from "../contratos";
import { criarErro } from "../erros";
import { esquemas, type AlteracaoMeta, type Meta, type NovaMeta } from "../tipos";
import { lerColecao } from "./armazenamento";
import { criarServicoColecao } from "./colecao";

const PESO_STATUS: Record<Meta["status"], number> = { ativa: 0, concluida: 1, cancelada: 1 };

/** Título sem espaços nas pontas e descrição vazia como `null`. */
function normalizar(registro: Record<string, unknown>): Record<string, unknown> {
  const normalizado = { ...registro };
  if (typeof normalizado.titulo === "string") normalizado.titulo = normalizado.titulo.trim();
  if (typeof normalizado.descricao === "string" && normalizado.descricao.trim() === "") normalizado.descricao = null;
  return normalizado;
}

/** Ativas primeiro; prazo mais próximo (sem prazo por último); criação. */
function compararMetas(a: Meta, b: Meta): number {
  const status = PESO_STATUS[a.status] - PESO_STATUS[b.status];
  if (status !== 0) return status;
  if (a.prazo !== b.prazo) {
    if (a.prazo === null) return 1;
    if (b.prazo === null) return -1;
    return a.prazo.localeCompare(b.prazo);
  }
  return a.criadoEm.localeCompare(b.criadoEm);
}

/** Serviço local de metas (specs/005-areas-metas-grupos/contracts/servicos.md). */
export function criarServicoMetas(): ServicoMetas {
  const { gravarVarios: _v, gravarCampos: _g, prepararVarios: _p, ...base } = criarServicoColecao<
    "metas",
    NovaMeta,
    AlteracaoMeta
  >("metas", esquemas.metas.completo, {
    completar: (registro) => {
      const area = lerColecao("areas").find((a) => a.id === registro.areaId && a.arquivadoEm === null);
      if (registro.areaId !== undefined && !area) throw criarErro("dados_invalidos", { campos: ["areaId"] });
      return normalizar(registro);
    },
  });

  return {
    ...base,

    async listarDaArea(areaId, hoje) {
      return (await base.listar())
        .filter((meta) => meta.areaId === areaId)
        .sort(compararMetas)
        .map((meta) => ({ ...meta, atrasada: meta.status === "ativa" && meta.prazo !== null && meta.prazo < hoje }));
    },
  };
}
