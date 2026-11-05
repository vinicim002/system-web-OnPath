import { createBrowserRouter, type RouteObject } from "react-router";

import { Moldura } from "@/components/Moldura";
import { Hoje } from "@/telas/Hoje";
import { NaoEncontrada } from "@/telas/NaoEncontrada";

/**
 * Carrega a tela só quando ela é aberta, para o app inicial ficar leve. Hoje, que é a tela
 * inicial, e a página de não encontrada continuam no pacote principal.
 */
function sobDemanda(carregar: () => Promise<{ Component: React.ComponentType }>): RouteObject["lazy"] {
  return carregar;
}

/** Painel do projeto: só existe no modo de desenvolvimento e não entra no build final. */
const rotasDesenvolvimento: RouteObject[] = import.meta.env.DEV
  ? [{ path: "painel", lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Painel")).Painel })) }]
  : [];

/** Endereços das telas (contracts/rotas.md). A ordem do menu fica em MenuLateral. */
export const roteador = createBrowserRouter([
  // Tela de login só visual, fora da moldura (constituição 1.3.0).
  {
    path: "login",
    lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Login")).Login })),
    hydrateFallbackElement: null,
  },
  {
    element: <Moldura />,
    hydrateFallbackElement: null,
    children: [
      { index: true, element: <Hoje /> },
      { path: "caixa", lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Caixa")).Caixa })) },
      { path: "tarefas", lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Tarefas")).Tarefas })) },
      { path: "projetos", lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Projetos")).Projetos })) },
      { path: "kanban", lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Kanban")).Kanban })) },
      { path: "projetos/:id", lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Projeto")).Projeto })) },
      { path: "areas", lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Areas")).Areas })) },
      { path: "agenda", lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Agenda")).Agenda })) },
      { path: "rotinas", lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Rotinas")).Rotinas })) },
      { path: "estudos", lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Estudos")).Estudos })) },
      { path: "ajustes", lazy: sobDemanda(async () => ({ Component: (await import("@/telas/Ajustes")).Ajustes })) },
      ...rotasDesenvolvimento,
      { path: "*", element: <NaoEncontrada /> },
    ],
  },
]);
