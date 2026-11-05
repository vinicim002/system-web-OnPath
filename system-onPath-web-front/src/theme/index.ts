/**
 * Cores do OnPath para o código que precisa do valor, como as cores das áreas.
 * Os componentes usam as classes do Tailwind geradas por `tema.css`, que tem as mesmas cores
 * (conferido em `__tests__/tema.test.ts`).
 */
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
