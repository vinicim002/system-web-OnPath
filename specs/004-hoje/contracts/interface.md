# Contrato: interface da tela Hoje

## Plano do dia (`/`)

```text
┌──────────────────────────────────────────────────────────────┐
│ Hoje                                                         │
│ quinta-feira, 5 de novembro          Planejado 3 h · Feito 45 min │
│ [+ Adicionar tarefas]                                        │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ PRÓXIMA                                                  │ │
│ │ ⠿ ○ Escrever capítulo 2        Alta · TCC · 2 h      ✕   │ │
│ └──────────────────────────────────────────────────────────┘ │
│   ⠿ ○ Renovar documento        Média · Avulsa · 30 min ✕     │
│   ⠿ ● Pagar boleto (riscada)   Média · Avulsa · 15 min ✕     │
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Comportamento |
|---|---|
| Cabeçalho | Data por extenso e resumo "Planejado {tempo} · Feito {tempo}" |
| Próxima | O item em destaque tem borda e o rótulo "Próxima" |
| Linha | Alça de arrastar (⠿, também pelo teclado), caixa de concluir, título (abre `/tarefas?tarefa=id`), prioridade, contexto, tempo e "Tirar do dia" (✕) |
| Adicionar | Diálogo com busca, caixas de marcar e "Adicionar ({n})" |
| Vazio | "Escolha o que fazer hoje" e o botão de adicionar |
| Dia concluído | "Tudo feito por hoje" acima da lista |

## Revisão de pendências

Substitui o plano enquanto houver pendências.

```text
│ Antes de começar o dia                                         │
│ 2 tarefas ficaram de dias anteriores. Escolha o destino de cada.│
│ [Remarcar todas para hoje]                                     │
│ Renovar documento · era de 4 de nov.                           │
│   [Hoje] [Outra data ▾] [Devolver à lista] [Cancelar tarefa]   │
```

| Ação | Comportamento |
|---|---|
| Hoje | Remarca para hoje |
| Outra data | Campo de data com mínimo hoje e "Remarcar" |
| Devolver à lista | Tira dos planos; a tarefa continua aberta |
| Cancelar tarefa | Cancela a tarefa |
| Remarcar todas para hoje | Remarca todas, na ordem |

Cada decisão mostra um aviso curto. Quando a última pendência é decidida, a tela mostra o plano do
dia.

## Menu lateral

Ao lado de "Hoje", o número de pendências sem destino, escondido quando é zero.

## Textos (`src/i18n/pt-BR.ts`)

Chaves novas em `hoje.*` (resumo, próxima, adicionar, busca, vazio, dia concluído, tirar do dia,
revisão, destinos e avisos), `menu.pendencias` e erros `erros.data_passada` e
`erros.nao_e_pendencia`.
