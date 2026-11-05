import { t } from "@/i18n";

/** Dias na ordem da semana brasileira (segunda primeiro); o número é o do JavaScript (0 = domingo). */
export const DIAS: { numero: number; chave: "dom" | "seg" | "ter" | "qua" | "qui" | "sex" | "sab" }[] = [
  { numero: 1, chave: "seg" },
  { numero: 2, chave: "ter" },
  { numero: 3, chave: "qua" },
  { numero: 4, chave: "qui" },
  { numero: 5, chave: "sex" },
  { numero: 6, chave: "sab" },
  { numero: 0, chave: "dom" },
];

export function nomeDoDia(numero: number): string {
  const dia = DIAS.find((d) => d.numero === numero)!;
  return t(`rotinas.diasCurtos.${dia.chave}`);
}

/** "Seg, Qua e Sex" a partir dos números dos dias. */
export function listaDeDias(numeros: number[]): string {
  const nomes = DIAS.filter((d) => numeros.includes(d.numero)).map((d) => nomeDoDia(d.numero));
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}`;
}
