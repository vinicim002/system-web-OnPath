# Contrato: serviço de itens do dia

O serviço `itensDia` passa de `ServicoColecao` para `ServicoItensDia`, em `src/dados/contratos.ts`.
Implementação local em `src/dados/local/itensDia.ts`.

```ts
interface ItemDoPlano {
  item: ItemDia;
  tarefa: Tarefa;
  /** Título da tarefa principal, quando a tarefa é subtarefa. */
  tituloPrincipal: string | null;
}

interface PlanoDoDia {
  data: string;               // AAAA-MM-DD
  itens: ItemDoPlano[];       // na ordem do dia
  proximaId: string | null;   // id do item em destaque (RN20)
  planejadoMin: number;
  feitoMin: number;
}

interface Pendencia {
  tarefa: Tarefa;
  tituloPrincipal: string | null;
  /** Data mais recente em que a tarefa estava planejada. */
  data: string;
}

type Destino =
  | { tipo: "remarcar"; data: string }
  | { tipo: "devolver" }
  | { tipo: "cancelar" };

interface ServicoItensDia extends ServicoColecao<ItemDia, NovoItemDia, AlteracaoItemDia> {
  planoDoDia(data: string): Promise<PlanoDoDia>;
  /** Adiciona no fim do dia, ignorando as que já estão nele. */
  adicionar(data: string, tarefaIds: string[]): Promise<ItemDia[]>;
  /** Tira do dia (arquiva o item). A tarefa não muda. */
  excluir(id: string): Promise<void>;
  /** Grava a nova ordem completa do dia. */
  reordenar(data: string, itemIds: string[]): Promise<void>;
  /** Pendências de dias anteriores a `hoje`, na ordem de data e do dia (RN25). */
  listarPendencias(hoje: string): Promise<Pendencia[]>;
  decidirPendencia(tarefaId: string, destino: Destino, hoje: string): Promise<void>;
  remarcarTodasPara(hoje: string): Promise<void>;
}
```

## Erros

| Código | Quando |
|---|---|
| `dados_invalidos` | Tarefa inexistente, arquivada ou não aberta ao adicionar (campo `tarefaId`); data em formato errado; lista de `reordenar` diferente dos itens do dia |
| `data_passada` **(novo)** | Remarcar para antes de `hoje` |
| `nao_e_pendencia` **(novo)** | Decidir uma tarefa que não tem pendência |
| `armazenamento_indisponivel` | Não foi possível gravar |

Em qualquer erro, nada é gravado.

## Hooks (`src/dados/consultas.ts`)

| Hook | Uso |
|---|---|
| `usePlanoDoDia(data)` | Lista do dia. Chave `["itensDia", "plano", data]` |
| `usePendencias(hoje)` | Revisão e contador do menu. Chave `["itensDia", "pendencias", hoje]` |
| `useAdicionarAoDia`, `useTirarDoDia`, `useReordenarDia`, `useDecidirPendencia`, `useRemarcarTodas` | Escritas |

Toda escrita invalida `["itensDia"]`; as que mudam tarefas (cancelar pendência) também invalidam
`["tarefas"]`. As escritas de tarefas (feature 003) passam a invalidar `["itensDia"]` também, para
o dia refletir conclusões feitas em outras telas (RN04).
