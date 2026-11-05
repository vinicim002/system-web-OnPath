import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { Destino, FiltrosTarefas } from "./contratos";
import {
  NOMES_COLECOES,
  type NomeColecao,
  type NovaMeta,
  type NovaTarefa,
  type NovoGrupo,
  type Registros,
} from "./tipos";
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
      void clienteConsultas.invalidateQueries({ queryKey: ["itensDia"] });
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

// ---------------------------------------------------------------------------
// Hoje (specs/004-hoje/contracts/servico-itens-dia.md)
// ---------------------------------------------------------------------------

const CHAVE_DIA = ["itensDia"] as const;

/** Plano de uma data: itens com as tarefas, a próxima e os tempos. */
export function usePlanoDoDia(data: string) {
  const { itensDia } = useServicos();
  return useQuery({ queryKey: [...CHAVE_DIA, "plano", data], queryFn: () => itensDia.planoDoDia(data) });
}

/** Pendências de dias anteriores a hoje (RN25). */
export function usePendencias(hoje: string) {
  const { itensDia } = useServicos();
  return useQuery({
    queryKey: [...CHAVE_DIA, "pendencias", hoje],
    queryFn: () => itensDia.listarPendencias(hoje),
  });
}

function useEscritaDia<Entrada, Saida>(escrever: (entrada: Entrada) => Promise<Saida>, mudaTarefas = false) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: escrever,
    onSettled: () => {
      void clienteConsultas.invalidateQueries({ queryKey: CHAVE_DIA });
      if (mudaTarefas) void clienteConsultas.invalidateQueries({ queryKey: CHAVE_TAREFAS });
    },
  });
}

export function useAdicionarAoDia() {
  const { itensDia } = useServicos();
  return useEscritaDia(({ data, tarefaIds }: { data: string; tarefaIds: string[] }) =>
    itensDia.adicionar(data, tarefaIds),
  );
}

export function useTirarDoDia() {
  const { itensDia } = useServicos();
  return useEscritaDia((itemId: string) => itensDia.excluir(itemId));
}

export function useReordenarDia() {
  const { itensDia } = useServicos();
  return useEscritaDia(({ data, itemIds }: { data: string; itemIds: string[] }) =>
    itensDia.reordenar(data, itemIds),
  );
}

export function useDecidirPendencia() {
  const { itensDia } = useServicos();
  return useEscritaDia(
    ({ tarefaId, destino, hoje }: { tarefaId: string; destino: Destino; hoje: string }) =>
      itensDia.decidirPendencia(tarefaId, destino, hoje),
    true,
  );
}

export function useRemarcarTodas() {
  const { itensDia } = useServicos();
  return useEscritaDia((hoje: string) => itensDia.remarcarTodasPara(hoje));
}

// ---------------------------------------------------------------------------
// Áreas, metas e grupos (specs/005-areas-metas-grupos/contracts/servicos.md)
// ---------------------------------------------------------------------------

function useEscrita<Entrada, Saida>(escrever: (entrada: Entrada) => Promise<Saida>, chaves: string[]) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: escrever,
    onSettled: () => {
      for (const chave of chaves) void clienteConsultas.invalidateQueries({ queryKey: [chave] });
    },
  });
}

const CHAVES_AREAS = ["areas", "opcoesTarefa", "tarefas"];
const CHAVES_METAS = ["metas", "areas"];
const CHAVES_GRUPOS = ["grupos", "areas"];

export function useAreasComResumo() {
  const { areas } = useServicos();
  return useQuery({ queryKey: ["areas", "resumo"], queryFn: () => areas.listarComResumo() });
}

export function useAreasArquivadas() {
  const { areas } = useServicos();
  return useQuery({ queryKey: ["areas", "arquivadas"], queryFn: () => areas.listarArquivadas() });
}

export function useCriarArea() {
  const { areas } = useServicos();
  return useEscrita((dados: { nome: string; cor: string }) => areas.criar(dados), CHAVES_AREAS);
}

export function useAlterarArea() {
  const { areas } = useServicos();
  return useEscrita(
    ({ id, dados }: { id: string; dados: { nome?: string; cor?: string } }) => areas.alterar(id, dados),
    CHAVES_AREAS,
  );
}

export function useReordenarAreas() {
  const { areas } = useServicos();
  return useEscrita((ids: string[]) => areas.reordenar(ids), CHAVES_AREAS);
}

export function useArquivarArea() {
  const { areas } = useServicos();
  return useEscrita(
    ({ id, confirmado }: { id: string; confirmado?: boolean }) => areas.excluir(id, { confirmado }),
    CHAVES_AREAS,
  );
}

export function useRecuperarArea() {
  const { areas } = useServicos();
  return useEscrita((id: string) => areas.recuperar(id), CHAVES_AREAS);
}

export function useMetasDaArea(areaId: string, hoje: string) {
  const { metas } = useServicos();
  return useQuery({ queryKey: ["metas", areaId, hoje], queryFn: () => metas.listarDaArea(areaId, hoje) });
}

export function useCriarMeta() {
  const { metas } = useServicos();
  return useEscrita((dados: NovaMeta) => metas.criar(dados), CHAVES_METAS);
}

export function useAlterarMeta() {
  const { metas } = useServicos();
  return useEscrita(({ id, dados }: { id: string; dados: Partial<NovaMeta> }) => metas.alterar(id, dados), CHAVES_METAS);
}

export function useExcluirMeta() {
  const { metas } = useServicos();
  return useEscrita((id: string) => metas.excluir(id), CHAVES_METAS);
}

export function useRecuperarMeta() {
  const { metas } = useServicos();
  return useEscrita((id: string) => metas.recuperar(id), CHAVES_METAS);
}

export function useGruposDaArea(areaId: string) {
  const { grupos } = useServicos();
  return useQuery({ queryKey: ["grupos", areaId], queryFn: () => grupos.listarDaArea(areaId) });
}

export function useCriarGrupo() {
  const { grupos } = useServicos();
  return useEscrita((dados: NovoGrupo) => grupos.criar(dados), CHAVES_GRUPOS);
}

export function useAlterarGrupo() {
  const { grupos } = useServicos();
  return useEscrita(
    ({ id, dados }: { id: string; dados: Partial<NovoGrupo> }) => grupos.alterar(id, dados),
    CHAVES_GRUPOS,
  );
}

export function useExcluirGrupo() {
  const { grupos } = useServicos();
  return useEscrita((id: string) => grupos.excluir(id), CHAVES_GRUPOS);
}

export function useRecuperarGrupo() {
  const { grupos } = useServicos();
  return useEscrita((id: string) => grupos.recuperar(id), CHAVES_GRUPOS);
}
