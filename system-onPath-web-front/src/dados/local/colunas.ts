import type { ServicoColunas } from "../contratos";
import { criarErro } from "../erros";
import { esquemas, type AlteracaoColuna, type Coluna, type NovaColuna } from "../tipos";
import { gravar, lerColecao } from "./armazenamento";
import { criarServicoColecao } from "./colecao";
import { chaveDeNome } from "./nomes";

function porOrdem(a: Coluna, b: Coluna): number {
  return a.ordem - b.ordem || a.criadoEm.localeCompare(b.criadoEm);
}

/** Serviço local de colunas do Kanban (specs/007-kanban/contracts/servicos.md). */
export function criarServicoColunas(): ServicoColunas {
  const { gravarVarios, gravarCampos, prepararVarios: _p, ...base } = criarServicoColecao<
    "colunas",
    NovaColuna,
    AlteracaoColuna
  >("colunas", esquemas.colunas.completo);

  function ativasDoProjeto(projetoId: string): Coluna[] {
    return lerColecao("colunas")
      .filter((coluna) => coluna.projetoId === projetoId && coluna.arquivadoEm === null)
      .sort(porOrdem);
  }

  function proximaOrdem(projetoId: string): number {
    const ordens = ativasDoProjeto(projetoId).map((c) => c.ordem);
    return ordens.length === 0 ? 0 : Math.max(...ordens) + 1;
  }

  function validarNome(nome: unknown, projetoId: string, ignorar?: string): string {
    const limpo = typeof nome === "string" ? nome.trim() : "";
    if (limpo === "") throw criarErro("dados_invalidos", { campos: ["nome"] });
    const chave = chaveDeNome(limpo);
    if (ativasDoProjeto(projetoId).some((c) => c.id !== ignorar && chaveDeNome(c.nome) === chave)) {
      throw criarErro("nome_repetido", { campos: ["nome"] });
    }
    return limpo;
  }

  return {
    ...base,

    async listarDoProjeto(projetoId) {
      return ativasDoProjeto(projetoId);
    },

    async criar({ projetoId, nome }) {
      const projeto = lerColecao("projetos").find((p) => p.id === projetoId && p.arquivadoEm === null);
      if (!projeto) throw criarErro("dados_invalidos", { campos: ["projetoId"] });
      return base.criar({ projetoId, nome: validarNome(nome, projetoId), ordem: proximaOrdem(projetoId), final: false });
    },

    async alterar(id, { nome }) {
      const atual = await base.obter(id);
      if (nome === undefined) return atual;
      return gravarCampos(id, { nome: validarNome(nome, atual.projetoId, id) });
    },

    async reordenar(projetoId, ids) {
      const esperadas = new Set(ativasDoProjeto(projetoId).map((c) => c.id));
      if (ids.length !== esperadas.size || ids.some((id) => !esperadas.has(id))) {
        throw criarErro("dados_invalidos", { campos: ["ids"] });
      }
      await gravarVarios(ids.map((id, ordem) => ({ id, campos: { ordem } })));
    },

    async marcarFinal(id, final) {
      const atual = await base.obter(id);
      const mudancas = ativasDoProjeto(atual.projetoId)
        .filter((c) => (c.id === id ? c.final !== final : final && c.final))
        .map((c) => ({ id: c.id, campos: { final: c.id === id ? final : false } }));
      if (mudancas.length > 0) await gravarVarios(mudancas);
    },

    async excluir(id) {
      const atual = await base.obter(id);
      if (atual.arquivadoEm !== null) return;
      // A coluna e as tarefas dela mudam na mesma escrita, com o mesmo instante, que o desfazer usa.
      const agora = new Date().toISOString();
      const colunas = lerColecao("colunas").map((c) => (c.id === id ? { ...c, arquivadoEm: agora, atualizadoEm: agora } : c));
      const tarefas = lerColecao("tarefas").map((t) => (t.colunaId === id ? { ...t, colunaId: null, atualizadoEm: agora } : t));
      gravar({ colecoes: { colunas, tarefas } });
    },

    async recuperar(id) {
      const atual = await base.obter(id);
      if (atual.arquivadoEm === null) return atual;
      validarNome(atual.nome, atual.projetoId, id);
      const agora = new Date().toISOString();
      const outraFinal = ativasDoProjeto(atual.projetoId).some((c) => c.final);
      const recuperada: Coluna = {
        ...atual,
        arquivadoEm: null,
        atualizadoEm: agora,
        ordem: proximaOrdem(atual.projetoId),
        final: atual.final && !outraFinal,
      };
      const colunas = lerColecao("colunas").map((c) => (c.id === id ? recuperada : c));
      // Volta as tarefas que perderam a coluna no arquivamento (mesmo instante), se ainda estiverem sem coluna.
      const tarefas = lerColecao("tarefas").map((t) =>
        t.projetoId === atual.projetoId && t.colunaId === null && t.tarefaPaiId === null && t.atualizadoEm === atual.arquivadoEm
          ? { ...t, colunaId: id, atualizadoEm: agora }
          : t,
      );
      gravar({ colecoes: { colunas, tarefas } });
      return recuperada;
    },
  };
}
