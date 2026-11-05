import type { ServicoItensCaixa } from "../contratos";
import { esquemas, type AlteracaoItemCaixa, type ItemCaixa, type NovoItemCaixa } from "../tipos";
import { criarServicoColecao } from "./colecao";

/** Os espaços das pontas saem antes de validar, então só espaços vira texto vazio (FR-004). */
function semEspacosNasPontas(registro: Record<string, unknown>): Record<string, unknown> {
  return typeof registro.conteudo === "string"
    ? { ...registro, conteudo: registro.conteudo.trim() }
    : registro;
}

/**
 * Ordena do mais recente para o mais antigo pela data escolhida. Em empate, o registro gravado
 * depois vem antes, porque a coleção guarda os registros na ordem de criação.
 */
function maisRecentesPrimeiro(itens: ItemCaixa[], data: (item: ItemCaixa) => string): ItemCaixa[] {
  return [...itens].reverse().sort((a, b) => data(b).localeCompare(data(a)));
}

/**
 * Serviço local da caixa (specs/002-caixa-entrada/data-model.md). Regra: `status = descartado`
 * se, e somente se, `arquivadoEm` estiver preenchido. Os dois campos são gravados juntos.
 */
export function criarServicoItensCaixa(): ServicoItensCaixa {
  const { gravarCampos, ...base } = criarServicoColecao<
    "itensCaixa",
    NovoItemCaixa,
    AlteracaoItemCaixa
  >("itensCaixa", esquemas.itensCaixa.completo, { completar: semEspacosNasPontas });

  async function descartar(id: string): Promise<ItemCaixa> {
    const atual = await base.obter(id);
    if (atual.status === "descartado" && atual.arquivadoEm !== null) return atual;
    return gravarCampos(id, { status: "descartado", arquivadoEm: new Date().toISOString() });
  }

  return {
    ...base,

    async listarNovos() {
      const ativos = await base.listar();
      return maisRecentesPrimeiro(
        ativos.filter((item) => item.status === "novo"),
        (item) => item.criadoEm,
      );
    },

    async listarDescartados() {
      const todos = await base.listar({ incluirArquivados: true });
      return maisRecentesPrimeiro(
        todos.filter((item) => item.status === "descartado"),
        (item) => item.arquivadoEm ?? item.atualizadoEm,
      );
    },

    capturar(conteudo) {
      return base.criar({ conteudo, status: "novo" });
    },

    /** Só o texto muda por aqui. A situação muda por `descartar` e `recuperar`. */
    alterar(id, { conteudo }) {
      return base.alterar(id, conteudo === undefined ? {} : { conteudo });
    },

    descartar,

    async excluir(id) {
      await descartar(id);
    },

    async recuperar(id) {
      const atual = await base.obter(id);
      if (atual.status === "novo" && atual.arquivadoEm === null) return atual;
      return gravarCampos(id, { status: "novo", arquivadoEm: null });
    },
  };
}
