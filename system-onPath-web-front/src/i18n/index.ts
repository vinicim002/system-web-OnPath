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
