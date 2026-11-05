# Especificação: Kanban

**Branch**: `main` (sem branch própria da funcionalidade)

**Criada em**: 2026-11-05

**Status**: Rascunho

**Entrada**: Etapa 6 do `docs/tasks.md` (T018 e T019): colunas por projeto com uma coluna final e
conclusão ligada a ela (RN22 e RN32), e o Kanban no Detalhe do projeto, arrastando tarefas entre
colunas, sem tarefas avulsas ou de matérias (RN29). Seção 6.7 de `docs/spec.md`. Só front-end.

**Referências**: `docs/spec.md` (RN04, RN22, RN29, RN32 e seção 6.7), `docs/plan.md` (seção 7,
"Conclusão de tarefas" e "Kanban e fila"), `docs/tasks.md` (T018 e T019),
`specs/003-tarefas/` e `specs/006-projetos/`.

## Cenários de uso e testes *(obrigatório)*

### História 1: Montar as colunas do projeto (Prioridade: P1)

No detalhe de um projeto, o usuário abre o Kanban. Um projeto novo não tem colunas (RN22). Ele
cria as colunas que quiser (por exemplo, "A fazer", "Fazendo", "Revisão" e "Feito"), renomeia,
muda a ordem, arquiva as que não usa e marca uma delas como a coluna final.

**Por que esta prioridade**: sem colunas não há Kanban, e a coluna final é o que liga o quadro à
conclusão das tarefas.

**Teste independente**: abrir um projeto sem colunas, criar quatro, renomear uma, mudar a ordem,
marcar "Feito" como final, arquivar uma e recarregar.

**Cenários de aceite**:

1. **Dado** um projeto novo, **quando** o usuário abre o Kanban, **então** não há colunas, e a tela
   convida a criar a primeira (RN22).
2. **Dado** o Kanban, **quando** o usuário cria uma coluna com nome, **então** ela aparece no fim.
3. **Dado** uma coluna, **quando** o usuário a renomeia ou muda a ordem (arrastando ou pelo
   teclado), **então** a mudança fica gravada.
4. **Dado** as colunas, **quando** o usuário marca uma como final, **então** só ela fica final; a
   que era final antes deixa de ser.
5. **Dado** uma coluna com tarefas, **quando** o usuário a arquiva, **então** as tarefas dela vão
   para "Sem coluna", e um aviso oferece desfazer (RN31).

---

### História 2: Arrastar tarefas entre colunas (Prioridade: P1)

O usuário vê as tarefas do projeto em cartões, nas colunas. Ele arrasta um cartão para outra
coluna. Se soltar na coluna final, a tarefa é concluída. Se tirar uma tarefa concluída da coluna
final, ela é reaberta. Tarefas avulsas ou de matérias nunca aparecem no Kanban.

**Por que esta prioridade**: é a T019 e o uso diário do Kanban.

**Teste independente**: com colunas e tarefas, arrastar um cartão para "Fazendo", depois para a
final (conferir que a tarefa está concluída em Tarefas e em Hoje) e de volta (conferir que foi
reaberta).

**Cenários de aceite**:

1. **Dado** o Kanban, **quando** a tela mostra os cartões, **então** cada tarefa principal do
   projeto aparece em uma coluna, ou em "Sem coluna" se ainda não tiver uma; subtarefas, tarefas
   avulsas e tarefas de matérias não aparecem (RN29).
2. **Dado** um cartão, **quando** o usuário o arrasta para outra coluna (ou usa o teclado), **então**
   a tarefa passa para essa coluna.
3. **Dado** um cartão de tarefa aberta, **quando** o usuário o solta na coluna final, **então** a
   tarefa é concluída (RN32), e todas as telas mostram a conclusão (RN04).
4. **Dado** um cartão de tarefa com subtarefas abertas, **quando** o usuário o solta na coluna final,
   **então** o app pede a mesma confirmação da tela Tarefas; se cancelar, o cartão volta.
5. **Dado** um cartão concluído na coluna final, **quando** o usuário o arrasta para outra coluna,
   **então** a tarefa é reaberta.
6. **Dado** cada cartão, **quando** a tela o mostra, **então** aparecem o título, a prioridade, o
   prazo e as subtarefas abertas; clicar abre a tarefa.
7. **Dado** o Kanban, **quando** o usuário cria uma tarefa numa coluna, **então** ela nasce no
   projeto e naquela coluna.

---

### História 3: Concluir por qualquer caminho (Prioridade: P1)

O usuário conclui ou reabre uma tarefa de projeto pela tela Tarefas, por Hoje ou pela lista do
projeto. O Kanban acompanha: a tarefa concluída vai para a coluna final, se existir; a reaberta sai
dela para a primeira coluna não final.

**Por que esta prioridade**: é o "Pronto quando" da T018 ("concluir por qualquer caminho atualizar
todas as telas").

**Teste independente**: concluir uma tarefa de projeto em Hoje e conferir que ela está na coluna
final; reabrir em Tarefas e conferir que voltou para a primeira coluna não final.

**Cenários de aceite**:

1. **Dado** um projeto com coluna final, **quando** o usuário conclui uma tarefa dele em qualquer
   tela, **então** ela passa para a coluna final (RN32).
2. **Dado** um projeto sem coluna final, **quando** o usuário conclui uma tarefa, **então** ela fica
   na coluna em que estava.
3. **Dado** uma tarefa na coluna final, **quando** o usuário a reabre em qualquer tela, **então** ela
   vai para a primeira coluna não final (ou para "Sem coluna", se não houver).
4. **Dado** uma tarefa com subtarefas, **quando** ela é concluída junto com as subtarefas, **então**
   só a tarefa principal muda de coluna; subtarefas não aparecem no Kanban.

---

### Casos-limite

- **Coluna com nome vazio ou repetido no projeto**: é recusada.
- **Arquivar a coluna final**: o projeto fica sem coluna final; as tarefas concluídas que estavam
  nela vão para "Sem coluna" e continuam concluídas.
- **Marcar como final uma coluna com tarefas abertas**: as tarefas abertas continuam abertas; a
  regra vale só para os próximos movimentos e conclusões.
- **Tarefa cancelada**: não aparece no Kanban.
- **Tarefa que muda de projeto ou vira avulsa**: perde a coluna.
- **Projeto concluído ou pausado**: o Kanban continua disponível.
- **Armazenamento cheio**: nada é gravado pela metade, e o app informa o que fazer.

## Requisitos *(obrigatório)*

### Requisitos funcionais

**Colunas (T018)**

- **FR-001**: Um projeto novo DEVE começar sem colunas (RN22).
- **FR-002**: O usuário DEVE poder criar, renomear, reordenar e arquivar colunas de um projeto.
- **FR-003**: Cada projeto DEVE ter no máximo uma coluna final; marcar outra como final desmarca a
  anterior.
- **FR-004**: Arquivar uma coluna DEVE deixar as tarefas dela sem coluna, com opção de desfazer
  (desfazer devolve a coluna, e as tarefas voltam para ela).
- **FR-005**: Os nomes das colunas DEVEM ser obrigatórios e únicos entre as colunas ativas do
  projeto.

**Conclusão e colunas (T018, RN32)**

- **FR-006**: Mover uma tarefa aberta para a coluna final DEVE concluí-la, com as regras de
  subtarefas abertas da Etapa 2.
- **FR-007**: Concluir uma tarefa de projeto por qualquer caminho DEVE movê-la para a coluna final,
  se existir.
- **FR-008**: Reabrir uma tarefa que está na coluna final, ou tirá-la de lá, DEVE reabri-la e
  levá-la para a primeira coluna não final (ou para nenhuma).
- **FR-009**: Uma tarefa só DEVE ter coluna se for tarefa principal de projeto; a coluna DEVE ser do
  mesmo projeto.

**Kanban (T019)**

- **FR-010**: O detalhe do projeto DEVE ter o Kanban, ao lado da lista de tarefas.
- **FR-011**: O Kanban DEVE mostrar só as tarefas principais, abertas ou concluídas, do projeto
  (RN29), uma coluna por coluna ativa, em ordem, mais "Sem coluna" quando houver tarefas sem coluna
  ou nenhuma coluna existir.
- **FR-012**: O usuário DEVE poder mover cartões arrastando e pelo teclado.
- **FR-013**: O usuário DEVE poder criar uma tarefa já numa coluna.
- **FR-014**: O código de arrastar DEVE ficar isolado em componentes próprios (`docs/plan.md`,
  "Kanban e fila").

**Regras gerais**

- **FR-015**: Regras na camada de serviços (princípio IV), textos no arquivo de textos (princípio
  I), e todo erro informa o que aconteceu e o que fazer.

### Entidades principais

- **Coluna**: etapa do Kanban de um projeto (seção 3), com nome, ordem e a marca de final. Já
  existe.
- **Tarefa**: ganha uso do campo de coluna, que já existe.

## Critérios de sucesso *(obrigatório)*

- **SC-001**: Em 100% dos casos, uma tarefa concluída por qualquer tela aparece na coluna final, e
  uma tarefa solta na coluna final aparece concluída em todas as telas.
- **SC-002**: Mover um cartão aparece na tela em menos de 100 ms.
- **SC-003**: O usuário monta um quadro com quatro colunas em menos de 1 minuto.
- **SC-004**: Nenhuma tarefa avulsa, de matéria ou subtarefa aparece no Kanban.
- **SC-005**: Nenhum projeto fica com duas colunas finais.

## Premissas

- **Ordem dentro da coluna**: os cartões seguem a ordem da lista de tarefas (prioridade, prazo e
  criação); a ordem manual dentro da coluna não faz parte desta etapa.
- **Tarefas novas** de projeto entram sem coluna, a não ser que sejam criadas numa coluna do Kanban.
- **Subtarefas** acompanham a tarefa principal e não têm coluna.
- **Usuário único** e dados no navegador.
