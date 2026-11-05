# Contrato: colunas e tarefas no Kanban

```ts
interface ServicoColunas extends ServicoColecao<Coluna, NovaColuna, AlteracaoColuna> {
  /** Colunas ativas do projeto, na ordem. */
  listarDoProjeto(projetoId: string): Promise<Coluna[]>;
  /** Cria no fim, não final. */
  criar(dados: { projetoId: string; nome: string }): Promise<Coluna>;
  alterar(id: string, dados: { nome?: string }): Promise<Coluna>;
  reordenar(projetoId: string, ids: string[]): Promise<void>;
  /** Marca como final e desmarca a anterior; `false` desmarca. */
  marcarFinal(id: string, final: boolean): Promise<void>;
  /** Arquiva e deixa as tarefas dela sem coluna. */
  excluir(id: string): Promise<void>;
  /** Recupera no fim e devolve as tarefas. */
  recuperar(id: string): Promise<Coluna>;
}

// Acréscimos ao ServicoTarefas (specs/003-tarefas):
interface ServicoTarefas {
  /** Muda a coluna; para a final, conclui; de concluída para outra, reabre (RN32). */
  moverParaColuna(id: string, colunaId: string | null, opcoes?: { incluirSubtarefas?: boolean }): Promise<Tarefa>;
}
```

`concluir` e `reabrir` passam a ajustar a coluna (research.md, item 2).

## Hooks

`useColunas(projetoId)`, `useCriarColuna`, `useAlterarColuna`, `useReordenarColunas`,
`useMarcarFinal`, `useExcluirColuna`, `useRecuperarColuna`, `useMoverParaColuna`. As escritas
invalidam `["colunas"]`, `["tarefas"]`, `["itensDia"]` e `["projetos"]`.
