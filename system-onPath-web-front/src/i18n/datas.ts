/** Formatação de datas em português, no fuso do usuário (seção 7 de docs/spec.md). */

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

/** "5 de nov., 14:30" */
export function dataCurta(dataIso: string): string {
  return curta.format(new Date(dataIso));
}
