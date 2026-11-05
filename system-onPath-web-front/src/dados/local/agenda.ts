import { dataLocal } from "@/i18n/datas";

import type { ItemAgenda, Ocupante, OpcoesConflito, ServicoAgenda } from "../contratos";
import { criarErro } from "../erros";
import {
  esquemas,
  type AlteracaoBlocoTempo,
  type AlteracaoCompromisso,
  type BlocoTempo,
  type Compromisso,
  type NovoBlocoTempo,
  type NovoCompromisso,
} from "../tipos";
import { lerColecao } from "./armazenamento";
import { criarServicoColecao } from "./colecao";

type Objeto = Record<string, unknown>;

/** Blocos que ocupam o horário: não arquivados, planejados ou realizados (research.md, item 2). */
export function blocoAtivo(bloco: BlocoTempo): boolean {
  return bloco.arquivadoEm === null && (bloco.status === "planejado" || bloco.status === "realizado");
}

function sobrepoe(a: { inicio: string; fim: string }, b: { inicio: string; fim: string }): boolean {
  return a.inicio < b.fim && b.inicio < a.fim;
}

/** Fim depois do início, no mesmo dia local. */
function validarIntervalo(inicio: unknown, fim: unknown) {
  if (typeof inicio !== "string" || typeof fim !== "string") throw criarErro("dados_invalidos", { campos: ["inicio"] });
  if (fim <= inicio || dataLocal(inicio) !== dataLocal(fim)) throw criarErro("dados_invalidos", { campos: ["fim"] });
}

/** Título do bloco: a tarefa, a rotina ou a sessão que ele reserva. */
function tituloDoBloco(bloco: BlocoTempo): { titulo: string; areaId: string | null } {
  if (bloco.tarefaId) {
    const tarefa = lerColecao("tarefas").find((t) => t.id === bloco.tarefaId);
    return { titulo: tarefa?.titulo ?? "", areaId: tarefa?.areaId ?? null };
  }
  if (bloco.rotinaId) {
    const rotina = lerColecao("rotinas").find((r) => r.id === bloco.rotinaId);
    return { titulo: rotina?.nome ?? "", areaId: rotina?.areaId ?? null };
  }
  return { titulo: "", areaId: null };
}

/** Serviço local da agenda: blocos e compromissos com a regra de conflito (RN09). */
export function criarServicoAgenda(): ServicoAgenda {
  const blocos = criarServicoColecao<"blocosTempo", NovoBlocoTempo, AlteracaoBlocoTempo>(
    "blocosTempo",
    esquemas.blocosTempo.completo,
  );
  const compromissos = criarServicoColecao<"compromissos", NovoCompromisso, AlteracaoCompromisso>(
    "compromissos",
    esquemas.compromissos.completo,
    {
      completar: (registro) =>
        typeof registro.titulo === "string" ? { ...registro, titulo: registro.titulo.trim() } : registro,
    },
  );

  function ocupantes(intervalo: { inicio: string; fim: string }, ignorar?: string): Ocupante[] {
    const deBlocos: Ocupante[] = lerColecao("blocosTempo")
      .filter((b) => b.id !== ignorar && blocoAtivo(b) && sobrepoe(b, intervalo))
      .map((b) => ({ tipo: "bloco", id: b.id, titulo: tituloDoBloco(b).titulo, inicio: b.inicio, fim: b.fim }));
    const deCompromissos: Ocupante[] = lerColecao("compromissos")
      .filter((c) => c.id !== ignorar && c.arquivadoEm === null && sobrepoe(c, intervalo))
      .map((c) => ({ tipo: "compromisso", id: c.id, titulo: c.titulo, inicio: c.inicio, fim: c.fim }));
    return [...deBlocos, ...deCompromissos].sort((a, b) => a.inicio.localeCompare(b.inicio));
  }

  function conferirConflito(intervalo: { inicio: string; fim: string }, opcoes: OpcoesConflito, ignorar?: string) {
    if (opcoes.confirmarConflito) return;
    const encontrados = ocupantes(intervalo, ignorar);
    if (encontrados.length > 0) throw criarErro("horario_ocupado", { ocupantes: encontrados });
  }

  /** Exatamente um alvo; a tarefa precisa estar aberta e a rotina, ativa. */
  function conferirAlvo(dados: Objeto) {
    const alvos = ["tarefaId", "rotinaId", "sessaoEstudoId"].filter((campo) => dados[campo]);
    if (alvos.length !== 1) throw criarErro("dados_invalidos", { campos: ["alvo"] });
    if (dados.tarefaId) {
      const tarefa = lerColecao("tarefas").find((t) => t.id === dados.tarefaId && t.arquivadoEm === null);
      if (!tarefa || tarefa.status !== "aberta") throw criarErro("dados_invalidos", { campos: ["tarefaId"] });
    }
    if (dados.rotinaId && !lerColecao("rotinas").some((r) => r.id === dados.rotinaId && r.arquivadoEm === null)) {
      throw criarErro("dados_invalidos", { campos: ["rotinaId"] });
    }
  }

  function conferirCompromisso(dados: Objeto) {
    const campos: string[] = [];
    if (typeof dados.titulo !== "string" || dados.titulo.trim() === "") campos.push("titulo");
    if (!lerColecao("areas").some((a) => a.id === dados.areaId && a.arquivadoEm === null)) campos.push("areaId");
    if (campos.length > 0) throw criarErro("dados_invalidos", { campos });
    validarIntervalo(dados.inicio, dados.fim);
  }

  return {
    async listarNoIntervalo(inicio, fim) {
      const intervalo = { inicio, fim };
      const deBlocos: ItemAgenda[] = lerColecao("blocosTempo")
        .filter((b) => b.arquivadoEm === null && b.status !== "remarcado" && sobrepoe(b, intervalo))
        .map((b) => ({
          tipo: "bloco",
          id: b.id,
          ...tituloDoBloco(b),
          inicio: b.inicio,
          fim: b.fim,
          status: b.status,
          rotinaId: b.rotinaId,
          tarefaId: b.tarefaId,
        }));
      const deCompromissos: ItemAgenda[] = lerColecao("compromissos")
        .filter((c) => c.arquivadoEm === null && sobrepoe(c, intervalo))
        .map((c) => ({ tipo: "compromisso", id: c.id, titulo: c.titulo, areaId: c.areaId, inicio: c.inicio, fim: c.fim, local: c.local }));
      return [...deBlocos, ...deCompromissos].sort((a, b) => a.inicio.localeCompare(b.inicio));
    },

    async criarBloco(dados, opcoes = {}) {
      conferirAlvo(dados as Objeto);
      validarIntervalo(dados.inicio, dados.fim);
      conferirConflito(dados, opcoes);
      return blocos.criar({ ...dados, status: dados.status ?? "planejado" });
    },

    async alterarBloco(id, dados, opcoes = {}) {
      const atual = await blocos.obter(id);
      const novo = { ...atual, ...dados };
      if ("tarefaId" in dados || "rotinaId" in dados || "sessaoEstudoId" in dados) conferirAlvo(novo as Objeto);
      validarIntervalo(novo.inicio, novo.fim);
      if (dados.inicio !== undefined || dados.fim !== undefined) conferirConflito(novo, opcoes, id);
      return blocos.alterar(id, dados);
    },

    async marcarRealizado(id) {
      return blocos.alterar(id, { status: "realizado" });
    },

    async excluirBloco(id) {
      await blocos.excluir(id);
    },

    async criarCompromisso(dados, opcoes = {}) {
      conferirCompromisso(dados as Objeto);
      conferirConflito(dados, opcoes);
      return compromissos.criar(dados);
    },

    async alterarCompromisso(id, dados, opcoes = {}) {
      const atual: Compromisso = await compromissos.obter(id);
      const novo = { ...atual, ...dados };
      conferirCompromisso(novo as Objeto);
      if (dados.inicio !== undefined || dados.fim !== undefined) conferirConflito(novo, opcoes, id);
      return compromissos.alterar(id, dados);
    },

    async arquivarCompromisso(id) {
      await compromissos.excluir(id);
    },

    async recuperarCompromisso(id) {
      return compromissos.recuperar(id);
    },
  };
}
