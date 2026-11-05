---
description: "Lista de tarefas da Etapa 5 (Projetos)"
---

# Tarefas: Projetos

**Entrada**: documentos de `specs/006-projetos/`

**Pré-requisitos**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Testes**: o serviço de projetos tem testes Vitest em `__tests__/projetos.test.ts`
(`research.md`, item 8). As telas são validadas pelo `quickstart.md`.

**Relação com `docs/tasks.md`**: cobre T015 a T017, marcadas só na fase final.

## Formato: `[ID] [P?] [História] Descrição`

- **[P]**: pode rodar em paralelo. **[US1] a [US3]**: histórias do `spec.md`.
- Os caminhos partem de `system-onPath-web-front/`, salvo quando indicado.

---

## Fase 1: Base e regras (bloqueia as histórias)

- [ ] T001 [P] Em `src/dados/erros.ts`, acrescentar `grupo_cheio`, `sem_proxima_acao` e `transicao_invalida`, com mensagens em `erros.*` ("O grupo já está com todas as vagas ocupadas. Pause ou conclua outro projeto antes.", "Este projeto não tem uma próxima ação. Crie uma tarefa para ele antes de ativar.", "Esta mudança de status não é permitida.").
- [ ] T002 [P] Em `src/dados/contratos.ts`, criar `ProjetoNaVisao`, `GrupoNaVisao`, `AreaNaVisao`, `FiltrosProjetos` e `ServicoProjetos` como em `contracts/servico-projetos.md`; trocar o tipo de `projetos` em `Servicos`. Em `src/dados/tipos.ts`, exportar `StatusProjeto`.
- [ ] T003 [P] Criar `src/dados/regrasProjetos.ts` com `TRANSICOES` (tabela de `research.md`, item 3), `podeMudar(de, para)` e `tarefasAbertasDoProjeto(projetoId, tarefas)` (não arquivadas, `aberta`, com `projetoId`).
- [ ] T004 Escrever `__tests__/projetos.test.ts`: criar entra na fila no fim do grupo; nome vazio e repetido no grupo são recusados (repetido em outro grupo é aceito); ativar com vaga e tarefa aberta funciona; sem vaga dá `grupo_cheio` com os ocupantes e não grava; com limite zero e com grupo acima do limite também; sem tarefa aberta dá `sem_proxima_acao` (subtarefa aberta conta, tarefa arquivada ou concluída não); transições fora da tabela dão `transicao_invalida`; pausado → fila e concluído → fila põem no fim; `reordenarFila` regrava 0.. e recusa lista diferente; mudar de grupo propaga a área para as tarefas e subtarefas, desliga meta de outra área, põe no fim da fila do destino e, ativo, exige vaga no destino; `semProximaAcao`; `visaoGeral` agrupa por área e grupo, separa status, ordena a fila, mostra vagas e o aviso, e filtra por área e status. Devem falhar antes da T005.
- [ ] T005 Criar `src/dados/local/projetos.ts` com `criarServicoProjetos()`, mantendo a derivação da área pelo grupo, e usar em `src/dados/local/servicos.ts` (no lugar de `colecao("projetos", { completar: areaDoGrupo })`). Rodar `npm test` até a T004 passar.
- [ ] T006 [P] Em `src/dados/consultas.ts`, criar os hooks de `contracts/servico-projetos.md`. Em `src/i18n/pt-BR.ts`, criar `projetos.*` de `contracts/interface.md`.

**Ponto de controle**: `npm test` e `npm run typecheck` passam. A T015 do `docs/tasks.md` cumpre o
"Pronto quando".

---

## Fase 2: História 1, ver os projetos por grupo (P1) 🎯 MVP

- [ ] T007 [P] [US1] Criar `src/features/projetos/FormularioProjeto.tsx` (nome, grupo, prioridade, prazo, meta da área do grupo e descrição; `react-hook-form` + Zod; erros do serviço por campo) e `src/features/projetos/FiltrosProjetos.tsx` (área e status no endereço).
- [ ] T008 [P] [US1] Criar `src/features/projetos/LinhaProjeto.tsx`: nome (link para `/projetos/{id}`), prioridade, prazo e "Sem próxima ação"; e `src/features/projetos/CartaoGrupo.tsx`: nome, vagas, "Acima do limite", "Editar grupo" (`FormularioGrupo` da Etapa 4), ativos, fila ordenável com `dnd-kit` e teclado (`useReordenarFila`), pausados e encerrados recolhidos.
- [ ] T009 [US1] Em `src/telas/Projetos.tsx`, mostrar `useVisaoProjetos(filtros)` por área com os `CartaoGrupo`, os filtros e "Novo projeto" num `Dialog` com o `FormularioProjeto`.

**Ponto de controle**: cenário 1 do `quickstart.md` passa.

---

## Fase 3: História 2, ativar com as regras (P1)

- [ ] T010 [P] [US2] Criar `src/features/projetos/GrupoCheio.tsx` (diálogo com os ocupantes e os botões Pausar e Concluir; ao escolher, muda o status do ocupante e tenta ativar de novo) e `src/features/projetos/ProximaAcao.tsx` (diálogo com título, prioridade e tempo; "Criar e ativar" cria a tarefa com `projetoId` e tenta ativar de novo).
- [ ] T011 [US2] Criar `src/features/projetos/AcoesStatus.tsx`: os botões das transições permitidas pelo status atual (`TRANSICOES`), com os erros `grupo_cheio` e `sem_proxima_acao` abrindo os diálogos. Usar em `LinhaProjeto.tsx`.
- [ ] T012 [US2] Em `src/features/tarefas/acoes.ts`, depois de concluir uma tarefa com `projetoId`, consultar `projetos.semProximaAcao` e, se verdadeiro, avisar "{projeto} ficou sem próxima ação" com a ação "Abrir projeto".

**Ponto de controle**: cenários 1 e 2 passam. A T016 cumpre o "Pronto quando".

---

## Fase 4: História 3, detalhe do projeto (P2)

- [ ] T013 [US3] Criar `src/telas/Projeto.tsx` na rota lazy `/projetos/:id` (em `src/rotas.tsx`): cabeçalho com nome, status e `AcoesStatus`; `FormularioProjeto` para editar; Excluir com Desfazer; projeto inexistente mostra a página de não encontrada.
- [ ] T014 [US3] No detalhe, listar as tarefas do projeto com `ListaTarefas` e `useAcoesTarefas` (filtro de status) e "Nova tarefa" num `Dialog` com o `FormularioTarefa` já no projeto; abrir uma tarefa leva a `/tarefas?tarefa={id}`.

**Ponto de controle**: cenários 1 a 3 passam. A T017 cumpre o "Pronto quando".

---

## Fase 5: Acabamento

- [ ] T015 Rodar `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` e os greps do `quickstart.md`.
- [ ] T016 Rodar os cenários do `quickstart.md` no build de produção (porta 4173).
- [ ] T017 Marcar T015 a T017 em `docs/tasks.md` e, em `docs/spec.md`, os critérios da seção 6.6 e o primeiro da 6.7 ("Mostra dados, tarefas e Kanban" fica aberto até o Kanban).

---

## Dependências

Fase 1 → Fase 2 → (Fase 3 e Fase 4, que dependem da 2) → Fase 5. Um commit por fase.
