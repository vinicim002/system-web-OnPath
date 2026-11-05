import { dataLocal, instanteLocal, somarDias } from "@/i18n/datas";
import { gerarId } from "@/plataforma/id";

import type { Intervalo, ItemAgenda, Ocupante, OpcoesConflito, ServicoAgenda } from "../contratos";
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
import { gravar, lerColecao } from "./armazenamento";
import { criarServicoColecao } from "./colecao";
import { lerPreferencias } from "./preferencias";

type Objeto = Record<string, unknown>;

/** Blocos que ocupam o horário: não arquivados, planejados ou realizados (research.md, item 2). */
export function blocoAtivo(bloco: BlocoTempo): boolean {
  return bloco.arquivadoEm === null && (bloco.status === "planejado" || bloco.status === "realizado");
}

function sobrepoe(a: { inicio: string; fim: string }, b: { inicio: string; fim: string }): boolean {
  return a.inicio < b.fim && b.inicio < a.fim;
}

const MINUTO = 60_000;
const PASSO_PROPOSTA = 30 * MINUTO;

/** Início e fim da janela do dia, em ISO (docs/plan.md, "Tempo livre"). */
function janelaDoDia(data: string): Intervalo {
  const { horaInicioDia, horaFimDia } = lerPreferencias();
  return { inicio: instanteLocal(data, horaInicioDia), fim: instanteLocal(data, horaFimDia) };
}

/** Soma dos minutos da união dos intervalos, cortados no limite dado. */
function minutosUnidos(intervalos: Intervalo[], limite: Intervalo): number {
  const cortados = intervalos
    .map((i) => ({ inicio: Math.max(Date.parse(i.inicio), Date.parse(limite.inicio)), fim: Math.min(Date.parse(i.fim), Date.parse(limite.fim)) }))
    .filter((i) => i.fim > i.inicio)
    .sort((a, b) => a.inicio - b.inicio);
  let total = 0;
  let atual: { inicio: number; fim: number } | null = null;
  for (const i of cortados) {
    if (atual && i.inicio <= atual.fim) {
      atual.fim = Math.max(atual.fim, i.fim);
    } else {
      if (atual) total += atual.fim - atual.inicio;
      atual = { ...i };
    }
  }
  if (atual) total += atual.fim - atual.inicio;
  return Math.round(total / MINUTO);
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

  /** Primeiro horário livre com a duração dada, de meia em meia hora, hoje ou amanhã (RN18). */
  function proximoLivre(agora: string, duracaoMs: number, ignorar: string): Intervalo | null {
    const hoje = dataLocal(agora);
    const desde = Math.ceil(Date.parse(agora) / PASSO_PROPOSTA) * PASSO_PROPOSTA;
    for (const data of [hoje, somarDias(hoje, 1)]) {
      const janela = janelaDoDia(data);
      let inicio = Math.max(Date.parse(janela.inicio), data === hoje ? desde : 0);
      const fimJanela = Date.parse(janela.fim);
      for (; inicio + duracaoMs <= fimJanela; inicio += PASSO_PROPOSTA) {
        const candidato = { inicio: new Date(inicio).toISOString(), fim: new Date(inicio + duracaoMs).toISOString() };
        if (ocupantes(candidato, ignorar).length === 0) return candidato;
      }
    }
    return null;
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

  const servico: ServicoAgenda = {
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

    async rotinasPerdidas(agora) {
      const hoje = dataLocal(agora);
      return lerColecao("blocosTempo")
        .filter((b) => b.arquivadoEm === null && b.rotinaId && b.status === "planejado" && b.fim <= agora && dataLocal(b.inicio) === hoje)
        .sort((a, b) => a.inicio.localeCompare(b.inicio))
        .map((bloco) => ({
          bloco,
          titulo: tituloDoBloco(bloco).titulo,
          proposta: proximoLivre(agora, Date.parse(bloco.fim) - Date.parse(bloco.inicio), bloco.id),
        }));
    },

    async aceitarProposta(id, proposta) {
      const atual = await blocos.obter(id);
      if (atual.status !== "planejado") throw criarErro("transicao_invalida", { de: atual.status, para: "remarcado" });
      validarIntervalo(proposta.inicio, proposta.fim);
      conferirConflito(proposta, {}, id);
      const { registros } = blocos.prepararVarios([{ id, campos: { status: "remarcado" } }]);
      const agora = new Date().toISOString();
      const novo = esquemas.blocosTempo.completo.parse({
        tarefaId: atual.tarefaId,
        rotinaId: atual.rotinaId,
        sessaoEstudoId: atual.sessaoEstudoId,
        inicio: proposta.inicio,
        fim: proposta.fim,
        status: "planejado",
        id: gerarId(),
        criadoEm: agora,
        atualizadoEm: agora,
        arquivadoEm: null,
      });
      gravar({ colecoes: { blocosTempo: [...registros, novo] } });
      return novo;
    },

    async recusarProposta(id) {
      const atual = await blocos.obter(id);
      if (atual.status !== "planejado") throw criarErro("transicao_invalida", { de: atual.status, para: "perdido" });
      return blocos.alterar(id, { status: "perdido" });
    },

    async tempoLivre(data) {
      const janela = janelaDoDia(data);
      const ocupados: Intervalo[] = [
        ...lerColecao("blocosTempo").filter((b) => b.rotinaId && blocoAtivo(b)),
        ...lerColecao("compromissos").filter((c) => c.arquivadoEm === null),
      ];
      const janelaMin = Math.round((Date.parse(janela.fim) - Date.parse(janela.inicio)) / MINUTO);
      const ocupadoMin = minutosUnidos(ocupados, janela);
      return { janelaMin, ocupadoMin, livreMin: Math.max(0, janelaMin - ocupadoMin) };
    },

    async lembretesDevidos(agora, antecedenciaMin) {
      const ate = new Date(Date.parse(agora) + antecedenciaMin * MINUTO).toISOString();
      // A busca vai um minuto além, porque o intervalo exclui o que começa exatamente no fim.
      const itens = await servico.listarNoIntervalo(agora, new Date(Date.parse(ate) + MINUTO).toISOString());
      return itens.filter(
        (item) => item.inicio > agora && item.inicio <= ate && (item.tipo === "compromisso" || item.status === "planejado"),
      );
    },
  };
  return servico;
}
