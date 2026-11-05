# Pesquisa: Projetos

Decisões da Fase 0. A base técnica vem das features 001 a 005.

## 1. Serviço próprio

- **Decisão**: `ServicoProjetos` estende o serviço comum de coleção (que já deriva a área do grupo,
  RN01) com: `visaoGeral` (áreas → grupos → projetos por status, com vagas e "sem próxima ação"),
  `criar` no fim da fila, `alterar` com nome único e propagação da área, `mudarStatus` com a
  tabela de transições, `reordenarFila` e `semProximaAcao`.
- **Motivo**: princípio IV. A ativação é a regra central do método e precisa valer em qualquer tela.

## 2. Ativar

- **Decisão**: `mudarStatus(id, "ativo")` confere, na mesma chamada síncrona que grava:
  1. vaga: `vagasDoGrupo` (Etapa 4) com `ativos < limiteAtivos`; senão, erro novo `grupo_cheio`
     com `ocupantes` (id e nome dos ativos do grupo);
  2. próxima ação: alguma tarefa não arquivada, `aberta`, com `projetoId` do projeto (subtarefas
     contam); senão, erro novo `sem_proxima_acao`.
- **Motivo**: o armazenamento local é síncrono, então ler, conferir e gravar acontecem sem
  intervalo (FR-005). Na Parte 2, a API faz o mesmo numa transação (`docs/plan.md`).
- **Abrir a vaga**: a tela pausa ou conclui o ocupante escolhido e tenta ativar de novo, em duas
  chamadas. Se a segunda falhar (outra aba ocupou a vaga), o erro aparece normalmente.
- **Criar a próxima ação**: a tela cria a tarefa (`tarefas.criar`, com `projetoId`) e tenta ativar
  de novo.

## 3. Transições

| De | Para |
|---|---|
| fila, pausado | ativo (com as verificações) |
| ativo | pausado |
| pausado | fila (fim da fila) |
| fila, ativo, pausado | concluido, cancelado |
| concluido, cancelado | fila (fim da fila) |

Outras dão o erro novo `transicao_invalida`. Mudar para o mesmo status não faz nada.

## 4. Fila

- **Decisão**: uma fila por grupo, com `posicaoFila`. Entrar na fila (criar, reabrir, voltar, mudar
  de grupo sem estar ativo) põe no fim: maior posição dos projetos `fila` do grupo + 1.
  `reordenarFila(grupoId, ids)` regrava 0, 1, 2… em uma escrita e recusa lista diferente da fila.
- **Interface**: `dnd-kit` com teclado, como no plano do dia e nas áreas.

## 5. Mudar de grupo

- **Decisão**: `alterar` com `grupoId` novo: se o projeto está ativo, o grupo de destino precisa ter
  vaga (`grupo_cheio`); senão, vai para o fim da fila do destino. A área nova é gravada no projeto e
  em todas as tarefas dele (inclusive subtarefas), e a meta é desligada se for de outra área, tudo
  em uma escrita com as duas coleções.

## 6. Aviso de próxima ação

- **Decisão**: as ações de tarefa (`useAcoesTarefas`) passam a consultar `projetos.semProximaAcao`
  depois de concluir uma tarefa de projeto. Se o projeto está ativo e sem tarefa aberta, aparece o
  aviso "{projeto} ficou sem próxima ação", com o atalho "Abrir projeto". Vale para Tarefas, Hoje e
  o detalhe do projeto.

## 7. Telas

- **Projetos (`/projetos`)**: por área, cada grupo em um cartão com as vagas, os ativos, a fila
  (ordenável) e os pausados; concluídos e cancelados recolhidos. Filtros de área e status no
  endereço. "Novo projeto" abre um diálogo. Editar grupo reaproveita `FormularioGrupo` da Etapa 4.
- **Detalhe (`/projetos/:id`)**: dados editáveis, status com as mesmas regras e a lista de tarefas
  do projeto (reaproveitando `ListaTarefas` e `useAcoesTarefas`). Abrir uma tarefa leva a
  `/tarefas?tarefa=id`. "Nova tarefa" abre um diálogo com o `FormularioTarefa` já no projeto.
- **Diálogos das recusas**: `GrupoCheio` (ocupantes com Pausar e Concluir) e `ProximaAcao` (título,
  prioridade e tempo), compartilhados pela tela e pelo detalhe.

## 8. Testes

- **Decisão**: testes Vitest do serviço: criar no fim da fila, nome único, transições, ativar com e
  sem vaga, com e sem próxima ação (subtarefa conta; arquivada não), limite zero, grupo acima do
  limite, reordenar, voltar à fila no fim, mudar de grupo (área das tarefas, meta, vaga), visão
  geral com vagas e aviso.
