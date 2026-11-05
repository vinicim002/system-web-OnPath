import type * as T from "./tipos";

export interface OpcoesListar {
  incluirArquivados?: boolean;
}

export interface ServicoColecao<Registro, Novo, Alteracao> {
  listar(opcoes?: OpcoesListar): Promise<Registro[]>;
  /** Erro `nao_encontrado` se o id não existir. */
  obter(id: string): Promise<Registro>;
  /** Erro `dados_invalidos` se algum campo não seguir o esquema. */
  criar(dados: Novo): Promise<Registro>;
  alterar(id: string, dados: Alteracao): Promise<Registro>;
  /** Arquiva o item (RN31). */
  excluir(id: string): Promise<void>;
  recuperar(id: string): Promise<Registro>;
}

/** Serviço da caixa de entrada (specs/002-caixa-entrada/contracts/servico-itens-caixa.md). */
export interface ServicoItensCaixa
  extends ServicoColecao<T.ItemCaixa, T.NovoItemCaixa, T.AlteracaoItemCaixa> {
  /** Itens novos e não arquivados, do mais novo para o mais antigo. */
  listarNovos(): Promise<T.ItemCaixa[]>;
  /** Itens descartados, do descarte mais recente para o mais antigo. */
  listarDescartados(): Promise<T.ItemCaixa[]>;
  /** Cria um item novo só com o texto (RN03). Erro `dados_invalidos` se o texto for vazio. */
  capturar(conteudo: string): Promise<T.ItemCaixa>;
  /** Situação `descartado` e `arquivadoEm` com a data atual, na mesma escrita (RN31). */
  descartar(id: string): Promise<T.ItemCaixa>;
  /** Situação `novo` e `arquivadoEm` vazio, na mesma escrita. */
  recuperar(id: string): Promise<T.ItemCaixa>;
}

export interface FiltrosTarefas {
  areaId?: string;
  /** Um projeto, ou "avulsa" para tarefas sem projeto e sem matéria. */
  projetoId?: string;
  materiaId?: string;
  prioridade?: T.Prioridade;
  /** Padrão: "aberta". */
  status?: T.StatusTarefa | "todas";
}

/** Serviço de tarefas (specs/003-tarefas/contracts/servico-tarefas.md). */
export interface ServicoTarefas extends ServicoColecao<T.Tarefa, T.NovaTarefa, T.AlteracaoTarefa> {
  /** Tarefas ativas que atendem aos filtros, na ordem da lista, com as subtarefas. */
  listarFiltradas(filtros?: FiltrosTarefas): Promise<T.Tarefa[]>;
  /** Cria uma tarefa principal (RN02, RN21, RN24). A área vem do projeto ou da matéria. */
  criar(dados: T.NovaTarefa): Promise<T.Tarefa>;
  /** Cria uma subtarefa só com o título; herda área, prioridade e vínculo (RN33). */
  criarSubtarefa(tarefaPaiId: string, titulo: string): Promise<T.Tarefa>;
  /** Na tarefa do topo, propaga a herança; nas subtarefas, ignora os campos herdados. */
  alterar(id: string, dados: T.AlteracaoTarefa): Promise<T.Tarefa>;
  /** Move para outra tarefa principal, ou para o topo com `null`. Bloqueia ciclos. */
  mover(
    id: string,
    tarefaPaiId: string | null,
    dadosTopo?: { tempoEstimadoMin?: number | null },
  ): Promise<T.Tarefa>;
  /** Conclui. Com subtarefas abertas, exige `incluirSubtarefas: true`. */
  concluir(id: string, opcoes?: { incluirSubtarefas?: boolean }): Promise<T.Tarefa>;
  reabrir(id: string): Promise<T.Tarefa>;
  cancelar(id: string): Promise<T.Tarefa>;
  /** Arquiva a tarefa e todas as subtarefas (RN31). */
  excluir(id: string): Promise<void>;
  /** Recupera a tarefa e todas as subtarefas. */
  recuperar(id: string): Promise<T.Tarefa>;
  /** Cria a tarefa e marca o item da caixa como processado, na mesma escrita. */
  criarDeItemCaixa(itemId: string, dados: T.NovaTarefa): Promise<T.Tarefa>;
}

/** Item do plano do dia, com a tarefa (specs/004-hoje/contracts/servico-itens-dia.md). */
export interface ItemDoPlano {
  item: T.ItemDia;
  tarefa: T.Tarefa;
  /** Título da tarefa principal, quando a tarefa é subtarefa. */
  tituloPrincipal: string | null;
}

export interface PlanoDoDia {
  /** AAAA-MM-DD */
  data: string;
  /** Na ordem do dia. */
  itens: ItemDoPlano[];
  /** Id do item em destaque (RN20). */
  proximaId: string | null;
  planejadoMin: number;
  feitoMin: number;
}

export interface Pendencia {
  tarefa: T.Tarefa;
  tituloPrincipal: string | null;
  /** Data mais recente em que a tarefa estava planejada. */
  data: string;
}

export type Destino = { tipo: "remarcar"; data: string } | { tipo: "devolver" } | { tipo: "cancelar" };

export interface ServicoItensDia extends ServicoColecao<T.ItemDia, T.NovoItemDia, T.AlteracaoItemDia> {
  planoDoDia(data: string): Promise<PlanoDoDia>;
  /** Adiciona no fim do dia, ignorando as que já estão nele. */
  adicionar(data: string, tarefaIds: string[]): Promise<T.ItemDia[]>;
  /** Tira do dia (arquiva o item). A tarefa não muda. */
  excluir(id: string): Promise<void>;
  /** Grava a nova ordem completa do dia. */
  reordenar(data: string, itemIds: string[]): Promise<void>;
  /** Pendências de dias anteriores a `hoje`, na ordem de data e do dia (RN25). */
  listarPendencias(hoje: string): Promise<Pendencia[]>;
  decidirPendencia(tarefaId: string, destino: Destino, hoje: string): Promise<void>;
  remarcarTodasPara(hoje: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Áreas, metas e grupos (specs/005-areas-metas-grupos/contracts/servicos.md)
// ---------------------------------------------------------------------------

export interface ContagemArea {
  metasAtivas: number;
  grupos: number;
  projetos: number;
  tarefasAbertas: number;
  materias: number;
}

export interface AreaComResumo extends T.Area {
  contagem: ContagemArea;
}

export interface ServicoAreas extends ServicoColecao<T.Area, T.NovaArea, T.AlteracaoArea> {
  /** Áreas ativas na ordem, com as contagens. */
  listarComResumo(): Promise<AreaComResumo[]>;
  /** Áreas arquivadas, da mais recente para a mais antiga. */
  listarArquivadas(): Promise<T.Area[]>;
  /** Cria no fim. Nome único e tom do tema. */
  criar(dados: { nome: string; cor: string }): Promise<T.Area>;
  alterar(id: string, dados: { nome?: string; cor?: string }): Promise<T.Area>;
  /** Regrava a ordem das áreas ativas. A lista precisa ter todas elas. */
  reordenar(ids: string[]): Promise<void>;
  /** Com itens ativos, exige `confirmado: true`. Nunca arquiva a última área ativa. */
  excluir(id: string, opcoes?: { confirmado?: boolean }): Promise<void>;
  /** Recupera no fim da ordem. */
  recuperar(id: string): Promise<T.Area>;
}

export interface MetaNaLista extends T.Meta {
  atrasada: boolean;
}

export interface ServicoMetas extends ServicoColecao<T.Meta, T.NovaMeta, T.AlteracaoMeta> {
  /** Metas não arquivadas da área, na ordem da tela; `hoje` define o atraso. */
  listarDaArea(areaId: string, hoje: string): Promise<MetaNaLista[]>;
}

export interface GrupoComVagas extends T.Grupo {
  ativos: number;
  acimaDoLimite: boolean;
}

export interface ServicoGrupos extends ServicoColecao<T.Grupo, T.NovoGrupo, T.AlteracaoGrupo> {
  /** Grupos ativos da área, por nome, com as vagas (RN06). */
  listarDaArea(areaId: string): Promise<GrupoComVagas[]>;
  /** Recusa enquanto houver projetos não arquivados no grupo. */
  excluir(id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Projetos (specs/006-projetos/contracts/servico-projetos.md)
// ---------------------------------------------------------------------------

export interface ProjetoNaVisao extends T.Projeto {
  semProximaAcao: boolean;
  tarefasAbertas: number;
}

export interface GrupoNaVisao extends GrupoComVagas {
  /** Por prioridade e nome. */
  projetosAtivos: ProjetoNaVisao[];
  /** Pela posição na fila. */
  fila: ProjetoNaVisao[];
  pausados: ProjetoNaVisao[];
  /** Concluídos e cancelados, mais recentes primeiro. */
  encerrados: ProjetoNaVisao[];
}

export interface AreaNaVisao {
  area: T.Area;
  grupos: GrupoNaVisao[];
}

export interface FiltrosProjetos {
  areaId?: string;
  status?: T.StatusProjeto;
}

export interface ServicoProjetos extends ServicoColecao<T.Projeto, T.NovoProjeto, T.AlteracaoProjeto> {
  visaoGeral(filtros?: FiltrosProjetos): Promise<AreaNaVisao[]>;
  /** Cria na fila, no fim. */
  criar(dados: Omit<T.NovoProjeto, "status" | "posicaoFila">): Promise<T.Projeto>;
  /** Nome único no grupo; mudar de grupo propaga a área para as tarefas (RN01). */
  alterar(id: string, dados: T.AlteracaoProjeto): Promise<T.Projeto>;
  /** Transições permitidas; ativar confere vaga (RN07) e próxima ação (RN08). */
  mudarStatus(id: string, status: T.StatusProjeto): Promise<T.Projeto>;
  reordenarFila(grupoId: string, ids: string[]): Promise<void>;
  /** Ativo e sem tarefa aberta (RN08). */
  semProximaAcao(id: string): Promise<boolean>;
}

export interface CopiaDados {
  formato: "onpath-copia";
  versao: number;
  exportadoEm: string;
  colecoes: T.Colecoes;
}

export interface ServicoDados {
  /** Cria os dados iniciais se ainda não existirem. Pode ser chamado várias vezes. */
  prepararPrimeiroUso(): Promise<{ criou: boolean }>;
  /** Devolve a cópia completa, inclusive arquivados (FR-020), e registra a data da exportação. */
  exportar(): Promise<CopiaDados>;
  /** Valida a cópia inteira e só então substitui todos os dados (FR-021 e FR-022). */
  importar(conteudo: unknown): Promise<{ registros: number }>;
}

export interface Servicos {
  areas: ServicoAreas;
  metas: ServicoMetas;
  grupos: ServicoGrupos;
  /** O `areaId` vem do grupo (RN01). */
  projetos: ServicoProjetos;
  colunas: ServicoColecao<T.Coluna, T.NovaColuna, T.AlteracaoColuna>;
  tarefas: ServicoTarefas;
  itensCaixa: ServicoItensCaixa;
  itensDia: ServicoItensDia;
  rotinas: ServicoColecao<T.Rotina, T.NovaRotina, T.AlteracaoRotina>;
  compromissos: ServicoColecao<T.Compromisso, T.NovoCompromisso, T.AlteracaoCompromisso>;
  blocosTempo: ServicoColecao<T.BlocoTempo, T.NovoBlocoTempo, T.AlteracaoBlocoTempo>;
  materias: ServicoColecao<T.Materia, T.NovaMateria, T.AlteracaoMateria>;
  topicos: ServicoColecao<T.Topico, T.NovoTopico, T.AlteracaoTopico>;
  materiais: ServicoColecao<T.Material, T.NovoMaterial, T.AlteracaoMaterial>;
  sessoesEstudo: ServicoColecao<T.SessaoEstudo, T.NovaSessaoEstudo, T.AlteracaoSessaoEstudo>;
  dados: ServicoDados;
}
