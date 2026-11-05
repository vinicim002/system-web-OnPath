---
description: "Lista de tarefas da Etapa 3 (Hoje)"
---

# Tarefas: Hoje

**Entrada**: documentos de `specs/004-hoje/`

**Pré-requisitos**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Testes**: o serviço de itens do dia tem testes Vitest em `__tests__/itensDia.test.ts`
(`research.md`, item 10). As telas são validadas pelo `quickstart.md`.

**Relação com `docs/tasks.md`**: cobre as tarefas T011 e T012, marcadas só na fase final.

## Formato: `[ID] [P?] [História] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente).
- **[US1] a [US3]**: as histórias 1 a 3 do `spec.md`.
- Os caminhos partem de `system-onPath-web-front/`, salvo quando indicado.

---

## Fase 1: Preparação

- [X] T001 Instalar `@dnd-kit/core`, `@dnd-kit/sortable` e `@dnd-kit/utilities` em `package.json`.

---

## Fase 2: Base (bloqueia as histórias)

- [X] T002 [P] Em `src/dados/erros.ts`, acrescentar `data_passada` e `nao_e_pendencia`, com mensagens em `erros.*` de `src/i18n/pt-BR.ts` ("Escolha hoje ou uma data futura." e "Esta tarefa já tem destino. Atualize a página para ver a revisão de novo.").
- [X] T003 [P] Em `src/dados/contratos.ts`, criar `ItemDoPlano`, `PlanoDoDia`, `Pendencia`, `Destino` e `ServicoItensDia`, exatamente como em `contracts/servico-itens-dia.md`, e trocar o tipo de `itensDia` em `Servicos`.
- [X] T004 [P] Em `src/i18n/datas.ts`, acrescentar `dataPorExtenso(data)` ("quinta-feira, 5 de novembro"), `somarDias(data, n)` (AAAA-MM-DD) e `milissegundosAteAmanha(agora)` no fuso `America/Sao_Paulo`. Em `src/i18n/pt-BR.ts`, criar `hoje.*` de `contracts/interface.md` (planejado, feito, próxima, adicionar, buscar, adicionar ({quantidade}), vazio, dia concluído, tirar do dia, arrastar, revisão: título, descrição com {quantidade}, era de {data}, hoje, outra data, remarcar, devolver, cancelar, remarcar todas, avisos de cada destino) e `menu.pendencias`.
- [X] T005 [P] Criar `src/features/hoje/useHoje.ts`: devolve `hoje()` e o recalcula em `visibilitychange`, `focus` e com um `setTimeout` de `milissegundosAteAmanha`.

**Ponto de controle**: `npm run typecheck` passa depois da Fase 3 (o contrato novo só compila com o serviço).

---

## Fase 3: História 1, montar o plano do dia (P1) 🎯 MVP

**Teste independente**: `quickstart.md`, cenário 1.

- [X] T006 [US1] Escrever em `__tests__/itensDia.test.ts`: `adicionar` cria itens no fim, com `ordem` crescente e `resultado = pendente`; ignora tarefas que já estão no dia; recusa tarefa inexistente, arquivada ou não aberta com `dados_invalidos` (`tarefaId`) sem gravar nada; `planoDoDia` traz os itens na ordem, com a tarefa e `tituloPrincipal` para subtarefas, e `proximaId` no primeiro item com tarefa aberta; `excluir` arquiva o item e não muda a tarefa; adicionar de novo após tirar cria outro item; `reordenar` regrava `ordem` de 0 em diante e recusa uma lista diferente dos itens do dia; itens de outras datas não aparecem. Os testes devem falhar antes da T007.
- [X] T007 [US1] Criar `src/dados/local/itensDia.ts` com `criarServicoItensDia()`, sobre `criarServicoColecao("itensDia", …)`, implementando `planoDoDia`, `adicionar`, `excluir` e `reordenar` (com `gravarVarios`). Regra 1 do `data-model.md`: "Em cada data, uma tarefa tem no máximo um item ativo com resultado `pendente`." Em `src/dados/local/servicos.ts`, usar o serviço novo. Rodar `npm test` até a T006 passar.
- [X] T008 [P] [US1] Em `src/dados/consultas.ts`, criar `usePlanoDoDia(data)`, `useAdicionarAoDia`, `useTirarDoDia` e `useReordenarDia`, invalidando `["itensDia"]`. Fazer as escritas de tarefas (`useEscritaTarefas`) e `useOpcoesTarefa` invalidarem também `["itensDia"]`.
- [X] T009 [P] [US1] Criar `src/features/hoje/AdicionarAoDia.tsx`: `Dialog` com campo de busca pelo título e a lista de tarefas abertas que não estão no dia (`useTarefas()` menos as do plano), com `Checkbox`; "Adicionar ({n})" chama `useAdicionarAoDia` e fecha.
- [X] T010 [P] [US1] Criar `src/features/hoje/ItemDoDia.tsx` com `useSortable` (`@dnd-kit/sortable`): alça de arrastar com `aria-label` `hoje.arrastar`, título que leva a `/tarefas?tarefa={id}`, prioridade, contexto (vínculo e, se houver, `tituloPrincipal`), tempo com `duracao` e botão "Tirar do dia". Quando é a próxima, borda `border-preto` e o rótulo "Próxima".
- [X] T011 [US1] Criar `src/features/hoje/PlanoDoDia.tsx`: `DndContext` com `PointerSensor` e `KeyboardSensor` (`sortableKeyboardCoordinates`), `SortableContext` vertical e, ao soltar, `arrayMove` + `useReordenarDia`. Cabeçalho com `dataPorExtenso`, o botão de adicionar e a mensagem de dia vazio.
- [X] T012 [US1] Em `src/telas/Hoje.tsx`, usar `useHoje()` e mostrar o `PlanoDoDia` dentro de `TelaBase`.

**Ponto de controle**: cenário 1 do `quickstart.md` passa.

---

## Fase 4: História 2, fazer as tarefas do dia (P1)

**Teste independente**: `quickstart.md`, cenário 2.

- [ ] T013 [US2] Acrescentar em `__tests__/itensDia.test.ts`: tarefa concluída continua no plano e não é a próxima; tarefa cancelada ou arquivada sai do plano; `planejadoMin` soma os tempos (vazio conta zero) e `feitoMin` soma os das concluídas; com tudo concluído, `proximaId` é `null`. Ajustar `src/dados/local/itensDia.ts` até passar.
- [ ] T014 [US2] Em `src/features/hoje/ItemDoDia.tsx`, acrescentar a caixa de concluir/reabrir com `useAcoesTarefas` (recebido da tela) e o título riscado quando a tarefa está concluída. Em `src/features/hoje/PlanoDoDia.tsx`, mostrar "Planejado {tempo} · Feito {tempo}" e a mensagem "Tudo feito por hoje". Em `src/telas/Hoje.tsx`, criar `useAcoesTarefas()` e renderizar `ConfirmarSubtarefas`.

**Ponto de controle**: cenários 1 e 2 do `quickstart.md` passam. A T011 do `docs/tasks.md` cumpre
o "Pronto quando".

---

## Fase 5: História 3, pendências (P2)

**Teste independente**: `quickstart.md`, cenário 3.

- [ ] T015 [US3] Acrescentar em `__tests__/itensDia.test.ts`: `listarPendencias` traz só itens de antes de `hoje`, pendentes, com tarefa aberta e ativa, uma vez por tarefa com a data mais recente; tarefas concluídas ou canceladas não são pendências; `decidirPendencia` com `remarcar` para hoje marca os itens antigos como `remarcada` e cria o item no fim de hoje (sem repetir se já estiver lá); com data futura cria nessa data; com data passada dá `data_passada` sem gravar; `devolver` marca `devolvida` e não muda a tarefa; `cancelar` marca `cancelada` e cancela a tarefa na mesma escrita; tarefa sem pendência dá `nao_e_pendencia`; `remarcarTodasPara(hoje)` remarca todas na ordem em que estavam. Implementar em `src/dados/local/itensDia.ts` até passar.
- [ ] T016 [P] [US3] Em `src/dados/consultas.ts`, criar `usePendencias(hoje)`, `useDecidirPendencia` (invalida `["itensDia"]` e `["tarefas"]`) e `useRemarcarTodas`.
- [ ] T017 [US3] Criar `src/features/hoje/RevisaoPendencias.tsx`: título, descrição com a quantidade, "Remarcar todas para hoje" e, para cada pendência, título, contexto, "era de {data}" e os botões Hoje, Outra data (campo `type="date"` com `min` = hoje e "Remarcar"), Devolver à lista e Cancelar tarefa, cada um com aviso curto.
- [ ] T018 [US3] Em `src/telas/Hoje.tsx`, mostrar `RevisaoPendencias` no lugar do plano enquanto `usePendencias(hoje)` tiver itens. Em `src/components/MenuLateral.tsx`, mostrar ao lado de "Hoje" a quantidade de pendências, escondida quando é zero, com `aria-label` `menu.pendencias`.

**Ponto de controle**: cenários 1 a 3 do `quickstart.md` passam. A T012 do `docs/tasks.md` cumpre
o "Pronto quando".

---

## Fase 6: Acabamento

- [ ] T019 Rodar `npm test`, `npm run typecheck`, `npm run lint` e `npm run build`, e os greps do cenário 4 do `quickstart.md`.
- [ ] T020 Rodar no navegador os cenários 1 a 3 do `quickstart.md` no build de produção (porta 4173), sem tocar nos dados da porta 5173.
- [ ] T021 Marcar T011 e T012 em `docs/tasks.md` (a partir de `system-web-onPath/`) e, na seção 6.4 de `docs/spec.md`, os critérios "É a tela inicial depois do login", "Lista as tarefas do dia na ordem escolhida, com a próxima em destaque (RN20)", "O usuário adiciona, remove e reordena tarefas" e "Ao abrir no dia seguinte, pergunta o destino de cada tarefa pendente…". Os demais ficam para as T025 e T048.

---

## Dependências e ordem

- **Fase 1** primeiro; **Fase 2** em seguida (as tarefas dela são paralelas).
- **História 1** depende da Fase 2. **História 2** depende da história 1 (linha e plano).
  **História 3** depende da história 1 (serviço e tela).
- **Fase 6** por último.

## Execução em paralelo

```text
Fase 2:  T002 | T003 | T004 | T005
US1:     T006 (teste) → T007;  T008 | T009 | T010 em paralelo  → T011 → T012
US2:     T013 → T014
US3:     T015 → T016 → T017 → T018
```

## Estratégia

1. **MVP**: fases 1 a 3. O dia já pode ser montado e ordenado.
2. **Incremento 2**: a história 2. Concluir no dia, com resumo de tempo.
3. **Incremento 3**: a história 3. Nenhuma pendência fica sem destino.
4. Um commit por fase. As Fases 2 e 3 vão juntas, porque o contrato só compila com o serviço.
