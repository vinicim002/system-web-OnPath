# Modelo de dados: Hoje

Nenhuma entidade ou campo novo. A etapa usa `itensDia`, que existe desde a feature 001, e
`tarefas`, da feature 003.

## Item do dia (`itensDia`)

| Campo | Tipo | Regra |
|---|---|---|
| `id`, `criadoEm`, `atualizadoEm`, `arquivadoEm` | comuns | Arquivar = tirar do dia |
| `tarefaId` | tarefa | A mesma tarefa, nunca uma cópia (RN04) |
| `data` | AAAA-MM-DD | Data do plano, no fuso do usuário |
| `ordem` | inteiro ≥ 0 | Posição no dia. Regravada de 0 em diante ao reordenar |
| `resultado` | `pendente`, `feita`, `remarcada`, `devolvida`, `cancelada` | Começa `pendente`. Muda só quando a pendência recebe destino |

## Regras que valem sempre

1. Em cada data, uma tarefa tem no máximo um item ativo com resultado `pendente`.
2. A situação mostrada no dia (feita ou não) vem da tarefa.
3. Pendência: item ativo, `data < hoje`, `resultado = pendente`, tarefa ativa e `aberta`.
4. Decidir uma pendência muda todos os itens pendentes de dias anteriores daquela tarefa.
5. Remarcar nunca usa data anterior a hoje.

## Destinos da pendência

| Destino | Itens de dias anteriores | Tarefa | Novo item |
|---|---|---|---|
| Remarcar para D | `remarcada` | continua `aberta` | em D, no fim, se não houver |
| Devolver | `devolvida` | continua `aberta` | — |
| Cancelar | `cancelada` | `cancelada` | — |

Itens pendentes de dias anteriores cuja tarefa já foi concluída ou cancelada não são pendências.
