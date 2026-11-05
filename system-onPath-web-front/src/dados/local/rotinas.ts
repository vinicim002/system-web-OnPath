import { gerarId } from "@/plataforma/id";
import { dataLocal, diaDaSemana, hoje as hojeLocal, instanteLocal, somarDias } from "@/i18n/datas";

import type { ServicoRotinas } from "../contratos";
import { criarErro } from "../erros";
import { esquemas, type AlteracaoRotina, type BlocoTempo, type NovaRotina, type Rotina } from "../tipos";
import { gravar, lerColecao } from "./armazenamento";
import { blocoAtivo } from "./agenda";
import { criarServicoColecao } from "./colecao";

type Objeto = Record<string, unknown>;

const DIAS_DA_JANELA = 14;

/** Campos de cada tipo; os do outro tipo ficam vazios (data-model: rotinas). */
function normalizar(registro: Objeto): Objeto {
  const normalizado: Objeto = { ...registro };
  if (typeof normalizado.nome === "string") normalizado.nome = normalizado.nome.trim();
  if (Array.isArray(normalizado.diasSemana)) {
    normalizado.diasSemana = [...new Set(normalizado.diasSemana as number[])].sort((a, b) => a - b);
  }
  if (normalizado.tipo === "horario") normalizado.metaMin = null;
  if (normalizado.tipo === "meta_horas") {
    normalizado.horaInicio = null;
    normalizado.duracaoMin = null;
  }
  return normalizado;
}

function validar(registro: Objeto) {
  const campos: string[] = [];
  if (typeof registro.nome !== "string" || registro.nome === "") campos.push("nome");
  if (!lerColecao("areas").some((a) => a.id === registro.areaId && a.arquivadoEm === null)) campos.push("areaId");
  if (!Array.isArray(registro.diasSemana) || registro.diasSemana.length === 0) campos.push("diasSemana");
  if (registro.tipo === "horario" && !registro.horaInicio) campos.push("horaInicio");
  if (registro.tipo === "meta_horas" && !registro.metaMin) campos.push("metaMin");
  if (campos.length > 0) throw criarErro("dados_invalidos", { campos });
}

/** Blocos que a rotina deve ter na janela, a partir de `aPartirDe` (research.md, item 3). */
function blocosEsperados(rotina: Rotina, hoje: string, aPartirDe: string | null): { inicio: string; fim: string }[] {
  if (rotina.arquivadoEm !== null || rotina.tipo !== "horario" || !rotina.horaInicio || !rotina.duracaoMin) return [];
  const resultado: { inicio: string; fim: string }[] = [];
  for (let dia = 0; dia < DIAS_DA_JANELA; dia++) {
    const data = somarDias(hoje, dia);
    if (!rotina.diasSemana.includes(diaDaSemana(data))) continue;
    const inicio = instanteLocal(data, rotina.horaInicio);
    if (aPartirDe && inicio < aPartirDe) continue;
    const fim = new Date(Date.parse(inicio) + rotina.duracaoMin * 60_000).toISOString();
    resultado.push({ inicio, fim });
  }
  return resultado;
}

function novoBloco(rotinaId: string, intervalo: { inicio: string; fim: string }, agora: string): BlocoTempo {
  return esquemas.blocosTempo.completo.parse({
    id: gerarId(),
    criadoEm: agora,
    atualizadoEm: agora,
    arquivadoEm: null,
    tarefaId: null,
    rotinaId,
    sessaoEstudoId: null,
    status: "planejado",
    ...intervalo,
  }) as BlocoTempo;
}

/** Acrescenta à lista os blocos que faltam (mesma rotina e mesmo início não se repetem). */
function completar(blocos: BlocoTempo[], rotina: Rotina, hoje: string, aPartirDe: string | null, agora: string): number {
  const existentes = new Set(blocos.filter((b) => b.rotinaId === rotina.id).map((b) => b.inicio));
  let criados = 0;
  for (const intervalo of blocosEsperados(rotina, hoje, aPartirDe)) {
    if (existentes.has(intervalo.inicio)) continue;
    blocos.push(novoBloco(rotina.id, intervalo, agora));
    criados++;
  }
  return criados;
}

/** Tira os blocos futuros ainda planejados da rotina (os passados e realizados ficam). */
function semFuturosPlanejados(blocos: BlocoTempo[], rotinaId: string, agora: string): BlocoTempo[] {
  return blocos.filter((b) => !(b.rotinaId === rotinaId && b.status === "planejado" && b.inicio >= agora));
}

/** Serviço local de rotinas (specs/008-agenda/contracts/servicos.md). */
export function criarServicoRotinas(): ServicoRotinas {
  const { gravarVarios: _v, gravarCampos: _g, prepararVarios: _p, ...base } = criarServicoColecao<
    "rotinas",
    NovaRotina,
    AlteracaoRotina
  >("rotinas", esquemas.rotinas.completo, { completar: normalizar });

  /** Grava a rotina e refaz os blocos futuros dela, numa escrita. */
  function gravarComBlocos(rotina: Rotina) {
    const agora = new Date().toISOString();
    const rotinas = lerColecao("rotinas");
    const indice = rotinas.findIndex((r) => r.id === rotina.id);
    const listaRotinas = indice === -1 ? [...rotinas, rotina] : rotinas.map((r) => (r.id === rotina.id ? rotina : r));
    const blocos = semFuturosPlanejados(lerColecao("blocosTempo"), rotina.id, agora);
    completar(blocos, rotina, hojeLocal(), agora, agora);
    gravar({ colecoes: { rotinas: listaRotinas, blocosTempo: blocos } });
    return rotina;
  }

  function montar(registro: Objeto): Rotina {
    const normalizado = normalizar(registro);
    validar(normalizado);
    const resultado = esquemas.rotinas.completo.safeParse(normalizado);
    if (!resultado.success) {
      throw criarErro("dados_invalidos", { campos: [...new Set(resultado.error.issues.map((i) => String(i.path[0])))] });
    }
    return resultado.data as Rotina;
  }

  return {
    ...base,

    async listarOrdenadas() {
      return (await base.listar()).sort((a, b) => {
        if (a.tipo !== b.tipo) return a.tipo === "horario" ? -1 : 1;
        return (a.horaInicio ?? "").localeCompare(b.horaInicio ?? "") || a.nome.localeCompare(b.nome, "pt-BR");
      });
    },

    async criar(dados) {
      const agora = new Date().toISOString();
      const rotina = montar({
        horaInicio: null,
        duracaoMin: null,
        metaMin: null,
        ...dados,
        id: gerarId(),
        criadoEm: agora,
        atualizadoEm: agora,
        arquivadoEm: null,
      });
      return gravarComBlocos(rotina);
    },

    async alterar(id, dados) {
      const atual = await base.obter(id);
      const rotina = montar({ ...atual, ...dados, id: atual.id, criadoEm: atual.criadoEm, atualizadoEm: new Date().toISOString() });
      return gravarComBlocos(rotina);
    },

    async excluir(id) {
      const atual = await base.obter(id);
      if (atual.arquivadoEm !== null) return;
      gravarComBlocos({ ...atual, arquivadoEm: new Date().toISOString() });
    },

    async recuperar(id) {
      const atual = await base.obter(id);
      if (atual.arquivadoEm === null) return atual;
      return gravarComBlocos({ ...atual, arquivadoEm: null, atualizadoEm: new Date().toISOString() });
    },

    async renovarBlocos(hoje) {
      const agora = new Date().toISOString();
      const blocos = lerColecao("blocosTempo");
      let criados = 0;
      for (const rotina of lerColecao("rotinas")) criados += completar(blocos, rotina, hoje, null, agora);
      if (criados > 0) gravar({ colecoes: { blocosTempo: blocos } });
      return { criados };
    },

    async totalDoDia(rotinaId, data) {
      return lerColecao("blocosTempo")
        .filter((b) => b.rotinaId === rotinaId && blocoAtivo(b) && dataLocal(b.inicio) === data)
        .reduce((total, b) => total + (Date.parse(b.fim) - Date.parse(b.inicio)) / 60_000, 0);
    },
  };
}
