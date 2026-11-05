# Contrato: serviço de projetos

Em `src/dados/contratos.ts`; implementação local em `src/dados/local/projetos.ts`.

```ts
interface ProjetoNaVisao extends Projeto {
  semProximaAcao: boolean;
  tarefasAbertas: number;
}

interface GrupoNaVisao extends GrupoComVagas {
  ativos: ProjetoNaVisao[];      // por prioridade e nome
  fila: ProjetoNaVisao[];        // por posicaoFila
  pausados: ProjetoNaVisao[];
  encerrados: ProjetoNaVisao[];  // concluídos e cancelados, mais recentes primeiro
}

interface AreaNaVisao {
  area: Area;
  grupos: GrupoNaVisao[];
}

interface FiltrosProjetos {
  areaId?: string;
  status?: StatusProjeto;
}

interface ServicoProjetos extends ServicoColecao<Projeto, NovoProjeto, AlteracaoProjeto> {
  visaoGeral(filtros?: FiltrosProjetos): Promise<AreaNaVisao[]>;
  /** Cria na fila, no fim. */
  criar(dados: Omit<NovoProjeto, "status" | "posicaoFila">): Promise<Projeto>;
  /** Nome único; mudar de grupo propaga a área para as tarefas. */
  alterar(id: string, dados: AlteracaoProjeto): Promise<Projeto>;
  /** Transições de research.md, item 3; ativar confere vaga e próxima ação. */
  mudarStatus(id: string, status: StatusProjeto): Promise<Projeto>;
  reordenarFila(grupoId: string, ids: string[]): Promise<void>;
  /** Ativo e sem tarefa aberta (RN08). */
  semProximaAcao(id: string): Promise<boolean>;
}
```

## Erros

| Código | Quando | Detalhes |
|---|---|---|
| `dados_invalidos` | Nome vazio, grupo ou meta inválidos, lista de fila incompleta | `campos` |
| `nome_repetido` | Nome repetido no grupo | `campos: ["nome"]` |
| `grupo_cheio` **(novo)** | Ativar (ou mudar de grupo estando ativo) sem vaga | `ocupantes: {id, nome}[]`, `limite` |
| `sem_proxima_acao` **(novo)** | Ativar sem tarefa aberta | — |
| `transicao_invalida` **(novo)** | Mudança de status fora da tabela | `de`, `para` |

## Hooks

`useVisaoProjetos(filtros)`, `useProjeto(id)`, `useCriarProjeto`, `useAlterarProjeto`,
`useMudarStatusProjeto`, `useReordenarFila`, `useExcluirProjeto`, `useRecuperarProjeto`. As escritas
invalidam `["projetos"]`, `["grupos"]`, `["areas"]`, `["opcoesTarefa"]` e, ao mudar de grupo,
`["tarefas"]`.
