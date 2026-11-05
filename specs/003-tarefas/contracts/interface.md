# Contrato: interface de tarefas

## Tela Tarefas (`/tarefas`)

```text
┌───────────────────────────────────────────────┬──────────────────────────────┐
│ Tarefas                          [+ Nova tarefa]│ Painel (com ?tarefa=id)   ✕ │
│ [Área ▾] [Projeto ▾] [Matéria ▾] [Prioridade ▾] │ Título ____________________ │
│ [Status: Abertas ▾]              Limpar filtros │ Vínculo (•) Projeto ( ) …   │
│ ─────────────────────────────────────────────── │ Área · Prioridade · Tempo   │
│ ○ ▸ Escrever capítulo 2   Alta · TCC · 2h · 10/11│ Prazo · Anotações           │
│ ○   Pagar boleto          Média · Pessoal · 15min│ Subtarefas                  │
│ ● ▾ Revisar slides        Baixa · Trabalho · 1h  │  ○ Ajustar gráfico          │
│     ○ Ajustar gráfico                            │    ○ Trocar cores           │
│                                                  │  [+ Subtarefa ______ ]      │
│                                                  │ [Concluir] [Cancelar] […]   │
└───────────────────────────────────────────────┴──────────────────────────────┘
```

| Elemento | Comportamento |
|---|---|
| Filtros | Seleções de área, projeto (inclui "Avulsas"), matéria, prioridade e status (Abertas, Concluídas, Canceladas, Todas). Ficam no endereço. "Limpar filtros" volta a Abertas |
| Linha | Botão de concluir/reabrir (círculo), seta para expandir subtarefas, título, prioridade, área, vínculo, tempo e prazo. Atrasada: prazo marcado como "Atrasada". Clique abre o painel |
| Nova tarefa | Abre o painel com o formulário vazio |
| Lista vazia | Mensagem com o filtro atual e o botão de nova tarefa |

## Painel de detalhes

| Elemento | Comportamento |
|---|---|
| Formulário | Título, vínculo (Projeto, Matéria ou Avulsa) com a seleção correspondente, área (travada quando vem do projeto ou matéria), prioridade, tempo estimado (minutos), prazo e anotações. Erros embaixo de cada campo, com os textos de `tarefas.erros.*` |
| Subtarefa | Os campos herdados aparecem só para leitura, com a dica "Herdado de {tarefa}" |
| Subtarefas | Árvore com concluir, abrir (troca o painel para a subtarefa) e campo "+ Subtarefa" (Enter cria) em cada nível |
| Ações | Concluir/Reabrir, Cancelar, Mover para… (escolher outra tarefa principal ou o topo) e Excluir (aviso com Desfazer) |
| Confirmação | Concluir com subtarefas abertas abre um `AlertDialog`: "Concluir também {n} subtarefas abertas?" |
| Fechar | Botão ✕ ou Esc. Remove `tarefa` do endereço |

## Caixa de entrada

| Elemento | Comportamento |
|---|---|
| Ação "Virar tarefa" | Novo botão em cada item novo (ícone `ListChecks`), ao lado de editar e descartar |
| Diálogo | `Dialog` com o `FormularioTarefa`, título preenchido com a primeira linha e anotações com o texto inteiro. Salvar cria a tarefa e tira o item da caixa |
| Aviso | "Item virou tarefa", com a ação "Ver tarefa", que abre `/tarefas?tarefa={id}` |

## Textos (`src/i18n/pt-BR.ts`)

Chaves novas em `tarefas.*` (rótulos, filtros, status, prioridades, ações, avisos, confirmação,
dicas de herança, lista vazia e `tarefas.erros.*` por campo) e em `caixa.virarTarefa` e
`caixa.avisos.virouTarefa`. Erros novos em `erros.ciclo_subtarefa`, `erros.subtarefas_abertas` e
`erros.item_indisponivel`.
