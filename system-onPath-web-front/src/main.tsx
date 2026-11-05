import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./theme/tema.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { ServicosProvider } from "@/dados/ServicosProvider";
import { aplicarModo } from "@/theme/modo";

import { roteador } from "./rotas";

// Antes da primeira pintura, para a tela não piscar em claro no modo escuro.
aplicarModo();

createRoot(document.getElementById("raiz")!).render(
  <StrictMode>
    <ServicosProvider>
      <RouterProvider router={roteador} />
    </ServicosProvider>
  </StrictMode>,
);
