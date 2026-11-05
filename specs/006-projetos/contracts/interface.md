# Contrato: interface de projetos

## Tela Projetos (`/projetos`)

```text
Projetos                                        [+ Novo projeto]
[Área: Todas ▾] [Status: Todos ▾]

Trabalho
┌ Servioeste ─────────────────── 1 de 1 ativo  [Editar grupo] ┐
│ Ativos    RookMTR · Alta · Sem próxima ação        [Pausar ▾] │
│ Fila      ⠿ 1. App do Edu                          [Ativar]   │
│           ⠿ 2. App do Matheus                      [Ativar]   │
│ Pausados  —                                                   │
│ ▸ Concluídos e cancelados (0)                                 │
└───────────────────────────────────────────────────────────────┘
```

| Elemento | Comportamento |
|---|---|
| Cartão do grupo | Nome, vagas ("{ativos} de {limite} ativos" e "Acima do limite"), "Editar grupo" com o `FormularioGrupo` |
| Projeto | Nome (abre o detalhe), prioridade, prazo, "Sem próxima ação" quando for o caso, e ações de status permitidas |
| Fila | Ordenável por arrastar e teclado |
| Grupo cheio | Diálogo: "O grupo {grupo} está cheio" com cada ocupante e os botões Pausar e Concluir; ao escolher, ativa o pedido |
| Sem próxima ação | Diálogo: "Defina a próxima ação de {projeto}" com título, prioridade e tempo; "Criar e ativar" |
| Novo projeto | Diálogo: nome, grupo, prioridade, prazo, meta e descrição |

## Detalhe (`/projetos/:id`)

Cabeçalho com nome, status e ações de status; formulário dos dados; lista das tarefas do projeto
(as mesmas linhas da tela Tarefas, com filtro de status) e "Nova tarefa". Excluir com Desfazer.

## Textos

Chaves novas em `projetos.*` e erros `erros.grupo_cheio`, `erros.sem_proxima_acao` e
`erros.transicao_invalida`.
