import { ptBR, type Textos } from "./pt-BR";

/** Todas as chaves de texto, separadas por pontos (ex.: "menu.hoje"). */
type Chaves<T, Prefixo extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefixo}${K}`
    : Chaves<T[K], `${Prefixo}${K}.`>;
}[keyof T & string];

export type ChaveTexto = Chaves<Textos>;

export function t(chave: ChaveTexto, valores?: Record<string, string | number>): string {
  let atual: unknown = ptBR;
  for (const parte of chave.split(".")) {
    atual = (atual as Record<string, unknown>)[parte];
  }
  const texto = typeof atual === "string" ? atual : chave;
  if (!valores) return texto;
  return texto.replace(/\{(\w+)\}/g, (trecho, nome: string) =>
    nome in valores ? String(valores[nome]) : trecho,
  );
}

/** Chaves com forma no singular e no plural: `{ um, outros }`. */
type ChavesPlural<T, Prefixo extends string = ""> = {
  [K in keyof T & string]: T[K] extends { um: string; outros: string }
    ? `${Prefixo}${K}`
    : T[K] extends string
      ? never
      : ChavesPlural<T[K], `${Prefixo}${K}.`>;
}[keyof T & string];

export type ChavePlural = ChavesPlural<Textos>;

/** Texto no singular quando `quantidade` é 1, e no plural nos demais casos. */
export function tPlural(chave: ChavePlural, quantidade: number, valores: Record<string, string | number> = {}): string {
  const forma = quantidade === 1 ? "um" : "outros";
  return t(`${chave}.${forma}` as ChaveTexto, { quantidade, ...valores });
}
