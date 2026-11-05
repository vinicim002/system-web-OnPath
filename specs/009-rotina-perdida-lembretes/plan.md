# Plano de implementação: Rotina perdida, tempo livre e lembretes

**Branch**: `main` | **Data**: 2026-11-05 | **Especificação**: [spec.md](spec.md)

## Resumo

O serviço da agenda ganha a busca das rotinas perdidas de hoje com a proposta de novo horário
(RN18), o cálculo do tempo livre (RN10) e a lista de lembretes devidos. Um serviço novo de
preferências guarda a janela do dia e a ativação dos lembretes. Hoje mostra as perdidas e o aviso de
dia cheio; Ajustes, a janela e os lembretes; a moldura dispara os lembretes.

## Contexto técnico

TypeScript estrito; sem dependências novas; `Notification` do navegador; testes Vitest em
`__tests__/rotinaPerdida.test.ts`.

## Verificação da constituição

| Princípio | Como o plano cumpre | Situação |
|---|---|---|
| I | Textos em `hoje.*`, `ajustes.*` e `lembretes.*` | ✅ |
| II | `docs/plan.md` ganha a janela padrão, a proposta da RN18 e a antecedência antes do código | ✅ |
| III | Só front-end | ✅ |
| IV | Proposta, tempo livre e lembretes nos serviços | ✅ |
| V | Aviso em cinza e roxo | ✅ |

## Estrutura

```text
src/
├── dados/
│   ├── contratos.ts          # + Preferencias, RotinaPerdida, TempoLivre, métodos da agenda
│   ├── consultas.ts          # + hooks
│   └── local/
│       ├── agenda.ts         # + rotinasPerdidas, aceitar/recusarProposta, tempoLivre, lembretesDevidos
│       └── preferencias.ts   # Novo
├── features/
│   ├── hoje/RotinasPerdidas.tsx, TempoLivre.tsx
│   ├── ajustes/Preferencias.tsx
│   └── lembretes/Lembretes.tsx, avisados.ts
├── components/Moldura.tsx    # monta <Lembretes />
└── telas/Hoje.tsx, Ajustes.tsx
__tests__/rotinaPerdida.test.ts
```
