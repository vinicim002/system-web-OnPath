# Plano de implementação: Visões e painel de tarefas da Agenda

**Branch**: `main` | **Data**: 2026-11-05 | **Especificação**: [spec.md](spec.md)

## Resumo

A Agenda ganha um seletor de visões (Semana, Board, Timeline, Lista e Tabela), um filtro comum e um
painel de tarefas recolhível com as abas Tarefas e Eventos. Arrastar uma tarefa para a grade cria um
bloco; arrastar no Board muda o dia. Sem mudança de dados nem de serviços.

## Contexto técnico

TypeScript estrito; `dnd-kit` já instalado; testes Vitest em `__tests__/agendaVisoes.test.ts`.

## Verificação da constituição

| Princípio | Como o plano cumpre | Situação |
|---|---|---|
| I | Textos em `agenda.visoes.*`, `agenda.filtro.*` e `agenda.painel.*` | ✅ |
| II | `docs/spec.md`, `docs/plan.md` e `docs/tasks.md` atualizados antes do código | ✅ |
| III | Só front-end | ✅ |
| IV | Gravações pelos serviços da agenda e das tarefas; filtros e grupos são apresentação | ✅ |
| V | Cinzas, preto e roxo, como a grade | ✅ |

## Estrutura

```text
src/features/agenda/
├── visoes.ts            # filtro, ordenação, grupos por prazo, hora do soltar
├── BarraAgenda.tsx      # semana, seletor de visões e filtro
├── FiltroAgenda.tsx
├── VisaoBoard.tsx, VisaoTimeline.tsx, VisaoLista.tsx, VisaoTabela.tsx
├── PainelTarefas.tsx    # abas Tarefas e Eventos, recolhível
└── GradeSemana.tsx      # colunas viram alvos de soltar
src/telas/Agenda.tsx
__tests__/agendaVisoes.test.ts
```
