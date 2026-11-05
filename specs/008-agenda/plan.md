# Plano de implementação: Agenda, blocos e rotinas

**Branch**: `main` | **Data**: 2026-11-05 | **Especificação**: [spec.md](spec.md)

## Resumo

Um serviço de agenda trata blocos e compromissos juntos, com a regra de conflito (RN09) e a
confirmação. Um serviço de rotinas gera os blocos das rotinas com horário nos próximos 14 dias, sem
duplicar, refaz só os blocos futuros planejados ao alterar ou arquivar, e soma o dia das rotinas com
meta (RN28). A tela Rotinas lista e edita as rotinas; a Agenda é uma grade semanal feita com CSS
grid, com criação por clique, confirmação de conflito e ações nos itens.

## Contexto técnico

TypeScript estrito; sem dependências novas; `localStorage` sem campos novos; testes Vitest em
`__tests__/agenda.test.ts`; meta: semana com dezenas de itens em menos de 1 s.

## Verificação da constituição

| Princípio | Como o plano cumpre | Situação |
|---|---|---|
| I | Textos em `agenda.*` e `rotinas.*`; datas em português | ✅ |
| II | Sem mudança de modelo; segue "Rotinas e blocos" e "Conflitos de horário" do `docs/plan.md` | ✅ |
| III | Só front-end | ✅ |
| IV | Conflito, geração e soma nos serviços | ✅ |
| V | Blocos em cinza; a área aparece pelo tom (ícone) | ✅ |

## Estrutura

```text
src/
├── dados/
│   ├── erros.ts              # + horario_ocupado
│   ├── contratos.ts          # + ServicoAgenda, ServicoRotinas, ItemAgenda, Ocupante
│   ├── consultas.ts          # + hooks
│   └── local/
│       ├── agenda.ts         # Novo
│       ├── rotinas.ts        # Novo
│       └── servicos.ts
├── features/
│   ├── agenda/               # GradeSemana, ItemNaGrade, CriarNaAgenda, DetalheItem, ConfirmarConflito, FormularioCompromisso, FormularioBloco
│   └── rotinas/              # FormularioRotina, ListaRotinas
├── components/Moldura.tsx    # renova os blocos ao abrir e na virada do dia
├── telas/Agenda.tsx, Rotinas.tsx
└── i18n/datas.ts             # instanteLocal, dataLocal, horaLocal, inicioDaSemana
__tests__/agenda.test.ts
```
