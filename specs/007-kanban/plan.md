# Plano de implementação: Kanban

**Branch**: `main` (sem branch própria) | **Data**: 2026-11-05 | **Especificação**: [spec.md](spec.md)

## Resumo

Um serviço de colunas (criar, renomear, ordenar, uma só final, arquivar com as tarefas e
desfazer) e três ajustes no serviço de tarefas: `concluir` leva à coluna final, `reabrir` tira dela,
e `moverParaColuna` conclui ou reabre conforme a coluna (RN32). O Kanban fica no detalhe do
projeto, em abas "Lista" e "Kanban", com `dnd-kit` isolado em `src/features/kanban/`.

## Contexto técnico

TypeScript estrito; sem dependências novas (`dnd-kit` já instalado); `localStorage` sem campos
novos; testes Vitest em `__tests__/kanban.test.ts`; meta: mover um cartão em menos de 100 ms.

## Verificação da constituição

| Princípio | Como o plano cumpre | Situação |
|---|---|---|
| I | Textos em `kanban.*` | ✅ |
| II | A biblioteca de arrastar, deixada como **Proposta** no `docs/plan.md` ("Kanban e fila"), é decidida aqui (`dnd-kit`) e registrada lá | ✅ |
| III | Só front-end | ✅ |
| IV | Regras de coluna e conclusão nos serviços | ✅ |
| V | Coluna final marcada com texto e borda, sem cor | ✅ |

## Mudanças em `docs/`

- `docs/plan.md`, "Kanban e fila": registrar a escolha do `dnd-kit` e os componentes isolados.
- Ao fim, marcar T018 e T019 e os critérios da seção 6.7.

## Estrutura

```text
src/
├── dados/
│   ├── contratos.ts          # + ServicoColunas; ServicoTarefas.moverParaColuna
│   ├── consultas.ts          # + hooks de colunas e de mover
│   └── local/
│       ├── colunas.ts        # Novo
│       ├── tarefas.ts        # concluir/reabrir com coluna; moverParaColuna; coluna zerada ao mudar projeto
│       └── servicos.ts
├── features/kanban/          # Novo, isolado (docs/plan.md)
│   ├── QuadroKanban.tsx      # DndContext, colunas, otimista, confirmação
│   ├── ColunaKanban.tsx      # useDroppable, cabeçalho, "+ Tarefa"
│   ├── CartaoKanban.tsx      # useDraggable
│   └── EditarColunas.tsx     # Lista ordenável, renomear, final, arquivar, nova coluna
├── telas/Projeto.tsx         # Abas Lista e Kanban
└── i18n/pt-BR.ts             # + kanban.*
__tests__/kanban.test.ts      # Novo
```
