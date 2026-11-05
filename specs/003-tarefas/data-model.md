# Modelo de dados: Tarefas

## Tarefa (`tarefas`)

| Campo | Tipo | Regra |
|---|---|---|
| `id`, `criadoEm`, `atualizadoEm`, `arquivadoEm` | comuns | Como nas demais entidades |
| `titulo` | texto | Obrigatório. Espaços nas pontas são removidos |
| `areaId` | área | Obrigatória. Vem do projeto ou da matéria, quando houver (RN01). Na subtarefa, vem da tarefa do topo |
| `projetoId` | projeto ou vazio | Não pode existir junto com `materiaId` (RN02) |
| `materiaId` | matéria ou vazio | Não pode existir junto com `projetoId` (RN02) |
| `colunaId` | coluna ou vazio | Sem uso nesta etapa (Kanban, Etapa 6) |
| `tarefaPaiId` | tarefa ou vazio | Preenchido nas subtarefas. Nunca forma ciclo |
| `prioridade` | `alta`, `media` ou `baixa` | Obrigatória (RN21). Na subtarefa, vem da tarefa do topo |
| `tempoEstimadoMin` | inteiro maior que zero ou vazio | Obrigatório na tarefa principal (RN24), opcional na subtarefa (RN33) |
| `prazo` | data (AAAA-MM-DD) ou vazio | Opcional |
| `status` | `aberta`, `concluida` ou `cancelada` | Começa em `aberta` |
| `concluidaEm` | data e hora ou vazio | Preenchida só quando `status = concluida` |
| `anotacoes` | texto ou vazio | **Novo.** Opcional |

Vínculo: com `projetoId`, a tarefa é de projeto; com `materiaId`, é de matéria; sem os dois, é
avulsa.

## Regras que valem sempre

1. Tarefa principal (`tarefaPaiId` vazio): `titulo`, `areaId`, `prioridade` e `tempoEstimadoMin`
   preenchidos.
2. `projetoId` e `materiaId` nunca juntos.
3. Com projeto ou matéria, `areaId` é a área dele.
4. Subtarefa: `areaId`, `prioridade`, `projetoId` e `materiaId` iguais aos da tarefa do topo.
5. Subindo por `tarefaPaiId`, nunca se volta à própria tarefa.
6. `concluidaEm` preenchida se, e somente se, `status = concluida`.
7. Uma subtarefa ativa nunca fica sob uma tarefa arquivada: arquivar e recuperar valem para a
   árvore inteira.

## Situações

```text
             concluir (com confirmação se houver subtarefas abertas)
   aberta  ─────────────────────────────────────────────▶  concluida
     │ ▲                                                      │
     │ └──────────────────────── reabrir ◀────────────────────┘
     │ ▲
     │ └── reabrir
     ▼
  cancelada
```

Arquivar (excluir) é independente da situação: qualquer tarefa pode ser arquivada e recuperada,
sempre com a árvore inteira.

## Item da caixa

A situação `processado` passa a ser usada: o item que virou tarefa fica com `status =
processado` e não aparece na caixa nem nos descartados. Não fica arquivado, porque não foi
excluído.

## Filtros

| Filtro | Valores |
|---|---|
| `areaId` | uma área |
| `projetoId` | um projeto, ou `avulsa` para tarefas sem projeto e sem matéria |
| `materiaId` | uma matéria |
| `prioridade` | `alta`, `media` ou `baixa` |
| `status` | `aberta` (padrão), `concluida`, `cancelada` ou `todas` |

Ordem: prioridade (alta, média, baixa), prazo mais próximo (sem prazo por último) e data de
criação.

## Mudança no `docs/plan.md`

Seção 6, linha `tarefas`: acrescentar `anotacoes?`. Seção 7, "Subtarefas": registrar que a
subtarefa também herda o vínculo e que confirmar a conclusão conclui as subtarefas abertas.
