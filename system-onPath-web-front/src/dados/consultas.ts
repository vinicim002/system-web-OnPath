import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { NOMES_COLECOES, type NomeColecao, type Registros } from "./tipos";
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

/** Gera a cópia completa dos dados. */
export function useExportarDados() {
  const { dados } = useServicos();
  return useMutation({ mutationFn: () => dados.exportar() });
}

/** Substitui todos os dados pelos da cópia e recarrega as consultas. */
export function useImportarDados() {
  const { dados } = useServicos();
  const invalidarTudo = useInvalidarTudo();
  return useMutation({
    mutationFn: (conteudo: unknown) => dados.importar(conteudo),
    onSuccess: () => invalidarTudo(),
  });
}

/** Indica se já existe algum registro, ativo ou arquivado, em qualquer coleção. */
export function useExistemDados() {
  const servicos = useServicos();
  return useCallback(async () => {
    const listas = await Promise.all(
      NOMES_COLECOES.map((nome) => servicos[nome].listar({ incluirArquivados: true })),
    );
    return listas.some((registros) => registros.length > 0);
  }, [servicos]);
}
