# Especificação: Projetos

**Branch**: `main` (sem branch própria da funcionalidade)

**Criada em**: 2026-11-05

**Status**: Rascunho

**Entrada**: Etapa 5 do `docs/tasks.md` (T015 a T017): regras de projetos (RN01, RN05, RN06, RN07,
RN08 e RN26), tela Projetos com grupos, vagas e fila (seção 6.6 de `docs/spec.md`) e Detalhe do
projeto com dados e tarefas (parte da seção 6.7; o Kanban é a Etapa 6). Só front-end, com os dados
locais.

**Referências**: `docs/spec.md` (seção 3, RN01, RN05 a RN08, RN26, seções 5, 6.6 e 6.7),
`docs/plan.md` (seção 6 e "Limite de projetos ativos"), `docs/tasks.md` (T015 a T017),
`.specify/memory/constitution.md`, `specs/003-tarefas/` e `specs/005-areas-metas-grupos/`.

## Cenários de uso e testes *(obrigatório)*

### História 1: Ver os projetos por grupo, com vagas e fila (Prioridade: P1)

O usuário abre a tela Projetos e vê, para cada área, os grupos com os projetos separados por
status: ativos, na fila, pausados e, recolhidos, concluídos e cancelados. Cada grupo mostra as
vagas usadas e o limite. Ele cria projetos novos, que entram no fim da fila do grupo, e arruma a
ordem da fila arrastando.

**Por que esta prioridade**: é a visão principal da seção 6.6 e responde "no que estou trabalhando
e o que vem depois".

**Teste independente**: abrir a tela, conferir os grupos com os projetos dos dados iniciais e as
vagas; criar um projeto e conferir que entra no fim da fila; mudar a ordem da fila e recarregar.

**Cenários de aceite**:

1. **Dado** a tela Projetos, **quando** ela abre, **então** mostra as áreas com os grupos e, em cada
   grupo, "{ativos} de {limite} ativos" e os projetos separados por status (RN01, RN05 e RN06).
2. **Dado** um projeto ativo sem tarefa aberta, **quando** a tela o mostra, **então** ele aparece
   com o aviso "Sem próxima ação" (RN08).
3. **Dado** o formulário de projeto, **quando** o usuário cria um projeto com nome, grupo e
   prioridade, **então** ele entra na fila do grupo, no fim (RN26).
4. **Dado** a fila de um grupo, **quando** o usuário arrasta um projeto para outra posição (ou usa o
   teclado), **então** a nova ordem fica gravada (RN26).
5. **Dado** um projeto, **quando** o usuário filtra por área ou status, **então** só aparecem os
   grupos e projetos que atendem ao filtro.
6. **Dado** um grupo na tela, **quando** o usuário edita o nome ou o limite, **então** a mudança vale
   na hora, como na tela Áreas e metas.

---

### História 2: Ativar, pausar e concluir projetos com as regras (Prioridade: P1)

O usuário muda o status de um projeto. Ao ativar, o app confere se há vaga no grupo e se o projeto
tem uma próxima ação. Se o grupo estiver cheio, o app recusa e oferece pausar ou concluir um dos
ativos do grupo para abrir a vaga. Se faltar a próxima ação, o app pede para criar uma tarefa ali
mesmo e só então ativa.

**Por que esta prioridade**: é o critério de pronto da T015 ("ativar em um grupo cheio ou sem
próxima ação for recusado") e o coração do método: limitar o que está em andamento.

**Teste independente**: no grupo Servioeste (1 de 1 ativo), tentar ativar "App do Edu" e conferir
a recusa com a opção de pausar RookMTR; pausar e ativar; tentar ativar sem tarefa e conferir o
pedido de próxima ação.

**Cenários de aceite**:

1. **Dado** um projeto na fila ou pausado de um grupo com vaga e com tarefa aberta, **quando** o
   usuário o ativa, **então** ele fica ativo e sai da fila.
2. **Dado** um grupo cheio, **quando** o usuário tenta ativar um projeto dele, **então** o app
   recusa e lista os ativos do grupo com as opções de pausar ou concluir cada um (RN07).
3. **Dado** a recusa por grupo cheio, **quando** o usuário pausa ou conclui um dos ativos, **então** o
   projeto que ele queria ativar é ativado em seguida.
4. **Dado** um projeto sem tarefa aberta, **quando** o usuário tenta ativá-lo, **então** o app recusa
   e pede a próxima ação (RN08), com um campo para criar a tarefa no próprio pedido.
5. **Dado** o pedido de próxima ação, **quando** o usuário cria a tarefa, **então** o projeto é
   ativado em seguida.
6. **Dado** um projeto ativo, **quando** o usuário o pausa, **então** ele vira pausado e libera a
   vaga; ao concluir ou cancelar, também libera a vaga.
7. **Dado** um projeto concluído ou cancelado, **quando** o usuário o reabre, **então** ele volta para
   o fim da fila.
8. **Dado** um projeto pausado, **quando** o usuário o devolve à fila, **então** ele entra no fim da
   fila.
9. **Dado** um projeto ativo com uma só tarefa aberta, **quando** o usuário conclui essa tarefa em
   qualquer tela, **então** o app avisa que o projeto ficou sem próxima ação.

---

### História 3: Ver e editar um projeto com as tarefas dele (Prioridade: P2)

O usuário abre um projeto e vê os dados (nome, grupo, área, prioridade, prazo, meta, descrição e
status) e as tarefas dele. Ele edita os dados, cria tarefas já ligadas ao projeto e conclui
tarefas sem sair da página.

**Por que esta prioridade**: é o critério de pronto da T017 ("abrir um projeto mostrar suas
tarefas"). O Kanban, na mesma página, vem na Etapa 6.

**Teste independente**: abrir "TCC / RookHub", criar duas tarefas, concluir uma, mudar o prazo e a
descrição do projeto e conferir tudo depois de recarregar.

**Cenários de aceite**:

1. **Dado** um projeto na tela Projetos, **quando** o usuário clica nele, **então** abre o detalhe,
   com endereço próprio, mostrando os dados e as tarefas abertas.
2. **Dado** o detalhe, **quando** o usuário edita nome, prioridade, prazo, meta ou descrição e salva,
   **então** a mudança aparece na hora.
3. **Dado** o detalhe, **quando** o usuário muda o grupo do projeto para um grupo de outra área,
   **então** a área do projeto e de todas as tarefas dele passa a ser a do novo grupo (RN01).
4. **Dado** o detalhe, **quando** o usuário cria uma tarefa, **então** o formulário já vem com o
   projeto escolhido, e a tarefa aparece na lista do projeto.
5. **Dado** as tarefas do projeto, **quando** o usuário conclui, reabre ou abre uma, **então** valem
   as mesmas regras da tela Tarefas, e abrir leva ao painel da tarefa.
6. **Dado** o detalhe, **quando** o usuário muda o status, **então** valem as regras da história 2.
7. **Dado** um projeto, **quando** o usuário o exclui, **então** ele é arquivado com opção de desfazer
   (RN31), e as tarefas dele continuam existindo.

---

### Casos-limite

- **Projetos ativos sem tarefa nos dados iniciais**: os cinco ativos começam sem próxima ação e
  aparecem com o aviso, sem serem pausados.
- **Grupo acima do limite** (limite baixado na Etapa 4): nenhum projeto novo é ativado até sobrar
  vaga; os ativos continuam.
- **Limite zero**: nenhum projeto do grupo pode ser ativado.
- **Mover para outro grupo um projeto ativo**: só é permitido se o grupo de destino tiver vaga, e o
  projeto entra no fim da fila do destino quando não está ativo.
- **Meta de outra área**: a meta do projeto deve ser da mesma área do grupo; ao mudar de área, a meta
  é desligada.
- **Nome repetido**: dois projetos ativos não arquivados no mesmo grupo não podem ter o mesmo nome.
- **Subtarefas**: contam como próxima ação se estiverem abertas e forem do projeto.
- **Tarefa aberta arquivada**: não conta como próxima ação.
- **Armazenamento cheio ou indisponível**: nada é gravado pela metade, e o app informa o que
  aconteceu e o que fazer.

## Requisitos *(obrigatório)*

### Requisitos funcionais

**Regras (T015)**

- **FR-001**: Todo projeto DEVE pertencer a um grupo, e a área do projeto DEVE ser sempre a do grupo
  (RN01). Ao mudar de grupo, as tarefas do projeto DEVEM acompanhar a nova área.
- **FR-002**: Todo projeto DEVE estar em um status: fila, ativo, pausado, concluído ou cancelado
  (RN05).
- **FR-003**: Ativar um projeto DEVE ser recusado quando o grupo já tem tantos ativos quanto o limite
  (RN06 e RN07), informando quais projetos ocupam as vagas.
- **FR-004**: Ativar um projeto DEVE ser recusado quando ele não tem nenhuma tarefa aberta (RN08).
- **FR-005**: As duas verificações de ativação DEVEM usar os dados no momento da ativação e acontecer
  junto com a gravação, sem que outra mudança passe entre elas.
- **FR-006**: Cada grupo DEVE ter uma fila própria, com ordem definida pelo usuário (RN26). Projetos
  que entram na fila (novos, reabertos ou devolvidos) vão para o fim.
- **FR-007**: As mudanças de status permitidas DEVEM ser: fila ou pausado → ativo (com as
  verificações); ativo → pausado; pausado → fila; qualquer status não final → concluído ou
  cancelado; concluído ou cancelado → fila.
- **FR-008**: Um projeto DEVE ter nome (único entre os não arquivados do grupo), grupo e prioridade
  (alta, média ou baixa); prazo, meta e descrição são opcionais.

**Tela Projetos (T016)**

- **FR-009**: A tela DEVE mostrar os projetos agrupados por área e grupo, separados por status, com
  as vagas usadas e o limite de cada grupo.
- **FR-010**: Projetos ativos sem tarefa aberta DEVEM aparecer com o aviso "Sem próxima ação".
- **FR-011**: A fila de cada grupo DEVE poder ser reordenada arrastando e pelo teclado.
- **FR-012**: Ao recusar por grupo cheio, o app DEVE oferecer pausar ou concluir cada ativo do grupo
  e, feito isso, ativar o projeto pedido.
- **FR-013**: Ao recusar por falta de próxima ação, o app DEVE oferecer criar a tarefa ali mesmo
  (título, prioridade e tempo estimado; a área vem do projeto) e, criada, ativar o projeto.
- **FR-014**: O usuário DEVE poder editar o nome e o limite de cada grupo na tela.
- **FR-015**: A tela DEVE filtrar por área e por status.
- **FR-016**: Concluir a última tarefa aberta de um projeto ativo, em qualquer tela, DEVE mostrar o
  aviso de que falta uma próxima ação.

**Detalhe do projeto (T017)**

- **FR-017**: Cada projeto DEVE ter uma página própria, com endereço próprio, mostrando os dados e as
  tarefas dele.
- **FR-018**: O usuário DEVE poder editar os dados, mudar o status (com as regras) e excluir
  (arquivar, com desfazer) o projeto na página.
- **FR-019**: A página DEVE listar as tarefas do projeto, com as mesmas ações da tela Tarefas, e
  permitir criar uma tarefa já ligada ao projeto.

**Regras gerais**

- **FR-020**: Todas as regras DEVEM ficar na camada de serviços (princípio IV).
- **FR-021**: Todos os textos DEVEM vir do arquivo de textos em português (princípio I).
- **FR-022**: Todo erro DEVE informar o que aconteceu e o que fazer.

### Entidades principais

- **Projeto**: trabalho com prazo, prioridade, status e tarefas (seção 3). Tem nome, grupo (de onde
  vem a área), meta opcional, descrição, prazo, prioridade, status e posição na fila. Já existe.
- **Grupo**: dá a vaga e o limite (Etapa 4).
- **Tarefa**: a próxima ação do projeto é qualquer tarefa aberta dele (Etapa 2).

## Critérios de sucesso *(obrigatório)*

### Resultados mensuráveis

- **SC-001**: 100% das tentativas de ativar em grupo cheio ou sem tarefa aberta são recusadas, e
  nenhuma deixa o grupo com mais ativos que o limite.
- **SC-002**: A partir da recusa, o usuário abre a vaga (pausando outro projeto) e ativa o projeto
  pedido em menos de 15 segundos.
- **SC-003**: A nova ordem da fila aparece em menos de 100 ms e continua depois de recarregar.
- **SC-004**: Em 100% dos casos, as vagas mostradas batem com os projetos ativos gravados.
- **SC-005**: Abrir um projeto mostra as tarefas dele em menos de 1 segundo.
- **SC-006**: Depois de mudar um projeto de grupo, 100% das tarefas dele ficam na área do novo grupo.

## Premissas

- **Fila por grupo**: a RN26 fala da "ordem da fila"; como as vagas são por grupo, cada grupo tem a
  sua fila.
- **Kanban e colunas** (seção 6.7) são da Etapa 6. Nesta etapa, o detalhe mostra os dados e a lista
  de tarefas.
- **Excluir projeto** arquiva só o projeto; as tarefas continuam e mostram o projeto como arquivado.
- **Ativos dos dados iniciais sem tarefa** continuam ativos, com o aviso, até o usuário criar a
  próxima ação.
- **Prioridade "urgente"** dos dados iniciais (Zona Sul) já foi gravada como alta.
- **Usuário único** e dados no navegador, como nas features anteriores.
