/** Formatação de datas em português, no fuso do usuário (seção 7 de docs/spec.md). */

import { t } from "./index";

const FUSO = "America/Sao_Paulo";

const relativo = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

const curta = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "agora", "há 5 minutos", "há 2 horas", "ontem", "há 3 dias"… */
export function tempoRelativo(dataIso: string, agora: Date = new Date()): string {
  const segundos = Math.round((Date.parse(dataIso) - agora.getTime()) / 1000);
  for (const [unidade, tamanho] of UNIDADES) {
    if (Math.abs(segundos) >= tamanho) {
      return relativo.format(Math.round(segundos / tamanho), unidade);
    }
  }
  return relativo.format(0, "second");
}

const diaLocal = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const prazo = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "numeric", month: "short" });

const extenso = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "quinta-feira, 5 de novembro" para uma data AAAA-MM-DD. */
export function dataPorExtenso(data: string): string {
  return extenso.format(new Date(`${data}T00:00:00Z`));
}

/** Soma dias a uma data AAAA-MM-DD. */
export function somarDias(data: string, dias: number): string {
  const base = new Date(`${data}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

/** Quanto falta para a próxima meia-noite no fuso do usuário. */
export function milissegundosAteAmanha(agora: Date = new Date()): number {
  // Procura, minuto a minuto a partir de agora, o primeiro instante em que a data local muda.
  const hojeLocal = hoje(agora);
  let passo = 60 * 60 * 1000;
  let tempo = agora.getTime();
  while (passo >= 1000) {
    while (hoje(new Date(tempo + passo)) === hojeLocal) tempo += passo;
    passo = Math.floor(passo / 60);
  }
  return Math.max(1000, tempo + 1000 - agora.getTime());
}

/** Data de hoje no fuso do usuário, no formato AAAA-MM-DD. */
export function hoje(agora: Date = new Date()): string {
  return diaLocal.format(agora);
}

/** "10 de nov." para uma data AAAA-MM-DD. */
export function dataPrazo(data: string): string {
  return prazo.format(new Date(`${data}T00:00:00Z`));
}

/** "5 de nov., 14:30" */
export function dataCurta(dataIso: string): string {
  return curta.format(new Date(dataIso));
}

/** "45 min", "2 h" ou "1 h 30 min". */
export function duracao(totalMin: number): string {
  const horas = Math.floor(totalMin / 60);
  const minutos = totalMin % 60;
  if (horas === 0) return t("tarefas.minutos", { minutos });
  if (minutos === 0) return t("tarefas.horas", { horas });
  return t("tarefas.horasMinutos", { horas, minutos });
}

// ---------------------------------------------------------------------------
// Horário local ↔ UTC (specs/008-agenda/research.md, item 1)
// ---------------------------------------------------------------------------

const deslocamentoFmt = new Intl.DateTimeFormat("en-US", { timeZone: FUSO, timeZoneName: "longOffset" });
const horaFmt = new Intl.DateTimeFormat("en-GB", { timeZone: FUSO, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** Deslocamento do fuso do usuário naquele instante, como "-03:00". */
function deslocamento(instante: Date): string {
  const nome = deslocamentoFmt.formatToParts(instante).find((parte) => parte.type === "timeZoneName")?.value ?? "GMT";
  const partes = /GMT([+-]\d{2}):?(\d{2})?/.exec(nome);
  return partes ? `${partes[1]}:${partes[2] ?? "00"}` : "+00:00";
}

/** Instante em UTC (ISO) de uma data AAAA-MM-DD e hora HH:mm no fuso do usuário. */
export function instanteLocal(data: string, hora: string): string {
  const aproximado = new Date(`${data}T${hora}:00Z`);
  return new Date(`${data}T${hora}:00${deslocamento(aproximado)}`).toISOString();
}

/** Data AAAA-MM-DD de um instante, no fuso do usuário. */
export function dataLocal(iso: string): string {
  return hoje(new Date(iso));
}

/** Hora HH:mm de um instante, no fuso do usuário. */
export function horaLocal(iso: string): string {
  return horaFmt.format(new Date(iso));
}

/** Minutos desde a meia-noite local. */
export function minutosNoDia(iso: string): number {
  const [h, m] = horaLocal(iso).split(":").map(Number);
  return h! * 60 + m!;
}

/** Dia da semana de uma data AAAA-MM-DD (0 = domingo). */
export function diaDaSemana(data: string): number {
  return new Date(`${data}T00:00:00Z`).getUTCDay();
}

/** Segunda-feira da semana de uma data AAAA-MM-DD. */
export function inicioDaSemana(data: string): string {
  const dia = diaDaSemana(data);
  return somarDias(data, dia === 0 ? -6 : 1 - dia);
}
