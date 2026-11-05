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
  areas: ServicoColecao<T.Area, T.NovaArea, T.AlteracaoArea>;
  metas: ServicoColecao<T.Meta, T.NovaMeta, T.AlteracaoMeta>;
  grupos: ServicoColecao<T.Grupo, T.NovoGrupo, T.AlteracaoGrupo>;
  /** O `areaId` vem do grupo (RN01). */
  projetos: ServicoColecao<T.Projeto, T.NovoProjeto, T.AlteracaoProjeto>;
  colunas: ServicoColecao<T.Coluna, T.NovaColuna, T.AlteracaoColuna>;
  tarefas: ServicoColecao<T.Tarefa, T.NovaTarefa, T.AlteracaoTarefa>;
  itensCaixa: ServicoColecao<T.ItemCaixa, T.NovoItemCaixa, T.AlteracaoItemCaixa>;
  itensDia: ServicoColecao<T.ItemDia, T.NovoItemDia, T.AlteracaoItemDia>;
  rotinas: ServicoColecao<T.Rotina, T.NovaRotina, T.AlteracaoRotina>;
  compromissos: ServicoColecao<T.Compromisso, T.NovoCompromisso, T.AlteracaoCompromisso>;
  blocosTempo: ServicoColecao<T.BlocoTempo, T.NovoBlocoTempo, T.AlteracaoBlocoTempo>;
  materias: ServicoColecao<T.Materia, T.NovaMateria, T.AlteracaoMateria>;
  topicos: ServicoColecao<T.Topico, T.NovoTopico, T.AlteracaoTopico>;
  materiais: ServicoColecao<T.Material, T.NovoMaterial, T.AlteracaoMaterial>;
  sessoesEstudo: ServicoColecao<T.SessaoEstudo, T.NovaSessaoEstudo, T.AlteracaoSessaoEstudo>;
  dados: ServicoDados;
}
