---
description: "Lista de tarefas da Etapa 7, parte 2 (rotina perdida, tempo livre e lembretes)"
---

# Tarefas: Rotina perdida, tempo livre e lembretes

**Entrada**: `specs/009-rotina-perdida-lembretes/`. **Testes**: Vitest em `__tests__/rotinaPerdida.test.ts`.
**Relação com `docs/tasks.md`**: cobre T024 a T026. Caminhos a partir de `system-onPath-web-front/`.

## Fase 1: Serviços

- [X] T001 Em `docs/plan.md`, registrar a janela padrão, a proposta da RN18 e a antecedência de 10 minutos.
- [X] T002 [P] Em `src/dados/contratos.ts`, criar `Preferencias`, `ServicoPreferencias`, `Intervalo`, `RotinaPerdida`, `TempoLivre` e os métodos novos de `ServicoAgenda`, com `preferencias` em `Servicos`.
- [X] T003 Escrever `__tests__/rotinaPerdida.test.ts` com os casos de `research.md`, item 5.
- [X] T004 Criar `src/dados/local/preferencias.ts` e os métodos em `src/dados/local/agenda.ts` até a T003 passar; ligar em `src/dados/local/servicos.ts`.
- [X] T005 [P] Em `src/dados/consultas.ts`, criar os hooks; em `src/i18n/pt-BR.ts`, os textos.

## Fase 2: Hoje (T024 e T025)

- [X] T006 Criar `src/features/hoje/RotinasPerdidas.tsx` (proposta, Aceitar, Recusar e Fiz) e `src/features/hoje/TempoLivre.tsx` (livre e aviso de dia cheio); ligar em `PlanoDoDia.tsx`.

## Fase 3: Ajustes e lembretes (T026)

- [X] T007 Criar `src/features/ajustes/Preferencias.tsx` (janela do dia e ativação com pedido de permissão) e ligar em `src/telas/Ajustes.tsx`.
- [X] T008 Criar `src/features/lembretes/Lembretes.tsx` e `avisados.ts`; montar em `src/components/Moldura.tsx`.

## Fase 4: Acabamento

- [ ] T009 `npm test`, `typecheck`, `lint`, `build`, greps; cenários no build de produção (porta 4173).
- [ ] T010 Marcar T024 a T026 em `docs/tasks.md` e os critérios atendidos das seções 6.4 e 6.9.
