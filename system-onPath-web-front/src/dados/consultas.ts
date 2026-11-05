import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { NomeColecao, Registros } from "./tipos";
import { useServicos } from "./ServicosProvider";

/** Lista os registros ativos de uma coleção. */
export function useLista<N extends NomeColecao>(nomeColecao: N) {
  const servicos = useServicos();
  return useQuery({
    queryKey: [nomeColecao],
    queryFn: () => servicos[nomeColecao].listar() as Promise<Registros[N][]>,
  });
}

/** Marca todas as consultas como desatualizadas, para recarregarem. */
export function useInvalidarTudo() {
  const clienteConsultas = useQueryClient();
  return useCallback(() => clienteConsultas.invalidateQueries(), [clienteConsultas]);
}
