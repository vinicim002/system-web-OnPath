---
description: "Lista de tarefas da Etapa 6 (Kanban)"
---

# Tarefas: Kanban

**Entrada**: documentos de `specs/007-kanban/`. **Testes**: Vitest em `__tests__/kanban.test.ts`.
**Relação com `docs/tasks.md`**: cobre T018 e T019. Caminhos a partir de `system-onPath-web-front/`.

## Fase 1: Colunas e conclusão (T018)

- [X] T001 [P] Em `src/dados/contratos.ts`, criar `ServicoColunas` e acrescentar `moverParaColuna` ao `ServicoTarefas`, como em `contracts/servicos.md`; trocar o tipo de `colunas` em `Servicos`.
- [X] T002 Escrever `__tests__/kanban.test.ts`: projeto novo sem colunas; criar no fim e não final; nome vazio ou repetido no projeto recusado; reordenar; `marcarFinal` deixa uma só; arquivar zera a coluna das tarefas e `recuperar` devolve; `concluir` leva à final; `reabrir` leva à primeira não final (ou `null`); sem coluna final, concluir não muda a coluna; `moverParaColuna` para a final conclui, com `subtarefas_abertas` quando há subtarefas abertas e sem gravar; de concluída para outra coluna reabre; recusa coluna de outro projeto, tarefa avulsa e subtarefa (`dados_invalidos`, `colunaId`); mudar o projeto da tarefa zera a coluna.
- [X] T003 Criar `src/dados/local/colunas.ts` e ajustar `src/dados/local/tarefas.ts` (concluir, reabrir, `moverParaColuna`, coluna zerada ao mudar projeto ou virar avulsa) até a T002 passar; usar o serviço novo em `src/dados/local/servicos.ts`.
- [X] T004 [P] Em `src/dados/consultas.ts`, criar os hooks de `contracts/servicos.md`; em `src/i18n/pt-BR.ts`, criar `kanban.*`.

## Fase 2: Kanban (T019)

- [ ] T005 [P] Criar `src/features/kanban/EditarColunas.tsx` (lista ordenável com `dnd-kit` e teclado, renomear no lugar, marcar final, arquivar com Desfazer, nova coluna).
- [ ] T006 [P] Criar `src/features/kanban/CartaoKanban.tsx` (`useDraggable`; título, prioridade, prazo, subtarefas abertas; clique abre `/tarefas?tarefa=id`) e `src/features/kanban/ColunaKanban.tsx` (`useDroppable`; nome, quantidade, "Final", "+ Tarefa" que cria a tarefa já na coluna).
- [ ] T007 Criar `src/features/kanban/QuadroKanban.tsx`: tarefas principais abertas e concluídas do projeto, "Sem coluna" quando preciso, `DndContext` com sensores de ponteiro e teclado, movimento otimista com `useMoverParaColuna`, confirmação de subtarefas (`ConfirmarSubtarefas`) e volta do cartão se recusar.
- [ ] T008 Em `src/telas/Projeto.tsx`, abas "Lista" e "Kanban" (no endereço, `?vista=kanban`).

## Fase 3: Acabamento

- [ ] T009 `npm test`, `typecheck`, `lint`, `build` e os greps.
- [ ] T010 Cenários do `quickstart.md` no build de produção (porta 4173).
- [ ] T011 Registrar o `dnd-kit` em `docs/plan.md` ("Kanban e fila"); marcar T018, T019 e os critérios da seção 6.7.
