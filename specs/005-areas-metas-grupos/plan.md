# Plano de implementação: Áreas, metas e grupos

**Branch**: `main` (sem branch própria) | **Data**: 2026-11-05 | **Especificação**: [spec.md](spec.md)

**Entrada**: especificação em `specs/005-areas-metas-grupos/spec.md`

## Resumo

Três serviços próprios aplicam as regras: áreas com nome único, tom do tema, ordem, arquivamento
com confirmação quando há itens ativos e proteção da última área; metas por área na ordem da tela,
com atraso; e grupos com as vagas (ativos e limite) e arquivamento só sem projetos. A tela Áreas e
metas tem a lista de áreas ordenável à esquerda e a área escolhida à direita, com metas e grupos.

## Contexto técnico

**Linguagem/versão**: TypeScript em modo estrito.

**Dependências principais**: as das features anteriores (inclusive `dnd-kit`, `react-hook-form` e
os componentes do shadcn/ui). Nenhuma nova.

**Armazenamento**: `localStorage`, coleções `areas`, `metas`, `grupos`, contando `projetos`,
`tarefas` e `materias`. Sem campos novos.

**Testes**: Vitest para os três serviços (`__tests__/areas.test.ts`). Tela pelo `quickstart.md`.

**Plataforma-alvo**: navegadores atuais de computador, em `http://localhost:5173`.

**Tipo de projeto**: app web de página única, só front-end.

**Metas de desempenho**: reordenar e salvar aparecem em menos de 100 ms (SC-002 e SC-005).

**Restrições**: sem API (III); regras só nos serviços (IV); textos em `src/i18n/pt-BR.ts` (I);
tons do tema (V).

**Escala/escopo**: 1 usuário, poucas dezenas de áreas, metas e grupos.

## Verificação da constituição

*Gate antes da Fase 0, verificado de novo depois da Fase 1.*

| Princípio | Como o plano cumpre | Situação |
|---|---|---|
| I. Português e textos separados | Textos em `areas.*`, `metas.*` e `grupos.*` | ✅ |
| II. `docs/` como fonte oficial | Sem mudança de modelo nem de stack | ✅ |
| III. Front-end primeiro | Só front-end | ✅ |
| IV. Serviços tipados | Regras nos três serviços; confirmação de arquivar devolvida como erro do serviço | ✅ |
| V. Visual da seção 7 | Tons limitados aos cinzas do tema, mostrados como ícone da área | ✅ |

**Depois da Fase 1**: o design mantém todos os itens. Não há violação.

## Mudanças em `docs/`

Nenhuma antes do código. Ao fim, marcar T013 e T014 e os critérios da seção 6.5.

## Estrutura do projeto

### Documentação

```text
specs/005-areas-metas-grupos/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/servicos.md e contracts/interface.md
├── checklists/requirements.md
└── tasks.md              # Criado pelo /speckit-tasks
```

### Código (`system-onPath-web-front/`)

```text
src/
├── dados/
│   ├── erros.ts              # + nome_repetido, area_com_itens, ultima_area, grupo_com_projetos
│   ├── contratos.ts          # + ServicoAreas, ServicoMetas, ServicoGrupos e tipos de resumo
│   ├── regrasGrupos.ts       # Novo: vagasDoGrupo (usada também na Etapa 5)
│   ├── consultas.ts          # + hooks de áreas, metas e grupos
│   └── local/
│       ├── nomes.ts          # Novo: comparação de nomes sem acento e maiúsculas
│       ├── areas.ts          # Novo
│       ├── metas.ts          # Novo
│       ├── grupos.ts         # Novo
│       └── servicos.ts       # usa os três serviços novos
├── features/
│   └── areas/                # Novo
│       ├── ListaAreas.tsx        # Ordenável, com as arquivadas
│       ├── FormularioArea.tsx    # Nome e tom
│       ├── PainelArea.tsx        # Área escolhida: formulário, arquivar, metas e grupos
│       ├── MetasDaArea.tsx
│       ├── FormularioMeta.tsx
│       ├── GruposDaArea.tsx
│       └── FormularioGrupo.tsx
├── telas/Areas.tsx           # Duas colunas
├── theme/index.ts            # + TONS_AREA (cinzas 400 a 900)
└── i18n/pt-BR.ts             # + areas.*, metas.*, grupos.* e erros
__tests__/
└── areas.test.ts             # Novo
```
