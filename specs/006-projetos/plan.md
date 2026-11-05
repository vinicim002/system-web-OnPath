# Plano de implementação: Projetos

**Branch**: `main` (sem branch própria) | **Data**: 2026-11-05 | **Especificação**: [spec.md](spec.md)

## Resumo

Um serviço próprio de projetos aplica as regras: área sempre do grupo (com propagação para as
tarefas), status com transições, ativação que confere vaga (RN06/RN07) e próxima ação (RN08) no
mesmo passo que grava, fila por grupo com ordem manual (RN26) e o aviso de projeto sem próxima ação.
A tela Projetos mostra áreas, grupos com vagas, ativos, fila ordenável e pausados, com diálogos que
resolvem as recusas. O detalhe do projeto (`/projetos/:id`) mostra os dados e as tarefas.

## Contexto técnico

**Linguagem/versão**: TypeScript estrito. **Dependências**: as das features anteriores, nenhuma
nova. **Armazenamento**: `localStorage`, sem campos novos. **Testes**: Vitest
(`__tests__/projetos.test.ts`); telas pelo `quickstart.md`. **Plataforma**: navegadores de
computador, `http://localhost:5173`. **Desempenho**: reordenar a fila em menos de 100 ms; abrir o
detalhe em menos de 1 s. **Restrições**: princípios I a V. **Escala**: dezenas de projetos.

## Verificação da constituição

| Princípio | Como o plano cumpre | Situação |
|---|---|---|
| I. Português e textos separados | Textos em `projetos.*` | ✅ |
| II. `docs/` como fonte oficial | Sem mudança de modelo; a fila por grupo e as transições ficam registradas em `research.md` e no `docs/plan.md` ("Limite de projetos ativos") | ✅ |
| III. Front-end primeiro | Só front-end | ✅ |
| IV. Serviços tipados | Regras no `ServicoProjetos`; as recusas voltam como erros do serviço | ✅ |
| V. Visual da seção 7 | Status e avisos com texto e ícones em cinza | ✅ |

**Depois da Fase 1**: sem violações.

## Mudanças em `docs/`

- `docs/plan.md`, seção 7, "Limite de projetos ativos": registrar que a fila é por grupo e as
  transições de status.
- Ao fim, marcar T015 a T017 e os critérios atendidos das seções 6.6 e 6.7.

## Estrutura

```text
src/
├── dados/
│   ├── erros.ts              # + grupo_cheio, sem_proxima_acao, transicao_invalida
│   ├── contratos.ts          # + ServicoProjetos e tipos da visão
│   ├── regrasProjetos.ts     # Novo: transições e próxima ação (funções puras)
│   ├── consultas.ts          # + hooks de projetos
│   └── local/projetos.ts     # Novo; servicos.ts passa a usá-lo
├── features/
│   ├── projetos/             # Novo
│   │   ├── CartaoGrupo.tsx       # Vagas, ativos, fila ordenável, pausados, encerrados
│   │   ├── LinhaProjeto.tsx      # Nome, prioridade, aviso e ações de status
│   │   ├── AcoesStatus.tsx       # Botões de status + resolução das recusas
│   │   ├── GrupoCheio.tsx        # Diálogo da RN07
│   │   ├── ProximaAcao.tsx       # Diálogo da RN08
│   │   ├── FormularioProjeto.tsx # Criar e editar
│   │   └── FiltrosProjetos.tsx
│   └── tarefas/acoes.ts      # + aviso de projeto sem próxima ação
├── telas/
│   ├── Projetos.tsx
│   └── Projeto.tsx           # Novo: detalhe, rota /projetos/:id
└── i18n/pt-BR.ts             # + projetos.* e erros
__tests__/projetos.test.ts    # Novo
```
