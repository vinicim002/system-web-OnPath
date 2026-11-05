import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState, type ReactNode } from "react";

import type { Servicos } from "./contratos";
import { criarServicosLocais } from "./local/servicos";

const ContextoServicos = createContext<Servicos | null>(null);

interface Props {
  /** Padrão: a implementação local (Parte 1). Os testes podem injetar outra. */
  servicos?: Servicos;
  children: ReactNode;
}

/** Injeta a implementação dos serviços. Trocar a local pela API acontece só aqui. */
export function ServicosProvider({ servicos: servicosInjetados, children }: Props) {
  const [servicos] = useState(() => servicosInjetados ?? criarServicosLocais());
  const [clienteConsultas] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <ContextoServicos.Provider value={servicos}>
      <QueryClientProvider client={clienteConsultas}>{children}</QueryClientProvider>
    </ContextoServicos.Provider>
  );
}

export function useServicos(): Servicos {
  const servicos = useContext(ContextoServicos);
  if (!servicos) throw new Error("useServicos precisa estar dentro de ServicosProvider");
  return servicos;
}
