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

// ---------------------------------------------------------------------------
// Caixa de entrada (specs/002-caixa-entrada/contracts/servico-itens-caixa.md)
// ---------------------------------------------------------------------------

const CHAVE_CAIXA = ["itensCaixa"] as const;

/** Itens novos da caixa, do mais novo para o mais antigo. Também alimenta o contador do menu. */
export function useItensNovos() {
  const { itensCaixa } = useServicos();
  return useQuery({ queryKey: [...CHAVE_CAIXA, "novos"], queryFn: () => itensCaixa.listarNovos() });
}

/** Itens descartados, do descarte mais recente para o mais antigo. */
export function useItensDescartados() {
  const { itensCaixa } = useServicos();
  return useQuery({
    queryKey: [...CHAVE_CAIXA, "descartados"],
    queryFn: () => itensCaixa.listarDescartados(),
  });
}

/** Escrita na caixa que, ao terminar, recarrega as listas e o contador. */
function useEscritaCaixa<Entrada, Saida>(escrever: (entrada: Entrada) => Promise<Saida>) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: escrever,
    onSettled: () => clienteConsultas.invalidateQueries({ queryKey: CHAVE_CAIXA }),
  });
}

export function useCapturarItem() {
  const { itensCaixa } = useServicos();
  return useEscritaCaixa((conteudo: string) => itensCaixa.capturar(conteudo));
}

export function useDescartarItem() {
  const { itensCaixa } = useServicos();
  return useEscritaCaixa((id: string) => itensCaixa.descartar(id));
}

export function useRecuperarItem() {
  const { itensCaixa } = useServicos();
  return useEscritaCaixa((id: string) => itensCaixa.recuperar(id));
}

export function useEditarItem() {
  const { itensCaixa } = useServicos();
  return useEscritaCaixa(({ id, conteudo }: { id: string; conteudo: string }) =>
    itensCaixa.alterar(id, { conteudo }),
  );
}
