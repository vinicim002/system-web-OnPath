export const cores = {
  preto: "#0A0A0A",
  branco: "#FFFFFF",
  cinza: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },
  /** Reservado ao logo e a pequenos detalhes. */
  roxo: "#7357F0",
} as const;

export const fontes = {
  familia: "'Inter', system-ui, sans-serif",
  pesos: {
    regular: 400,
    media: 500,
    seminegrito: 600,
  },
} as const;

export const tamanhos = {
  pequeno: 13,
  normal: 15,
  subtitulo: 18,
  titulo: 24,
} as const;

/** Unidade de espaçamento, em pixels. */
export const UNIDADE_ESPACO = 4;

export function espaco(n: number): number {
  return n * UNIDADE_ESPACO;
}

/**
 * Variáveis CSS do tema. Os CSS Modules só usam estas variáveis, nunca valores soltos:
 * `--cor-preto`, `--cor-cinza-200`, `--fonte`, `--peso-media`, `--tamanho-titulo` e
 * `--espaco` (multiplicado com `calc(var(--espaco) * n)`).
 */
export function variaveisCss(): Record<string, string> {
  const variaveis: Record<string, string> = {
    "--cor-preto": cores.preto,
    "--cor-branco": cores.branco,
    "--cor-roxo": cores.roxo,
    "--fonte": fontes.familia,
    "--espaco": `${UNIDADE_ESPACO}px`,
  };
  for (const [tom, valor] of Object.entries(cores.cinza)) {
    variaveis[`--cor-cinza-${tom}`] = valor;
  }
  for (const [nome, valor] of Object.entries(fontes.pesos)) {
    variaveis[`--peso-${nome}`] = String(valor);
  }
  for (const [nome, valor] of Object.entries(tamanhos)) {
    variaveis[`--tamanho-${nome}`] = `${valor}px`;
  }
  return variaveis;
}

/** Publica as variáveis do tema no elemento raiz da página. */
export function aplicarTema(raiz: HTMLElement = document.documentElement): void {
  for (const [nome, valor] of Object.entries(variaveisCss())) {
    raiz.style.setProperty(nome, valor);
  }
}

export const tema = { cores, fontes, tamanhos, espaco };
