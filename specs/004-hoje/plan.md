# Plano de implementação: Hoje

**Branch**: `main` (sem branch própria) | **Data**: 2026-11-05 | **Especificação**: [spec.md](spec.md)

**Entrada**: especificação em `specs/004-hoje/spec.md`

## Resumo

Um serviço próprio de itens do dia monta o plano (itens com as tarefas, a próxima e os tempos),
adiciona sem repetir, tira do dia, reordena, lista as pendências de dias anteriores e grava o
destino de cada uma em uma única escrita. A situação "feita" vem da própria tarefa (RN04). A tela
Hoje, que já é a inicial, mostra o plano com arrastar e soltar (`dnd-kit`, também pelo teclado) ou,
enquanto houver pendências, a revisão no lugar do plano. A data de hoje é recalculada na virada
do dia.

## Contexto técnico

**Linguagem/versão**: TypeScript em modo estrito.

**Dependências principais**: as das features anteriores, mais:

| Dependência | Uso |
|---|---|
| `@dnd-kit/core`, `@dnd-kit/sortable` e `@dnd-kit/utilities` | Reordenar o dia arrastando e pelo teclado (`research.md`, item 6) |

**Armazenamento**: `localStorage`, coleções `itensDia` e `tarefas`. Sem campos novos.

**Testes**: Vitest para o serviço de itens do dia (`__tests__/itensDia.test.ts`). Telas pelo
`quickstart.md`.

**Plataforma-alvo**: navegadores atuais de computador, em `http://localhost:5173`.

**Tipo de projeto**: app web de página única, só front-end.

**Metas de desempenho**: reordenar e concluir aparecem em menos de 100 ms (SC-003).

**Restrições**: sem API (III); regras só nos serviços (IV); textos em `src/i18n/pt-BR.ts` (I);
cores do tema (V).

**Escala/escopo**: 1 usuário, dezenas de tarefas por dia, 1 tela com revisão e 1 diálogo.

## Verificação da constituição

*Gate antes da Fase 0, verificado de novo depois da Fase 1.*

| Princípio | Como o plano cumpre | Situação |
|---|---|---|
| I. Português e textos separados | Textos em `hoje.*`, data por extenso em português | ✅ |
| II. `docs/` como fonte oficial | Sem mudança de modelo. O `dnd-kit` já está previsto no `docs/plan.md` para a T011 | ✅ |
| III. Front-end primeiro | Só front-end, com dados locais | ✅ |
| IV. Serviços tipados | Plano, pendências e destinos no `ServicoItensDia` | ✅ |
| V. Visual da seção 7 | Destaque da próxima com borda e rótulo, sem cor | ✅ |

**Depois da Fase 1**: o design mantém todos os itens. Não há violação.

## Mudanças em `docs/`

Nenhuma antes do código. Ao fim, marcar T011 e T012 em `docs/tasks.md` e os critérios atendidos
da seção 6.4 de `docs/spec.md`.

## Estrutura do projeto

### Documentação

```text
specs/004-hoje/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── servico-itens-dia.md
│   └── interface.md
├── checklists/requirements.md
└── tasks.md              # Criado pelo /speckit-tasks
```

### Código (`system-onPath-web-front/`)

```text
src/
├── dados/
│   ├── erros.ts              # + data_passada e nao_e_pendencia
│   ├── contratos.ts          # + ServicoItensDia, PlanoDoDia, Pendencia, Destino
│   ├── consultas.ts          # + hooks do dia; escritas de tarefas invalidam ["itensDia"]
│   └── local/
│       ├── itensDia.ts       # Novo: implementação local
│       └── servicos.ts       # itensDia passa a usar itensDia.ts
├── features/
│   └── hoje/                 # Novo
│       ├── useHoje.ts            # Data de hoje, recalculada na virada do dia
│       ├── PlanoDoDia.tsx        # Lista ordenável (dnd-kit) e resumo
│       ├── ItemDoDia.tsx         # Uma linha ordenável
│       ├── AdicionarAoDia.tsx    # Diálogo com busca
│       └── RevisaoPendencias.tsx # Destinos das pendências
├── components/
│   └── MenuLateral.tsx       # + contador de pendências em Hoje
├── telas/
│   └── Hoje.tsx              # Revisão ou plano
└── i18n/
    ├── pt-BR.ts              # + hoje.* e erros novos
    └── datas.ts              # + data por extenso
__tests__/
└── itensDia.test.ts          # Novo
```

**Decisão de estrutura**: segue as features anteriores. A tela `src/telas/Hoje.tsx` só escolhe
entre a revisão e o plano.
