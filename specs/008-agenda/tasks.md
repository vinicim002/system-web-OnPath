---
description: "Lista de tarefas da Etapa 7, parte 1 (Agenda, blocos e rotinas)"
---

# Tarefas: Agenda, blocos e rotinas

**Entrada**: `specs/008-agenda/`. **Testes**: Vitest em `__tests__/agenda.test.ts`.
**Relação com `docs/tasks.md`**: cobre T020 a T023. Caminhos a partir de `system-onPath-web-front/`.

## Fase 1: Serviços (T020 e T021)

- [X] T001 [P] Em `src/i18n/datas.ts`, criar `instanteLocal(data, hora)`, `dataLocal(iso)`, `horaLocal(iso)`, `minutosNoDia(iso)` e `inicioDaSemana(data)` (segunda-feira) no fuso `America/Sao_Paulo`.
- [X] T002 [P] Em `src/dados/erros.ts`, acrescentar `horario_ocupado` ("Este horário já está ocupado. Confirme para reservar mesmo assim."); em `src/dados/contratos.ts`, criar `Ocupante`, `ItemAgenda`, `ServicoAgenda` e `ServicoRotinas` como em `contracts/servicos.md`, com `agenda` em `Servicos` e `rotinas: ServicoRotinas`.
- [X] T003 Escrever `__tests__/agenda.test.ts` com os casos de `research.md`, item 5.
- [X] T004 Criar `src/dados/local/agenda.ts` e `src/dados/local/rotinas.ts` até a T003 passar; ligar em `src/dados/local/servicos.ts`.
- [X] T005 [P] Em `src/dados/consultas.ts`, criar os hooks; em `src/i18n/pt-BR.ts`, criar `agenda.*` e `rotinas.*`. Em `src/components/Moldura.tsx`, renovar os blocos ao abrir e quando `useHoje` mudar.

## Fase 2: Tela Rotinas (T022)

- [X] T006 Criar `src/features/rotinas/FormularioRotina.tsx` (nome, área, tipo, dias, hora e duração ou meta) e `src/telas/Rotinas.tsx` (duas seções, total do dia nas rotinas com meta, criar, editar, arquivar com Desfazer).

## Fase 3: Agenda (T023)

- [ ] T007 Criar `src/features/agenda/GradeSemana.tsx` (7 dias × 6h–24h, itens posicionados e divididos quando sobrepostos, hoje e linha da hora atual) e `src/telas/Agenda.tsx` (semana no endereço, anterior, próxima e Hoje).
- [ ] T008 Criar `src/features/agenda/CriarNaAgenda.tsx` (diálogo com abas Compromisso e Bloco, dia e hora preenchidos), `FormularioCompromisso.tsx`, `FormularioBloco.tsx` (tarefa aberta ou rotina com meta) e `ConfirmarConflito.tsx` (lista os ocupantes e grava com confirmação).
- [ ] T009 Criar `src/features/agenda/DetalheItem.tsx`: editar e arquivar compromisso (com Desfazer), marcar bloco como realizado e excluir bloco.

## Fase 4: Acabamento

- [ ] T010 `npm test`, `typecheck`, `lint`, `build`, greps; cenários no build de produção (porta 4173).
- [ ] T011 Marcar T020 a T023 em `docs/tasks.md` e os critérios atendidos das seções 6.8 e 6.9.
