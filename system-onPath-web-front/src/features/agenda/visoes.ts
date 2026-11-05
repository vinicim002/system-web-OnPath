import type { ItemAgenda } from "@/dados/contratos";
import type { Tarefa } from "@/dados/tipos";
import { inicioDaSemana, somarDias } from "@/i18n/datas";

import { HORA_FIM, HORA_INICIO, PX_POR_HORA } from "./grade";

// ---------------------------------------------------------------------------
// Visões e filtro (specs/010-agenda-visoes/research.md, itens 1 e 2)
// ---------------------------------------------------------------------------

export const VISOES = ["semana", "board", "timeline", "lista", "tabela"] as const;
export type Visao = (typeof VISOES)[number];

export const TIPOS_FILTRO = ["compromisso", "tarefa", "rotina"] as const;
export type TipoFiltro = (typeof TIPOS_FILTRO)[number];
export const STATUS_FILTRO = ["planejado", "realizado", "perdido"] as const;
export type StatusFiltro = (typeof STATUS_FILTRO)[number];

export interface FiltroAgenda {
  tipos: TipoFiltro[];
  areas: string[];
  status: StatusFiltro[];
}

export const FILTRO_VAZIO: FiltroAgenda = { tipos: [], areas: [], status: [] };

export function lerVisao(parametros: URLSearchParams): Visao {
  const valor = parametros.get("visao");
  return (VISOES as readonly string[]).includes(valor ?? "") ? (valor as Visao) : "semana";
}

export function tipoDoItem(item: ItemAgenda): TipoFiltro {
  if (item.tipo === "compromisso") return "compromisso";
  return item.rotinaId ? "rotina" : "tarefa";
}

/** Filtro vazio em cada parte vale como "todos". O status só vale para blocos. */
export function filtrarItens(itens: ItemAgenda[], filtro: FiltroAgenda): ItemAgenda[] {
  return itens.filter(
    (item) =>
      (filtro.tipos.length === 0 || filtro.tipos.includes(tipoDoItem(item))) &&
      (filtro.areas.length === 0 || (item.areaId !== null && filtro.areas.includes(item.areaId))) &&
      (filtro.status.length === 0 || item.tipo === "compromisso" || filtro.status.includes(item.status as StatusFiltro)),
  );
}

export function filtroAtivo(filtro: FiltroAgenda): number {
  return filtro.tipos.length + filtro.areas.length + filtro.status.length;
}

function lista<T extends string>(parametros: URLSearchParams, chave: string, validos?: readonly T[]): T[] {
  const valores = (parametros.get(chave) ?? "").split(",").filter(Boolean) as T[];
  return validos ? valores.filter((v) => validos.includes(v)) : valores;
}

export function lerFiltro(parametros: URLSearchParams): FiltroAgenda {
  return {
    tipos: lista(parametros, "tipos", TIPOS_FILTRO),
    areas: lista(parametros, "areas"),
    status: lista(parametros, "status", STATUS_FILTRO),
  };
}

/** Devolve uma cópia dos parâmetros com o filtro; partes vazias somem do endereço. */
export function escreverFiltro(parametros: URLSearchParams, filtro: FiltroAgenda): URLSearchParams {
  const novos = new URLSearchParams(parametros);
  for (const chave of ["tipos", "areas", "status"] as const) {
    if (filtro[chave].length > 0) novos.set(chave, filtro[chave].join(","));
    else novos.delete(chave);
  }
  return novos;
}

// ---------------------------------------------------------------------------
// Tabela
// ---------------------------------------------------------------------------

export type ColunaTabela = "titulo" | "tipo" | "inicio" | "duracao" | "status";
export type Direcao = "asc" | "desc";

const ORDEM_TIPO: Record<TipoFiltro, number> = { compromisso: 0, tarefa: 1, rotina: 2 };
const duracaoMs = (item: ItemAgenda) => Date.parse(item.fim) - Date.parse(item.inicio);

export function ordenarItens(itens: ItemAgenda[], coluna: ColunaTabela, direcao: Direcao): ItemAgenda[] {
  const comparar = (a: ItemAgenda, b: ItemAgenda): number => {
    switch (coluna) {
      case "titulo":
        return a.titulo.localeCompare(b.titulo, "pt-BR");
      case "tipo":
        return ORDEM_TIPO[tipoDoItem(a)] - ORDEM_TIPO[tipoDoItem(b)];
      case "duracao":
        return duracaoMs(a) - duracaoMs(b);
      case "status":
        return (a.status ?? "").localeCompare(b.status ?? "");
      case "inicio":
        return a.inicio.localeCompare(b.inicio);
    }
  };
  const sinal = direcao === "asc" ? 1 : -1;
  return [...itens].sort((a, b) => sinal * comparar(a, b) || a.inicio.localeCompare(b.inicio));
}

// ---------------------------------------------------------------------------
// Painel de tarefas (research.md, item 3)
// ---------------------------------------------------------------------------

export type GrupoPrazo = "atrasadas" | "semana" | "mes" | "depois" | "semPrazo";
export const GRUPOS_PRAZO: GrupoPrazo[] = ["atrasadas", "semana", "mes", "depois", "semPrazo"];

const PESO_PRIORIDADE = { alta: 0, media: 1, baixa: 2 } as const;

/** Agrupa as tarefas pelo prazo: atrasadas, até domingo, até o fim do mês, depois e sem prazo. */
export function agruparPorPrazo<T extends Pick<Tarefa, "prazo" | "prioridade" | "titulo">>(
  tarefas: T[],
  hoje: string,
): Record<GrupoPrazo, T[]> {
  const domingo = somarDias(inicioDaSemana(hoje), 6);
  const mes = hoje.slice(0, 7);
  const grupos: Record<GrupoPrazo, T[]> = { atrasadas: [], semana: [], mes: [], depois: [], semPrazo: [] };
  for (const tarefa of tarefas) {
    const { prazo } = tarefa;
    if (prazo === null) grupos.semPrazo.push(tarefa);
    else if (prazo < hoje) grupos.atrasadas.push(tarefa);
    else if (prazo <= domingo) grupos.semana.push(tarefa);
    else if (prazo.slice(0, 7) === mes) grupos.mes.push(tarefa);
    else grupos.depois.push(tarefa);
  }
  const ordem = (a: T, b: T) =>
    (a.prazo ?? "").localeCompare(b.prazo ?? "") ||
    PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade] ||
    a.titulo.localeCompare(b.titulo, "pt-BR");
  for (const grupo of GRUPOS_PRAZO) grupos[grupo].sort(ordem);
  return grupos;
}

// ---------------------------------------------------------------------------
// Soltar uma tarefa na grade
// ---------------------------------------------------------------------------

const ULTIMO_MINUTO = HORA_FIM * 60 - 15;

const comoHora = (minutos: number) =>
  `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
const emMinutos = (hora: string) => {
  const [h, m] = hora.split(":").map(Number);
  return h! * 60 + m!;
};

/** Hora HH:mm do ponto solto na coluna, no quarto de hora em que ele caiu, dentro da grade. */
export function horaDoSoltar(deslocamentoY: number): string {
  const minutos = HORA_INICIO * 60 + Math.floor(((deslocamentoY / PX_POR_HORA) * 60) / 15) * 15;
  return comoHora(Math.min(Math.max(minutos, HORA_INICIO * 60), ULTIMO_MINUTO));
}

/** Início e fim do bloco da tarefa: o tempo estimado (ou 1 hora), sem passar de 23:45. */
export function intervaloDaTarefa(hora: string, estimadoMin: number | null): { inicio: string; fim: string } {
  const inicio = Math.min(emMinutos(hora), ULTIMO_MINUTO - 15);
  const fim = Math.min(inicio + (estimadoMin ?? 60), ULTIMO_MINUTO);
  return { inicio: comoHora(inicio), fim: comoHora(fim) };
}
