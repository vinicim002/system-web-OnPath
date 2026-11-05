import { gerarId } from "@/plataforma/id";

import type { ServicoTarefas } from "../contratos";
import { criarErro } from "../erros";
import { filtrarTarefas, idsDaArvore, ordenarTarefas, tarefaDoTopo } from "../regrasTarefas";
import {
  esquemas,
  type AlteracaoTarefa,
  type ItemCaixa,
  type NovaTarefa,
  type Tarefa,
} from "../tipos";
import { gravar, lerColecao } from "./armazenamento";
import { criarServicoColecao } from "./colecao";

type Objeto = Record<string, unknown>;

/** Campos que a subtarefa recebe da tarefa do topo (RN33 e research.md, item 4). */
const HERDADOS = ["areaId", "prioridade", "projetoId", "materiaId"] as const;

/** Campos que mudam só pelos métodos próprios (concluir, mover, excluir…). */
const CONTROLADOS = ["tarefaPaiId", "status", "concluidaEm", "colunaId"] as const;

function sem<T extends Objeto>(dados: T, chaves: readonly string[]): Objeto {
  const copia: Objeto = { ...dados };
  for (const chave of chaves) delete copia[chave];
  return copia;
}

/** Título sem espaços nas pontas e anotações vazias como `null`. */
function normalizar(registro: Objeto): Objeto {
  const normalizado = { ...registro };
  if (typeof normalizado.titulo === "string") normalizado.titulo = normalizado.titulo.trim();
  if (typeof normalizado.anotacoes === "string" && normalizado.anotacoes.trim() === "") {
    normalizado.anotacoes = null;
  }
  return normalizado;
}

function ativo<T extends { id: string; arquivadoEm: string | null }>(lista: T[], id: unknown) {
  return lista.find((item) => item.id === id && item.arquivadoEm === null);
}

/**
 * Regras da tarefa principal e do vínculo (specs/003-tarefas/data-model.md, regras 1 a 3).
 * Junta os problemas das regras e do esquema, para o erro listar todos os campos de uma vez.
 */
function validarTarefa(candidato: Objeto): Tarefa {
  const registro = normalizar(candidato);
  const campos = new Set<string>();

  if (registro.projetoId && registro.materiaId) {
    campos.add("projetoId");
    campos.add("materiaId");
  } else if (registro.projetoId) {
    const projeto = ativo(lerColecao("projetos"), registro.projetoId);
    if (projeto) registro.areaId = projeto.areaId;
    else campos.add("projetoId");
  } else if (registro.materiaId) {
    const materia = ativo(lerColecao("materias"), registro.materiaId);
    if (materia) registro.areaId = materia.areaId;
    else campos.add("materiaId");
  }

  if (typeof registro.areaId === "string" && !ativo(lerColecao("areas"), registro.areaId)) {
    campos.add("areaId");
  }

  if (registro.tarefaPaiId == null) {
    if (registro.tempoEstimadoMin == null) campos.add("tempoEstimadoMin");
  } else if (!ativo(lerColecao("tarefas"), registro.tarefaPaiId)) {
    campos.add("tarefaPaiId");
  }

  const resultado = esquemas.tarefas.completo.safeParse(registro);
  if (!resultado.success) {
    for (const problema of resultado.error.issues) campos.add(String(problema.path[0] ?? "(registro)"));
  }
  if (campos.size > 0) throw criarErro("dados_invalidos", { campos: [...campos] });
  return resultado.data as Tarefa;
}

/** Registro completo de uma tarefa nova, já validado. */
function prepararNova(dados: Objeto): Tarefa {
  const agora = new Date().toISOString();
  return validarTarefa({
    projetoId: null,
    materiaId: null,
    colunaId: null,
    prazo: null,
    anotacoes: null,
    ...sem(dados, ["id", "criadoEm", "atualizadoEm", "arquivadoEm", ...CONTROLADOS]),
    tarefaPaiId: null,
    status: "aberta",
    concluidaEm: null,
    id: gerarId(),
    criadoEm: agora,
    atualizadoEm: agora,
    arquivadoEm: null,
  });
}

/** Colunas ativas do projeto, na ordem (specs/007-kanban). */
function colunasDoProjeto(projetoId: string | null) {
  if (!projetoId) return [];
  return lerColecao("colunas")
    .filter((coluna) => coluna.projetoId === projetoId && coluna.arquivadoEm === null)
    .sort((a, b) => a.ordem - b.ordem || a.criadoEm.localeCompare(b.criadoEm));
}

/** Coluna final do projeto, para onde vai a tarefa principal concluída (RN32). */
function colunaFinal(tarefa: Tarefa): string | null {
  if (tarefa.tarefaPaiId !== null) return null;
  return colunasDoProjeto(tarefa.projetoId).find((coluna) => coluna.final)?.id ?? null;
}

/** Para onde vai a tarefa reaberta que estava na coluna final: a primeira não final. */
function colunaAoReabrir(tarefa: Tarefa): string | null {
  const colunas = colunasDoProjeto(tarefa.projetoId);
  const naFinal = colunas.some((coluna) => coluna.id === tarefa.colunaId && coluna.final);
  if (!naFinal) return tarefa.colunaId;
  return colunas.find((coluna) => !coluna.final)?.id ?? null;
}

function heranca(topo: Tarefa): Objeto {
  return Object.fromEntries(HERDADOS.map((campo) => [campo, topo[campo]]));
}

/** Serviço local de tarefas (specs/003-tarefas/contracts/servico-tarefas.md). */
export function criarServicoTarefas(): ServicoTarefas {
  const { gravarVarios, prepararVarios: _p, gravarCampos: _g, ...base } = criarServicoColecao<
    "tarefas",
    NovaTarefa,
    AlteracaoTarefa
  >("tarefas", esquemas.tarefas.completo, { completar: normalizar });

  async function obterAtiva(id: string, campo = "tarefaPaiId"): Promise<Tarefa> {
    const tarefa = ativo(lerColecao("tarefas"), id);
    if (!tarefa) throw criarErro("dados_invalidos", { campos: [campo] });
    return tarefa;
  }

  /** Descendentes (sem a própria tarefa), entre as tarefas informadas. */
  function descendentes(id: string, tarefas: Tarefa[]): Tarefa[] {
    const ids = idsDaArvore(id, tarefas);
    return tarefas.filter((tarefa) => tarefa.id !== id && ids.has(tarefa.id));
  }

  return {
    ...base,

    async listarFiltradas(filtros = {}) {
      return ordenarTarefas(filtrarTarefas(await base.listar(), filtros));
    },

    async criar(dados) {
      const registro = prepararNova(dados as Objeto);
      gravar({ colecoes: { tarefas: [...lerColecao("tarefas"), registro] } });
      return registro;
    },

    async criarSubtarefa(tarefaPaiId, titulo) {
      const pai = await obterAtiva(tarefaPaiId);
      const topo = tarefaDoTopo(pai, new Map(lerColecao("tarefas").map((t) => [t.id, t])));
      const agora = new Date().toISOString();
      const registro = validarTarefa({
        ...heranca(topo),
        titulo,
        tarefaPaiId: pai.id,
        colunaId: null,
        tempoEstimadoMin: null,
        prazo: null,
        anotacoes: null,
        status: "aberta",
        concluidaEm: null,
        id: gerarId(),
        criadoEm: agora,
        atualizadoEm: agora,
        arquivadoEm: null,
      });
      gravar({ colecoes: { tarefas: [...lerColecao("tarefas"), registro] } });
      return registro;
    },

    async alterar(id, dados) {
      const atual = await base.obter(id);
      const tarefas = lerColecao("tarefas");
      const ehSubtarefa = atual.tarefaPaiId !== null;
      const permitidos = sem(dados as Objeto, [
        "id",
        "criadoEm",
        "atualizadoEm",
        "arquivadoEm",
        ...CONTROLADOS,
        ...(ehSubtarefa ? HERDADOS : []),
      ]);
      const novo = validarTarefa({ ...atual, ...permitidos });
      if (novo.projetoId !== atual.projetoId) novo.colunaId = null;
      if (ehSubtarefa) {
        const [alterada] = await gravarVarios([{ id, campos: novo }]);
        return alterada!;
      }
      const mudancas = [
        { id, campos: novo as Objeto },
        ...descendentes(id, tarefas).map((filha) => ({ id: filha.id, campos: heranca(novo) })),
      ];
      const [alterada] = await gravarVarios(mudancas);
      return alterada!;
    },

    async mover(id, tarefaPaiId, dadosTopo = {}) {
      const atual = await base.obter(id);
      const tarefas = lerColecao("tarefas");

      if (tarefaPaiId === null) {
        const tempoEstimadoMin = dadosTopo.tempoEstimadoMin ?? atual.tempoEstimadoMin;
        const novo = validarTarefa({ ...atual, tarefaPaiId: null, tempoEstimadoMin });
        const [movida] = await gravarVarios([{ id, campos: novo }]);
        return movida!;
      }

      if (idsDaArvore(id, tarefas).has(tarefaPaiId)) throw criarErro("ciclo_subtarefa");
      const pai = await obterAtiva(tarefaPaiId);
      const topo = tarefaDoTopo(pai, new Map(tarefas.map((t) => [t.id, t])));
      const herdados = heranca(topo);
      const [movida] = await gravarVarios([
        { id, campos: { ...herdados, tarefaPaiId, colunaId: null } },
        ...descendentes(id, tarefas).map((filha) => ({ id: filha.id, campos: herdados })),
      ]);
      return movida!;
    },

    async concluir(id, opcoes = {}) {
      const atual = await base.obter(id);
      const abertas = descendentes(id, await base.listar()).filter((t) => t.status === "aberta");
      if (abertas.length > 0 && !opcoes.incluirSubtarefas) {
        throw criarErro("subtarefas_abertas", { quantidade: abertas.length });
      }
      const concluidaEm = new Date().toISOString();
      const alvos = [...(atual.status === "concluida" ? [] : [atual]), ...abertas];
      if (alvos.length === 0) return atual;
      const final = colunaFinal(atual);
      await gravarVarios(
        alvos.map((t) => ({
          id: t.id,
          campos: { status: "concluida", concluidaEm, ...(t.id === id && final ? { colunaId: final } : {}) },
        })),
      );
      return base.obter(id);
    },

    async reabrir(id) {
      const atual = await base.obter(id);
      if (atual.status === "aberta") return atual;
      const [reaberta] = await gravarVarios([
        { id, campos: { status: "aberta", concluidaEm: null, colunaId: colunaAoReabrir(atual) } },
      ]);
      return reaberta!;
    },

    async cancelar(id) {
      const atual = await base.obter(id);
      if (atual.status === "cancelada") return atual;
      const [cancelada] = await gravarVarios([{ id, campos: { status: "cancelada", concluidaEm: null } }]);
      return cancelada!;
    },

    async excluir(id) {
      await base.obter(id);
      const tarefas = lerColecao("tarefas");
      const ids = idsDaArvore(id, tarefas);
      const arquivadoEm = new Date().toISOString();
      await gravarVarios(
        tarefas
          .filter((t) => ids.has(t.id) && t.arquivadoEm === null)
          .map((t) => ({ id: t.id, campos: { arquivadoEm } })),
      );
    },

    async recuperar(id) {
      await base.obter(id);
      const tarefas = lerColecao("tarefas");
      const ids = idsDaArvore(id, tarefas);
      await gravarVarios(
        tarefas
          .filter((t) => ids.has(t.id) && t.arquivadoEm !== null)
          .map((t) => ({ id: t.id, campos: { arquivadoEm: null } })),
      );
      return base.obter(id);
    },

    async moverParaColuna(id, colunaId, opcoes = {}) {
      const atual = await base.obter(id);
      const coluna = colunaId === null ? null : colunasDoProjeto(atual.projetoId).find((c) => c.id === colunaId);
      if (colunaId !== null && (!coluna || atual.tarefaPaiId !== null || atual.projetoId === null)) {
        throw criarErro("dados_invalidos", { campos: ["colunaId"] });
      }
      const agora = new Date().toISOString();

      // Soltar na coluna final conclui (RN32), com as mesmas regras de subtarefas de `concluir`.
      if (coluna?.final && atual.status === "aberta") {
        const abertas = descendentes(id, await base.listar()).filter((t) => t.status === "aberta");
        if (abertas.length > 0 && !opcoes.incluirSubtarefas) {
          throw criarErro("subtarefas_abertas", { quantidade: abertas.length });
        }
        const [movida] = await gravarVarios([
          { id, campos: { colunaId, status: "concluida", concluidaEm: agora } },
          ...abertas.map((t) => ({ id: t.id, campos: { status: "concluida", concluidaEm: agora } })),
        ]);
        return movida!;
      }

      // Tirar uma tarefa concluída da coluna final a reabre.
      if (atual.status === "concluida" && !coluna?.final) {
        const [movida] = await gravarVarios([{ id, campos: { colunaId, status: "aberta", concluidaEm: null } }]);
        return movida!;
      }

      const [movida] = await gravarVarios([{ id, campos: { colunaId } }]);
      return movida!;
    },

    async criarDeItemCaixa(itemId, dados) {
      const itens = lerColecao("itensCaixa");
      const indice = itens.findIndex((item) => item.id === itemId);
      const item = itens[indice];
      if (!item || item.status !== "novo" || item.arquivadoEm !== null) {
        throw criarErro("item_indisponivel");
      }
      const tarefa = prepararNova(dados as Objeto);
      const processado: ItemCaixa = {
        ...item,
        status: "processado",
        atualizadoEm: tarefa.criadoEm,
      };
      const atualizados = [...itens];
      atualizados[indice] = esquemas.itensCaixa.completo.parse(processado);
      // A tarefa e o item são gravados juntos: ou os dois mudam, ou nenhum (FR-024).
      gravar({ colecoes: { tarefas: [...lerColecao("tarefas"), tarefa], itensCaixa: atualizados } });
      return tarefa;
    },
  };
}
