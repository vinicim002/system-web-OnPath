import { TONS_AREA } from "@/theme";

import type { ContagemArea, ServicoAreas } from "../contratos";
import { criarErro } from "../erros";
import { esquemas, type AlteracaoArea, type Area, type NovaArea } from "../tipos";
import { lerColecao } from "./armazenamento";
import { criarServicoColecao } from "./colecao";
import { chaveDeNome } from "./nomes";

function porOrdem(a: Area, b: Area): number {
  return a.ordem - b.ordem || a.criadoEm.localeCompare(b.criadoEm);
}

/** Itens ativos da área, para a confirmação de arquivar (data-model.md). */
function contar(areaId: string): ContagemArea {
  const ativo = <T extends { areaId: string; arquivadoEm: string | null }>(item: T) =>
    item.areaId === areaId && item.arquivadoEm === null;
  return {
    metasAtivas: lerColecao("metas").filter((m) => ativo(m) && m.status === "ativa").length,
    grupos: lerColecao("grupos").filter(ativo).length,
    projetos: lerColecao("projetos").filter(ativo).length,
    tarefasAbertas: lerColecao("tarefas").filter((t) => ativo(t) && t.status === "aberta").length,
    materias: lerColecao("materias").filter(ativo).length,
  };
}

function total(contagem: ContagemArea): number {
  return Object.values(contagem).reduce((soma, valor) => soma + valor, 0);
}

/** Serviço local de áreas (specs/005-areas-metas-grupos/contracts/servicos.md). */
export function criarServicoAreas(): ServicoAreas {
  const { gravarVarios, gravarCampos, prepararVarios: _p, ...base } = criarServicoColecao<
    "areas",
    NovaArea,
    AlteracaoArea
  >("areas", esquemas.areas.completo);

  function ativas(): Area[] {
    return lerColecao("areas")
      .filter((area) => area.arquivadoEm === null)
      .sort(porOrdem);
  }

  function proximaOrdem(): number {
    const ordens = ativas().map((area) => area.ordem);
    return ordens.length === 0 ? 0 : Math.max(...ordens) + 1;
  }

  /** Nome sem espaços, tom do tema e nome único entre as ativas (exceto a própria área). */
  function validar(dados: { nome?: unknown; cor?: unknown }, propriaId?: string) {
    const nome = typeof dados.nome === "string" ? dados.nome.trim() : "";
    const cor = typeof dados.cor === "string" ? dados.cor : "";
    const campos: string[] = [];
    if (nome === "") campos.push("nome");
    if (!TONS_AREA.includes(cor)) campos.push("cor");
    if (campos.length > 0) throw criarErro("dados_invalidos", { campos });
    const chave = chaveDeNome(nome);
    if (ativas().some((area) => area.id !== propriaId && chaveDeNome(area.nome) === chave)) {
      throw criarErro("nome_repetido", { campos: ["nome"] });
    }
    return { nome, cor };
  }

  return {
    ...base,

    async listarComResumo() {
      return ativas().map((area) => ({ ...area, contagem: contar(area.id) }));
    },

    async listarArquivadas() {
      return lerColecao("areas")
        .filter((area) => area.arquivadoEm !== null)
        .sort((a, b) => b.arquivadoEm!.localeCompare(a.arquivadoEm!));
    },

    async criar(dados) {
      return base.criar({ ...validar(dados), ordem: proximaOrdem() });
    },

    async alterar(id, dados) {
      const atual = await base.obter(id);
      const validos = validar({ nome: dados.nome ?? atual.nome, cor: dados.cor ?? atual.cor }, id);
      return base.alterar(id, validos);
    },

    async reordenar(ids) {
      const esperadas = new Set(ativas().map((area) => area.id));
      if (ids.length !== esperadas.size || ids.some((id) => !esperadas.has(id))) {
        throw criarErro("dados_invalidos", { campos: ["ids"] });
      }
      await gravarVarios(ids.map((id, ordem) => ({ id, campos: { ordem } })));
    },

    async excluir(id, opcoes = {}) {
      const atual = await base.obter(id);
      if (atual.arquivadoEm !== null) return;
      if (ativas().length <= 1) throw criarErro("ultima_area");
      const contagem = contar(id);
      if (total(contagem) > 0 && !opcoes.confirmado) throw criarErro("area_com_itens", { contagem });
      await base.excluir(id);
    },

    async recuperar(id) {
      const atual = await base.obter(id);
      if (atual.arquivadoEm === null) return atual;
      validar(atual, id);
      return gravarCampos(id, { arquivadoEm: null, ordem: proximaOrdem() });
    },
  };
}
