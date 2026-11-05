# Plano de implementação: Caixa de entrada

**Branch**: `main` (sem branch própria) | **Data**: 2026-11-05 | **Especificação**: [spec.md](spec.md)

**Entrada**: especificação em `specs/002-caixa-entrada/spec.md`

## Resumo

A tela Caixa de entrada passa a anotar ideias só com texto, listar os itens novos, descartar
com "Desfazer", recuperar descartados e editar o texto. Um campo rápido, aberto por Ctrl+K ou
pelo botão "Anotar" do menu, anota de qualquer tela. As regras ficam em um serviço próprio da
caixa, que estende o serviço comum de coleção da feature 001. Descartar grava a situação
`descartado` e o arquivamento na mesma escrita (`research.md`, item 1).

## Contexto técnico

**Linguagem/versão**: TypeScript em modo estrito (feature 001).

**Dependências principais**: as da feature 001 (React, Vite, React Router, TanStack Query, Zod,
Tailwind CSS e shadcn/ui), mais:

| Dependência | Uso |
|---|---|
| `sonner` (pelo shadcn/ui) | Avisos de descarte com "Desfazer", de captura e de erro |
| Componentes `dialog`, `textarea` e `tabs` do shadcn/ui | Campo rápido, campos de texto e abas Caixa/Descartados |

O `cmdk`, previsto no `docs/plan.md` para esta tarefa, não entra (`research.md`, item 4).

**Armazenamento**: `localStorage`, pela camada de dados da feature 001, na coleção `itensCaixa`
que já existe. Não há migração.

**Testes**: Vitest para o serviço da caixa (`__tests__/caixa.test.ts`). A tela é validada pelo
`quickstart.md`.

**Plataforma-alvo**: navegadores atuais de computador, em `http://localhost:5173`.

**Tipo de projeto**: app web de página única, só front-end.

**Metas de desempenho**: criar, descartar e recuperar aparecem na tela em menos de 100 ms
(SC-004). Com 500 itens, a tela abre e rola sem atraso perceptível (SC-005).

**Restrições**:

- Sem API, banco ou login (princípio III).
- A tela só usa os hooks de `src/dados/consultas.ts` (princípio IV).
- Textos em `src/i18n/pt-BR.ts` (princípio I).
- Só cores do tema (princípio V).

**Escala/escopo**: 1 usuário, centenas de itens na caixa, 1 tela e 1 campo rápido global.

## Verificação da constituição

*Gate antes da Fase 0, verificado de novo depois da Fase 1.*

| Princípio | Como o plano cumpre | Situação |
|---|---|---|
| I. Português e textos separados | Os documentos estão em português. Os textos novos ficam em `caixa.*` e `menu.anotar`, e as datas são formatadas em português | ✅ |
| II. `docs/` como fonte oficial | A troca do `cmdk` pelo diálogo do shadcn/ui é registrada no `docs/plan.md` antes do código (ver "Mudanças em `docs/`") | ✅ |
| III. Front-end primeiro | Só front-end, com os dados locais | ✅ |
| IV. Serviços tipados | Regras de captura, descarte e recuperação no `ServicoItensCaixa`. A tela usa só hooks | ✅ |
| V. Visual da seção 7 | Componentes do shadcn/ui com o tema da feature 001. Ícones em cinza | ✅ |

**Depois da Fase 1**: o design mantém todos os itens. Não há violação, por isso a seção de
complexidade foi removida.

## Mudanças em `docs/`

- `docs/plan.md`, seção 1: o `cmdk` deixa de ser previsto para a T006, e o `sonner` continua.
- `docs/tasks.md`: a T006 é marcada só ao fim desta feature.

## Estrutura do projeto

### Documentação (esta funcionalidade)

```text
specs/002-caixa-entrada/
├── spec.md
├── plan.md               # Este arquivo
├── research.md           # Decisões da Fase 0
├── data-model.md         # Item da caixa e suas situações
├── quickstart.md         # Roteiro de validação
├── contracts/
│   ├── servico-itens-caixa.md   # Contrato do serviço e dos hooks
│   └── interface.md             # Tela, menu, campo rápido e textos
├── checklists/
│   └── requirements.md
└── tasks.md              # Criado pelo /speckit-tasks
```

### Código (`system-onPath-web-front/`)

```text
src/
├── dados/
│   ├── contratos.ts          # + ServicoItensCaixa
│   ├── consultas.ts          # + hooks da caixa
│   └── local/
│       ├── caixa.ts          # Novo: implementação local do serviço da caixa
│       └── servicos.ts       # itensCaixa passa a usar caixa.ts
├── features/
│   └── caixa/                # Novo
│       ├── CampoAnotacao.tsx     # Área de texto com Enter e Shift+Enter, usada na tela e no campo rápido
│       ├── ListaCaixa.tsx        # Abas Caixa e Descartados
│       ├── ItemCaixa.tsx         # Um item: texto, tempo, editar e descartar
│       ├── ItemDescartado.tsx    # Um descartado: texto, data e recuperar
│       ├── CapturaRapida.tsx     # Diálogo do campo rápido
│       └── useAtalhoCaptura.ts   # Ctrl+K / ⌘K
├── components/
│   ├── Moldura.tsx           # + Toaster, campo rápido e atalho
│   ├── MenuLateral.tsx       # + botão Anotar e contador da Caixa
│   └── ui/                   # + dialog, textarea, tabs e sonner (shadcn/ui)
├── telas/
│   └── Caixa.tsx             # Usa CampoAnotacao e ListaCaixa
└── i18n/
    ├── pt-BR.ts              # + caixa.* e menu.anotar
    └── datas.ts              # Novo: tempo relativo e data do descarte
__tests__/
└── caixa.test.ts             # Novo: regras do serviço da caixa
```

**Decisão de estrutura**: segue a da feature 001. Os componentes da caixa ficam em
`src/features/caixa/`, como os de Ajustes ficam em `src/features/ajustes/`. A tela em
`src/telas/Caixa.tsx` só monta as peças.
