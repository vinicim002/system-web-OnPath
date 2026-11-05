import { createBrowserRouter } from "react-router";

import { Moldura } from "@/components/Moldura";
import { Agenda } from "@/telas/Agenda";
import { Ajustes } from "@/telas/Ajustes";
import { Areas } from "@/telas/Areas";
import { Caixa } from "@/telas/Caixa";
import { Estudos } from "@/telas/Estudos";
import { Hoje } from "@/telas/Hoje";
import { Login } from "@/telas/Login";
import { NaoEncontrada } from "@/telas/NaoEncontrada";
import { Projetos } from "@/telas/Projetos";
import { Rotinas } from "@/telas/Rotinas";
import { Tarefas } from "@/telas/Tarefas";

/** Painel do projeto: só existe no modo de desenvolvimento e não entra no build final. */
const rotasDesenvolvimento = import.meta.env.DEV
  ? [
      {
        path: "painel",
        lazy: async () => ({ Component: (await import("@/telas/Painel")).Painel }),
      },
    ]
  : [];

/** Endereços das telas (contracts/rotas.md). A ordem do menu fica em MenuLateral. */
export const roteador = createBrowserRouter([
  // Tela de login só visual, fora da moldura (constituição 1.3.0).
  { path: "login", element: <Login /> },
  {
    element: <Moldura />,
    children: [
      { index: true, element: <Hoje /> },
      { path: "caixa", element: <Caixa /> },
      { path: "tarefas", element: <Tarefas /> },
      { path: "projetos", element: <Projetos /> },
      { path: "areas", element: <Areas /> },
      { path: "agenda", element: <Agenda /> },
      { path: "rotinas", element: <Rotinas /> },
      { path: "estudos", element: <Estudos /> },
      { path: "ajustes", element: <Ajustes /> },
      ...rotasDesenvolvimento,
      { path: "*", element: <NaoEncontrada /> },
    ],
  },
]);
