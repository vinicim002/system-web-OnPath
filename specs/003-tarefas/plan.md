# Plano de implementação: Tarefas

**Branch**: `main` (sem branch própria) | **Data**: 2026-11-05 | **Especificação**: [spec.md](spec.md)

**Entrada**: especificação em `specs/003-tarefas/spec.md`

## Resumo

Um serviço próprio de tarefas aplica as regras da RN02, RN21, RN24, RN30 e RN33: valida a tarefa
principal, deriva a área do projeto ou da matéria, propaga a herança para as subtarefas, bloqueia
ciclos, conclui com confirmação quando há subtarefas abertas e arquiva a árvore inteira. A tela
Tarefas mostra a lista com filtros no endereço e um painel lateral ao lado da lista, com um
formulário único (`react-hook-form` e Zod) que também serve para converter itens da caixa. A
conversão grava a tarefa e o item da caixa na mesma escrita.

## Contexto técnico

**Linguagem/versão**: TypeScript em modo estrito.

**Dependências principais**: as das features 001 e 002, mais:

| Dependência | Uso |
|---|---|
| `react-hook-form` e `@hookform/resolvers` | Formulário da tarefa, com validação Zod (`research.md`, item 9) |
| Componentes `select` e `checkbox` do shadcn/ui | Filtros, campos de seleção e concluir na lista |

**Armazenamento**: `localStorage`, coleções `tarefas` e `itensCaixa`. O campo `anotacoes` é novo
e opcional, sem migração (`research.md`, item 1).

**Testes**: Vitest para o serviço de tarefas (`__tests__/tarefas.test.ts`). Telas pelo
`quickstart.md`.

**Plataforma-alvo**: navegadores atuais de computador, em `http://localhost:5173`.

**Tipo de projeto**: app web de página única, só front-end.

**Metas de desempenho**: com 500 tarefas, filtrar e concluir em menos de 100 ms (SC-006).

**Restrições**: sem API, banco ou login real (princípio III); regras só nos serviços (IV); textos
em `src/i18n/pt-BR.ts` (I); cores do tema (V).

**Escala/escopo**: 1 usuário, centenas de tarefas, 1 tela com painel e 1 diálogo na Caixa.

## Verificação da constituição

*Gate antes da Fase 0, verificado de novo depois da Fase 1.*

| Princípio | Como o plano cumpre | Situação |
|---|---|---|
| I. Português e textos separados | Rótulos, filtros, erros por campo e avisos em `tarefas.*` e `erros.*` | ✅ |
| II. `docs/` como fonte oficial | O campo `anotacoes` e a herança do vínculo entram no `docs/plan.md` antes do código (ver "Mudanças em `docs/`") | ✅ |
| III. Front-end primeiro | Só front-end, com dados locais | ✅ |
| IV. Serviços tipados | Todas as regras no `ServicoTarefas`. O formulário valida para dar retorno rápido, mas a regra final é do serviço | ✅ |
| V. Visual da seção 7 | Prioridades e status indicados por texto e ícones em cinza, sem cores | ✅ |

**Depois da Fase 1**: o design mantém todos os itens. Não há violação, por isso a seção de
complexidade foi removida.

## Mudanças em `docs/`

- `docs/plan.md`, seção 6: `tarefas` ganha `anotacoes?`.
- `docs/plan.md`, seção 7, "Subtarefas": a subtarefa também herda o vínculo, e confirmar a
  conclusão conclui as subtarefas abertas.
- `docs/tasks.md`: T007 a T010 marcadas só ao fim desta feature.

## Estrutura do projeto

### Documentação

```text
specs/003-tarefas/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── servico-tarefas.md
│   └── interface.md
├── checklists/requirements.md
└── tasks.md              # Criado pelo /speckit-tasks
```

### Código (`system-onPath-web-front/`)

```text
src/
├── dados/
│   ├── tipos.ts              # + anotacoes em tarefas
│   ├── erros.ts              # + ciclo_subtarefa, subtarefas_abertas, item_indisponivel
│   ├── contratos.ts          # + ServicoTarefas e FiltrosTarefas
│   ├── regrasTarefas.ts      # Novo: filtrar, ordenar, montar a árvore e atrasada (funções puras)
│   ├── consultas.ts          # + hooks de tarefas
│   └── local/
│       ├── colecao.ts        # + gravarVarios
│       ├── tarefas.ts        # Novo: implementação local do serviço de tarefas
│       └── servicos.ts       # tarefas passa a usar tarefas.ts
├── features/
│   ├── tarefas/              # Novo
│   │   ├── FormularioTarefa.tsx  # Criar, editar e converter (react-hook-form + Zod)
│   │   ├── FiltrosTarefas.tsx    # Seleções ligadas ao endereço
│   │   ├── ListaTarefas.tsx      # Linhas e árvore expansível
│   │   ├── LinhaTarefa.tsx       # Uma linha (memorizada)
│   │   ├── PainelTarefa.tsx      # Painel lateral: formulário, subtarefas e ações
│   │   ├── ArvoreSubtarefas.tsx  # Subtarefas em vários níveis
│   │   ├── MoverTarefa.tsx       # Escolher nova tarefa principal
│   │   └── acoes.ts              # Ações da lista, criadas uma vez
│   └── caixa/
│       ├── ItemCaixa.tsx         # + "Virar tarefa"
│       └── VirarTarefa.tsx       # Novo: diálogo com o FormularioTarefa
├── components/ui/            # + select e checkbox (shadcn/ui)
├── telas/
│   └── Tarefas.tsx           # Lista + painel, filtros no endereço
└── i18n/
    ├── pt-BR.ts              # + tarefas.* e erros novos
    └── datas.ts              # + hoje() no fuso America/Sao_Paulo e formato de prazo
__tests__/
└── tarefas.test.ts           # Novo
```

**Decisão de estrutura**: segue as features 001 e 002. As regras puras de lista (filtrar,
ordenar, árvore e atrasada) ficam em `src/dados/regrasTarefas.ts`, para serem usadas pelo
serviço local e testadas sem a tela.
