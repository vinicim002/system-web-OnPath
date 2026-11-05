# Modelo de dados: Áreas, metas e grupos

Nenhuma entidade ou campo novo. As coleções `areas`, `metas` e `grupos` existem desde a feature
001.

## Área (`areas`)

| Campo | Regra |
|---|---|
| `nome` | Obrigatório, sem espaços nas pontas, único entre as áreas ativas (sem diferenciar maiúsculas e acentos) |
| `cor` | Um dos cinzas 400 a 900 do tema |
| `ordem` | Posição; regravada de 0 em diante ao reordenar; criar ou recuperar põe no fim |
| `arquivadoEm` | Arquivar exige confirmação se houver itens ativos; a última área ativa não pode ser arquivada |

Itens ativos de uma área (para a confirmação): metas `ativa`, grupos ativos, projetos não
arquivados, tarefas `aberta` não arquivadas e matérias não arquivadas.

## Meta (`metas`)

| Campo | Regra |
|---|---|
| `areaId` | Área ativa (RN01) |
| `titulo` | Obrigatório, sem espaços nas pontas |
| `descricao` | Opcional |
| `prazo` | Opcional, AAAA-MM-DD |
| `status` | `ativa`, `concluida` ou `cancelada` |

Ordem: ativas primeiro; prazo mais próximo (sem prazo por último); criação. Atrasada: `ativa` e
`prazo < hoje`.

## Grupo (`grupos`)

| Campo | Regra |
|---|---|
| `areaId` | Área ativa (RN01) |
| `nome` | Obrigatório, único entre os grupos ativos da área |
| `limiteAtivos` | Inteiro ≥ 0 (RN06). Pode ficar abaixo dos ativos atuais |

Vagas: `ativos` = projetos não arquivados do grupo com `status = ativo`; `acimaDoLimite` =
`ativos > limiteAtivos`. Arquivar só sem projetos não arquivados.
