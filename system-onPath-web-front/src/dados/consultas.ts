import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { FiltrosTarefas } from "./contratos";
import { NOMES_COLECOES, type NomeColecao, type NovaTarefa, type Registros } from "./tipos";
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

// ---------------------------------------------------------------------------
// Tarefas (specs/003-tarefas/contracts/servico-tarefas.md)
// ---------------------------------------------------------------------------

const CHAVE_TAREFAS = ["tarefas"] as const;

/** Tarefas que atendem aos filtros, na ordem da lista, com as subtarefas. */
export function useTarefas(filtros: FiltrosTarefas = {}) {
  const { tarefas } = useServicos();
  return useQuery({
    queryKey: [...CHAVE_TAREFAS, "lista", filtros],
    queryFn: () => tarefas.listarFiltradas(filtros),
  });
}

/** Todas as tarefas ativas, em qualquer status (para árvore, herança e mover). */
export function useTodasTarefas() {
  return useTarefas({ status: "todas" });
}

/** Áreas, projetos e matérias ativos, para formulários e filtros. */
export function useOpcoesTarefa() {
  const servicos = useServicos();
  return useQuery({
    queryKey: ["opcoesTarefa"],
    queryFn: async () => {
      const [areas, projetos, materias] = await Promise.all([
        servicos.areas.listar(),
        servicos.projetos.listar(),
        servicos.materias.listar(),
      ]);
      return {
        areas: [...areas].sort((a, b) => a.ordem - b.ordem),
        projetos: [...projetos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
        materias: [...materias].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
      };
    },
  });
}

function useEscritaTarefas<Entrada, Saida>(
  escrever: (entrada: Entrada) => Promise<Saida>,
  outrasChaves: string[] = [],
) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: escrever,
    onSettled: () => {
      void clienteConsultas.invalidateQueries({ queryKey: CHAVE_TAREFAS });
      for (const chave of outrasChaves) void clienteConsultas.invalidateQueries({ queryKey: [chave] });
    },
  });
}

export function useCriarTarefa() {
  const { tarefas } = useServicos();
  return useEscritaTarefas((dados: NovaTarefa) => tarefas.criar(dados));
}

export function useCriarSubtarefa() {
  const { tarefas } = useServicos();
  return useEscritaTarefas(({ tarefaPaiId, titulo }: { tarefaPaiId: string; titulo: string }) =>
    tarefas.criarSubtarefa(tarefaPaiId, titulo),
  );
}

export function useAlterarTarefa() {
  const { tarefas } = useServicos();
  return useEscritaTarefas(({ id, dados }: { id: string; dados: Partial<NovaTarefa> }) =>
    tarefas.alterar(id, dados),
  );
}

export function useMoverTarefa() {
  const { tarefas } = useServicos();
  return useEscritaTarefas(
    ({ id, tarefaPaiId, tempoEstimadoMin }: { id: string; tarefaPaiId: string | null; tempoEstimadoMin?: number | null }) =>
      tarefas.mover(id, tarefaPaiId, { tempoEstimadoMin }),
  );
}

export function useConcluirTarefa() {
  const { tarefas } = useServicos();
  return useEscritaTarefas(({ id, incluirSubtarefas }: { id: string; incluirSubtarefas?: boolean }) =>
    tarefas.concluir(id, { incluirSubtarefas }),
  );
}

export function useReabrirTarefa() {
  const { tarefas } = useServicos();
  return useEscritaTarefas((id: string) => tarefas.reabrir(id));
}

export function useCancelarTarefa() {
  const { tarefas } = useServicos();
  return useEscritaTarefas((id: string) => tarefas.cancelar(id));
}

export function useExcluirTarefa() {
  const { tarefas } = useServicos();
  return useEscritaTarefas((id: string) => tarefas.excluir(id));
}

export function useRecuperarTarefa() {
  const { tarefas } = useServicos();
  return useEscritaTarefas((id: string) => tarefas.recuperar(id));
}

export function useCriarTarefaDeItem() {
  const { tarefas } = useServicos();
  return useEscritaTarefas(
    ({ itemId, dados }: { itemId: string; dados: NovaTarefa }) => tarefas.criarDeItemCaixa(itemId, dados),
    ["itensCaixa"],
  );
}
