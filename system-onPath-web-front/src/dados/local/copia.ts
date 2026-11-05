import { z } from "zod";

import type { CopiaDados } from "../contratos";
import { criarErro } from "../erros";
import { esquemas, NOMES_COLECOES, type Colecoes, type NomeColecao } from "../tipos";
import { gravar, lerColecao, lerMeta, VERSAO_ESQUEMA } from "./armazenamento";

export const VERSAO_COPIA = 1;
export const FORMATO_COPIA = "onpath-copia";

const esquemaColecoes = z.object(
  Object.fromEntries(
    NOMES_COLECOES.map((nome) => [nome, z.array(esquemas[nome].completo)]),
  ) as { [N in NomeColecao]: z.ZodArray<(typeof esquemas)[N]["completo"]> },
);

export const esquemaCopia = z.object({
  formato: z.literal(FORMATO_COPIA),
  versao: z.number().int().min(1).max(VERSAO_COPIA),
  exportadoEm: z.iso.datetime(),
  colecoes: esquemaColecoes,
});

/** Campo de referência e a coleção para onde ele aponta. */
const REFERENCIAS: Record<string, NomeColecao> = {
  areaId: "areas",
  grupoId: "grupos",
  metaId: "metas",
  projetoId: "projetos",
  materiaId: "materias",
  colunaId: "colunas",
  tarefaPaiId: "tarefas",
  tarefaId: "tarefas",
  rotinaId: "rotinas",
  sessaoEstudoId: "sessoesEstudo",
  topicoId: "topicos",
};

function lerTodas(): Colecoes {
  return Object.fromEntries(NOMES_COLECOES.map((nome) => [nome, lerColecao(nome)])) as Colecoes;
}

export async function exportarCopia(): Promise<CopiaDados> {
  const agora = new Date().toISOString();
  const copia: CopiaDados = {
    formato: FORMATO_COPIA,
    versao: VERSAO_COPIA,
    exportadoEm: agora,
    colecoes: lerTodas(),
  };
  gravar({ meta: { ...lerMeta(), ultimaExportacaoEm: agora } });
  return copia;
}

function interpretar(conteudo: unknown): unknown {
  if (typeof conteudo !== "string") return conteudo;
  try {
    return JSON.parse(conteudo);
  } catch {
    throw criarErro("copia_invalida", { motivo: "json" });
  }
}

function conferirReferencias(colecoes: Colecoes): void {
  const ids = Object.fromEntries(
    NOMES_COLECOES.map((nome) => [nome, new Set(colecoes[nome].map((registro) => registro.id))]),
  ) as Record<NomeColecao, Set<string>>;

  for (const nome of NOMES_COLECOES) {
    for (const registro of colecoes[nome] as Record<string, unknown>[]) {
      for (const [campo, destino] of Object.entries(REFERENCIAS)) {
        const valor = registro[campo];
        if (typeof valor === "string" && !ids[destino].has(valor)) {
          throw criarErro("copia_referencia_quebrada", {
            colecao: nome,
            id: registro.id,
            campo,
            valor,
          });
        }
      }
    }
  }
}

/** Valida a cópia inteira e só então substitui todos os dados, em uma única gravação. */
export async function importarCopia(conteudo: unknown): Promise<{ registros: number }> {
  const bruto = interpretar(conteudo);

  const cabecalho = z
    .object({ formato: z.literal(FORMATO_COPIA), versao: z.number().int() })
    .safeParse(bruto);
  if (cabecalho.success && cabecalho.data.versao > VERSAO_COPIA) {
    throw criarErro("copia_versao_desconhecida", { versao: cabecalho.data.versao });
  }

  const resultado = esquemaCopia.safeParse(bruto);
  if (!resultado.success) {
    const campos = [...new Set(resultado.error.issues.map((problema) => problema.path.join(".")))];
    throw criarErro("copia_invalida", { campos: campos.slice(0, 20) });
  }

  const colecoes = resultado.data.colecoes as Colecoes;
  conferirReferencias(colecoes);

  gravar({
    colecoes,
    meta: {
      ...lerMeta(),
      versaoEsquema: VERSAO_ESQUEMA,
      dadosIniciaisEm: new Date().toISOString(),
    },
  });

  const registros = NOMES_COLECOES.reduce((total, nome) => total + colecoes[nome].length, 0);
  return { registros };
}
