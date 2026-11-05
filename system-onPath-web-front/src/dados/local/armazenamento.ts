import { criarErro } from "../erros";
import type { Colecoes, MetaArmazenamento, NomeColecao, Registros } from "../tipos";

const PREFIXO = "onpath:v1:";
const CHAVE_META = `${PREFIXO}meta`;

export const VERSAO_ESQUEMA = 1;

export const META_PADRAO: MetaArmazenamento = {
  versaoEsquema: VERSAO_ESQUEMA,
  dadosIniciaisEm: null,
  ultimaExportacaoEm: null,
};

export interface Alteracoes {
  colecoes?: Partial<Colecoes>;
  meta?: MetaArmazenamento;
}

export function chaveColecao(nome: NomeColecao): string {
  return `${PREFIXO}${nome}`;
}

function armazenamento(): Storage {
  try {
    const local = globalThis.localStorage;
    if (!local) throw new Error("localStorage ausente");
    return local;
  } catch (causa) {
    throw criarErro("armazenamento_indisponivel", { causa: String(causa) });
  }
}

function lerJson<V>(chave: string, padrao: V): V {
  const local = armazenamento();
  let bruto: string | null;
  try {
    bruto = local.getItem(chave);
  } catch (causa) {
    throw criarErro("armazenamento_indisponivel", { causa: String(causa) });
  }
  return bruto === null ? padrao : (JSON.parse(bruto) as V);
}

export function lerColecao<N extends NomeColecao>(nome: N): Registros[N][] {
  return lerJson<Registros[N][]>(chaveColecao(nome), []);
}

export function lerMeta(): MetaArmazenamento {
  return { ...META_PADRAO, ...lerJson<Partial<MetaArmazenamento>>(CHAVE_META, {}) };
}

/**
 * Grava várias chaves de uma vez. Se qualquer escrita falhar, as chaves já escritas voltam ao
 * valor anterior, para que a gravação nunca fique pela metade.
 */
export function gravar(alteracoes: Alteracoes): void {
  const local = armazenamento();

  const novosValores = new Map<string, string>();
  for (const [nome, registros] of Object.entries(alteracoes.colecoes ?? {})) {
    novosValores.set(chaveColecao(nome as NomeColecao), JSON.stringify(registros));
  }
  if (alteracoes.meta) {
    novosValores.set(CHAVE_META, JSON.stringify(alteracoes.meta));
  }

  const anteriores = new Map<string, string | null>();
  try {
    for (const chave of novosValores.keys()) {
      anteriores.set(chave, local.getItem(chave));
    }
  } catch (causa) {
    throw criarErro("armazenamento_indisponivel", { causa: String(causa) });
  }

  const escritas: string[] = [];
  try {
    for (const [chave, valor] of novosValores) {
      escritas.push(chave);
      local.setItem(chave, valor);
    }
  } catch (causa) {
    for (const chave of escritas) {
      const anterior = anteriores.get(chave) ?? null;
      try {
        if (anterior === null) local.removeItem(chave);
        else local.setItem(chave, anterior);
      } catch {
        // Restaurar um valor anterior nunca ocupa mais espaço do que ele já ocupava.
      }
    }
    throw criarErro("armazenamento_indisponivel", { causa: String(causa) });
  }
}

/** Remove todas as chaves do OnPath. */
export function limparTudo(): void {
  const local = armazenamento();
  try {
    const chaves: string[] = [];
    for (let i = 0; i < local.length; i++) {
      const chave = local.key(i);
      if (chave?.startsWith(PREFIXO)) chaves.push(chave);
    }
    chaves.forEach((chave) => local.removeItem(chave));
  } catch (causa) {
    throw criarErro("armazenamento_indisponivel", { causa: String(causa) });
  }
}
