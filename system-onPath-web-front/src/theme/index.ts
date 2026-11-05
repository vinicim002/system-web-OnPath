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
  regular: "Inter_400Regular",
  media: "Inter_500Medium",
  seminegrito: "Inter_600SemiBold",
} as const;

export const tamanhos = {
  pequeno: 13,
  normal: 15,
  subtitulo: 18,
  titulo: 24,
} as const;

export function espaco(n: number): number {
  return n * 4;
}

export const tema = { cores, fontes, tamanhos, espaco };
