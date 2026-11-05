---
description: "Lista de tarefas das visões e do painel de tarefas da Agenda"
---

# Tarefas: Visões e painel de tarefas da Agenda

**Entrada**: `specs/010-agenda-visoes/`. **Testes**: Vitest em `__tests__/agendaVisoes.test.ts`.
**Relação com `docs/tasks.md`**: cobre T026a e T026b. Caminhos a partir de `system-onPath-web-front/`.

## Fase 1: Base

- [X] T001 Atualizar `docs/spec.md` (seção 6.9), `docs/plan.md` ("Visões e painel da Agenda") e `docs/tasks.md` (T026a e T026b).
- [X] T002 Escrever `__tests__/agendaVisoes.test.ts` e criar `src/features/agenda/visoes.ts` (`filtrarItens`, `ordenarItens`, `agruparPorPrazo`, `horaDoSoltar`, `intervaloDaTarefa`, leitura e escrita do filtro no endereço) até passar; textos em `src/i18n/pt-BR.ts`.

## Fase 2: Visões e filtro (T026a)

- [ ] T003 Criar `BarraAgenda.tsx` e `FiltroAgenda.tsx`; ligar o filtro e a visão em `src/telas/Agenda.tsx`.
- [ ] T004 Criar `VisaoLista.tsx` e `VisaoTabela.tsx`.
- [ ] T005 Criar `VisaoTimeline.tsx` e `VisaoBoard.tsx` (mover para outro dia com RN09).

## Fase 3: Painel de tarefas (T026b)

- [ ] T006 Criar `PainelTarefas.tsx` (abas, grupos, concluir, Agendar, recolher) e ligar o soltar na `GradeSemana.tsx`; `CriarNaAgenda.tsx` aceita a tarefa e abre na aba Bloco.

## Fase 4: Acabamento

- [ ] T007 `npm test`, `typecheck`, `lint`, `build`, greps; cenários no build de produção (porta 4173).
- [ ] T008 Marcar T026a e T026b em `docs/tasks.md` e os critérios da seção 6.9.
