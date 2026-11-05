/** Converte o `git log` em entradas do histórico, pelas categorias dos Conventional Commits. */

export interface CommitBruto {
  hash: string;
  data: string;
  mensagem: string;
}

export type Categoria =
  | "adicionado"
  | "alterado"
  | "corrigido"
  | "retirado"
  | "documentacao"
  | "manutencao";

export interface EntradaHistorico {
  hash: string;
  data: string;
  categoria: Categoria;
  escopo: string | null;
  descricao: string;
  quebra: boolean;
}

const CONVENCIONAL = /^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$/;
const RETIRADA = /^(remove|retira|apaga|exclui|tira)\b/i;

const POR_TIPO: Record<string, Categoria> = {
  feat: "adicionado",
  fix: "corrigido",
  refactor: "alterado",
  perf: "alterado",
  style: "alterado",
  revert: "retirado",
  docs: "documentacao",
  build: "manutencao",
  chore: "manutencao",
  ci: "manutencao",
  test: "manutencao",
};

export function lerCommit({ hash, data, mensagem }: CommitBruto): EntradaHistorico {
  const partes = CONVENCIONAL.exec(mensagem);
  if (!partes) {
    return { hash, data, categoria: "manutencao", escopo: null, descricao: mensagem, quebra: false };
  }
  const [, tipo, escopo, quebra, descricao] = partes;
  const categoria = RETIRADA.test(descricao!) ? "retirado" : (POR_TIPO[tipo!] ?? "manutencao");
  return {
    hash,
    data,
    categoria,
    escopo: escopo ?? null,
    descricao: descricao!,
    quebra: quebra === "!",
  };
}
