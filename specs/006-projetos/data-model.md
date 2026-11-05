# Modelo de dados: Projetos

Nenhuma entidade ou campo novo. Usa `projetos`, `grupos`, `tarefas` e `metas`.

## Projeto (`projetos`)

| Campo | Regra |
|---|---|
| `grupoId` | Grupo ativo |
| `areaId` | Sempre a do grupo (RN01). Mudar de grupo muda a área do projeto e das tarefas dele |
| `metaId` | Opcional; meta não arquivada da mesma área |
| `nome` | Obrigatório, sem espaços nas pontas, único entre os não arquivados do grupo |
| `descricao`, `prazo` | Opcionais |
| `prioridade` | `alta`, `media` ou `baixa` |
| `status` | `fila`, `ativo`, `pausado`, `concluido` ou `cancelado` (RN05) |
| `posicaoFila` | Ordem na fila do grupo (RN26). Só tem sentido com `status = fila` |

## Regras que valem sempre

1. Ao ativar, `ativos do grupo < limiteAtivos` (RN06 e RN07).
2. Ao ativar, existe tarefa não arquivada, `aberta`, do projeto (RN08).
3. Entrar na fila põe no fim da fila do grupo.
4. Sem próxima ação: projeto `ativo` sem tarefa aberta (aviso, não bloqueia).

As transições permitidas estão em `research.md`, item 3.
