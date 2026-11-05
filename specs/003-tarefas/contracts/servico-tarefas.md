# Contrato: serviço de tarefas

O serviço `tarefas` passa de `ServicoColecao` para `ServicoTarefas`, em `src/dados/contratos.ts`.
A implementação local fica em `src/dados/local/tarefas.ts`. A tela só usa os hooks de
`src/dados/consultas.ts` (princípio IV).

```ts
interface FiltrosTarefas {
  areaId?: string;
  projetoId?: string | "avulsa";
  materiaId?: string;
  prioridade?: Prioridade;
  status?: StatusTarefa | "todas"; // padrão: "aberta"
}

interface ServicoTarefas extends ServicoColecao<Tarefa, NovaTarefa, AlteracaoTarefa> {
  /** Tarefas ativas que atendem aos filtros, na ordem da lista, com as subtarefas. */
  listarFiltradas(filtros?: FiltrosTarefas): Promise<Tarefa[]>;
  /** Cria uma tarefa principal (RN02, RN21, RN24). A área vem do projeto ou da matéria. */
  criar(dados: NovaTarefa): Promise<Tarefa>;
  /** Cria uma subtarefa só com o título; herda área, prioridade e vínculo (RN33). */
  criarSubtarefa(tarefaPaiId: string, titulo: string): Promise<Tarefa>;
  /** Edita. Na tarefa do topo, propaga herança; nas subtarefas, ignora os campos herdados. */
  alterar(id: string, dados: AlteracaoTarefa): Promise<Tarefa>;
  /** Move para outra tarefa principal, ou para o topo com `null`. Bloqueia ciclos. */
  mover(id: string, tarefaPaiId: string | null, dadosTopo?: { tempoEstimadoMin: number }): Promise<Tarefa>;
  /** Conclui. Com subtarefas abertas, exige `incluirSubtarefas: true`. */
  concluir(id: string, opcoes?: { incluirSubtarefas?: boolean }): Promise<Tarefa>;
  reabrir(id: string): Promise<Tarefa>;
  cancelar(id: string): Promise<Tarefa>;
  /** Arquiva a tarefa e todas as subtarefas (RN31). */
  excluir(id: string): Promise<void>;
  /** Recupera a tarefa e todas as subtarefas. */
  recuperar(id: string): Promise<Tarefa>;
  /** Cria a tarefa e marca o item da caixa como processado, na mesma escrita. */
  criarDeItemCaixa(itemId: string, dados: NovaTarefa): Promise<Tarefa>;
}
```

## Erros

| Código | Quando | Detalhes |
|---|---|---|
| `dados_invalidos` | Falta título, área, prioridade ou tempo (tarefa principal); prioridade fora da lista; projeto e matéria juntos; projeto, matéria ou pai inexistente ou arquivado | `campos`: lista dos campos com problema |
| `ciclo_subtarefa` **(novo)** | Mover uma tarefa para dentro dela mesma ou de uma descendente | — |
| `subtarefas_abertas` **(novo)** | Concluir com subtarefas abertas sem `incluirSubtarefas` | `quantidade` |
| `item_indisponivel` **(novo)** | Converter um item da caixa que não está novo (descartado ou processado) | — |
| `nao_encontrado` | Id inexistente | — |
| `armazenamento_indisponivel` | Não foi possível gravar | — |

Em qualquer erro, nada é gravado.

## Hooks (`src/dados/consultas.ts`)

| Hook | Uso |
|---|---|
| `useTarefas(filtros)` | Lista da tela. Chave `["tarefas", "lista", filtros]` |
| `useTarefa(id)` | Painel. Chave `["tarefas", "uma", id]` |
| `useSubtarefas(id)` | Árvore no painel. Chave `["tarefas", "subtarefas", id]` |
| `useOpcoesTarefa()` | Áreas, projetos e matérias ativos para formulários e filtros |
| `useCriarTarefa`, `useCriarSubtarefa`, `useAlterarTarefa`, `useMoverTarefa`, `useConcluirTarefa`, `useReabrirTarefa`, `useCancelarTarefa`, `useExcluirTarefa`, `useRecuperarTarefa`, `useCriarTarefaDeItem` | Escritas |

Toda escrita invalida `["tarefas"]`. `useCriarTarefaDeItem` também invalida `["itensCaixa"]`.
