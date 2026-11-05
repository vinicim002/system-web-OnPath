# Especificação: Tarefas

**Branch**: `main` (sem branch própria da funcionalidade)

**Criada em**: 2026-11-05

**Status**: Rascunho

**Entrada**: Etapa 2 do `docs/tasks.md` (T007 a T010): regras de tarefas na camada de dados
(RN02, RN21 e RN24), subtarefas em vários níveis, com herança e bloqueio de ciclos (RN30 e
RN33), tela de Tarefas com lista, filtros e painel lateral de detalhes (seção 6.3 de
`docs/spec.md`), e conversão de um item da caixa em tarefa (seção 6.2). Só front-end, com os
dados locais.

**Referências**: `docs/spec.md` (seção 3, RN01, RN02, RN04, RN21, RN24, RN29 a RN33, seções 6.2
e 6.3), `docs/plan.md` (seções 6 e 7: "Conclusão de tarefas" e "Subtarefas"), `docs/tasks.md`
(T007 a T010), `.specify/memory/constitution.md`, `specs/001-base-front-end/` e
`specs/002-caixa-entrada/`.

## Cenários de uso e testes *(obrigatório)*

### História 1: Criar uma tarefa válida (Prioridade: P1)

O usuário abre a tela Tarefas e cria uma tarefa. Ele informa o título, a área, a prioridade e o
tempo estimado, e escolhe se ela pertence a um projeto, a uma matéria ou à lista de avulsas. O
prazo é opcional. Se faltar algum campo obrigatório, o app diz qual é e não cria a tarefa.

**Por que esta prioridade**: é o critério de pronto da T007 ("uma tarefa inválida for recusada
com erro claro") e a base de todas as telas seguintes (Hoje, Kanban e Agenda).

**Teste independente**: criar uma tarefa completa e conferir que ela aparece na lista; tentar
criar sem título, sem área, sem prioridade ou sem tempo estimado e conferir que cada caso é
recusado com uma mensagem que aponta o campo.

**Cenários de aceite**:

1. **Dado** que o usuário preencheu título, área, prioridade e tempo estimado, **quando** salva,
   **então** a tarefa aparece na lista como aberta.
2. **Dado** que falta título, área, prioridade ou tempo estimado, **quando** o usuário salva,
   **então** nada é criado e cada campo que falta mostra o que preencher (RN24).
3. **Dado** o campo de prioridade, **quando** o usuário escolhe, **então** só existem as opções
   alta, média e baixa (RN21).
4. **Dado** que o usuário liga a tarefa a um projeto, **quando** salva, **então** a área da
   tarefa é a área do projeto, sem poder escolher outra.
5. **Dado** que o usuário liga a tarefa a uma matéria, **quando** salva, **então** a área da
   tarefa é a área da matéria, sem poder escolher outra.
6. **Dado** que o usuário não liga a tarefa a projeto nem matéria, **quando** salva, **então** ela
   fica na lista de avulsas, com a área escolhida (RN02).

---

### História 2: Ver, filtrar e concluir as tarefas (Prioridade: P2)

O usuário vê todas as tarefas em uma lista e filtra por área, projeto, matéria, prioridade e
status. Ele marca uma tarefa como feita na própria lista. Ao clicar em uma tarefa, os detalhes
abrem em um painel lateral, sem sair da tela, onde ele edita qualquer campo.

**Por que esta prioridade**: cumpre os critérios da seção 6.3 e é onde o usuário passa a decidir o
que fazer.

**Teste independente**: com várias tarefas criadas, aplicar cada filtro e conferir o resultado;
concluir uma tarefa e conferir que ela sai das abertas; abrir o painel, mudar o título e
conferir a mudança na lista.

**Cenários de aceite**:

1. **Dado** tarefas de várias áreas, projetos, prioridades e status, **quando** o usuário aplica
   um ou mais filtros, **então** só aparecem as tarefas que atendem a todos eles.
2. **Dado** que a tela abre, **quando** nenhum filtro foi escolhido, **então** a lista mostra as
   tarefas abertas.
3. **Dado** uma tarefa aberta, **quando** o usuário a marca como feita, **então** ela fica
   concluída, com a data da conclusão, e sai da lista de abertas (RN32).
4. **Dado** uma tarefa concluída, **quando** o usuário a reabre, **então** ela volta a ficar
   aberta, sem data de conclusão.
5. **Dado** uma tarefa na lista, **quando** o usuário clica nela, **então** o painel lateral abre
   com todos os campos, e a lista continua visível.
6. **Dado** o painel aberto, **quando** o usuário altera um campo e confirma, **então** a lista
   mostra a mudança na hora; as mesmas regras da criação valem na edição.
7. **Dado** uma tarefa, **quando** o usuário a exclui, **então** ela é arquivada, sai da lista, e
   um aviso oferece desfazer (RN31).
8. **Dado** uma tarefa aberta, **quando** o usuário a cancela, **então** ela fica com o status
   cancelada e sai da lista de abertas.

---

### História 3: Dividir uma tarefa em subtarefas (Prioridade: P2)

No painel de uma tarefa, o usuário cria subtarefas só com o título. Cada subtarefa pode ter as
próprias subtarefas, em quantos níveis ele quiser. As subtarefas seguem a área, a prioridade e o
vínculo (projeto, matéria ou avulsa) da tarefa principal. O usuário também pode mover uma
subtarefa para outra tarefa principal, mas o app não deixa uma tarefa ficar dentro dela mesma.

**Por que esta prioridade**: é o critério de pronto da T008 ("uma subtarefa herdar área e
prioridade") e permite quebrar trabalhos grandes em passos pequenos.

**Teste independente**: criar uma tarefa, adicionar uma subtarefa só com o título, adicionar uma
subtarefa à subtarefa, mudar a prioridade da principal e conferir que todas acompanham; tentar
mover a principal para dentro da própria subtarefa e conferir a recusa.

**Cenários de aceite**:

1. **Dado** uma tarefa, **quando** o usuário adiciona uma subtarefa só com o título, **então** ela
   é criada com a área, a prioridade e o vínculo da tarefa principal (RN33).
2. **Dado** uma subtarefa, **quando** o usuário adiciona uma subtarefa a ela, **então** ela é
   criada no nível de baixo, sem limite de níveis (RN30).
3. **Dado** uma tarefa com subtarefas, **quando** o usuário muda a área, a prioridade ou o
   vínculo da tarefa principal, **então** todas as subtarefas, em todos os níveis, acompanham.
4. **Dado** uma subtarefa, **quando** o usuário tenta mudar a área, a prioridade ou o vínculo
   dela, **então** esses campos aparecem como herdados e não podem ser alterados.
5. **Dado** uma tarefa A com uma subtarefa B, **quando** o usuário tenta mover A para dentro de B
   (ou de qualquer descendente de A), **então** a mudança é recusada com uma mensagem clara, e
   nada muda.
6. **Dado** uma tarefa com subtarefas abertas, **quando** o usuário a marca como feita, **então** o
   app pede confirmação; ao confirmar, a tarefa e as subtarefas abertas são concluídas juntas, e
   ao cancelar nada muda.
7. **Dado** uma subtarefa, **quando** o usuário informa um tempo estimado, **então** ele é aceito,
   mas não é obrigatório.
8. **Dado** uma tarefa com subtarefas, **quando** o usuário a exclui, **então** a tarefa e todas as
   subtarefas são arquivadas juntas, e desfazer devolve todas.

---

### História 4: Transformar um item da caixa em tarefa (Prioridade: P3)

Na Caixa de entrada, o usuário escolhe "Virar tarefa" em um item. O formulário da tarefa abre com
o texto do item no título. Ele completa os campos obrigatórios e salva. A tarefa é criada, e o
item sai da caixa.

**Por que esta prioridade**: é o critério de pronto da T010 e liga a captura (Etapa 1) à
organização. Depende das histórias 1 e 2.

**Teste independente**: anotar um item na caixa, transformá-lo em tarefa, conferir que a tarefa
existe com o texto do item e que o item não está mais na caixa nem nos descartados.

**Cenários de aceite**:

1. **Dado** um item na caixa, **quando** o usuário escolhe "Virar tarefa", **então** o formulário
   da tarefa abre sem sair da Caixa, com o texto do item no título.
2. **Dado** o formulário aberto a partir de um item, **quando** faltam campos da RN24 e o usuário
   salva, **então** nada é criado e o item continua na caixa.
3. **Dado** o formulário completo, **quando** o usuário salva, **então** a tarefa é criada, o item
   sai da caixa e um aviso confirma, com um atalho para ver a tarefa.
4. **Dado** o formulário aberto a partir de um item, **quando** o usuário cancela, **então** nada
   muda: o item continua na caixa.
5. **Dado** um texto de item com várias linhas, **quando** vira tarefa, **então** a primeira linha
   vai para o título, e o texto inteiro fica guardado nas anotações da tarefa.

---

### Casos-limite

- **Projeto ou matéria arquivados**: não aparecem como opção ao criar ou ligar uma tarefa. As
  tarefas que já estavam ligadas a eles continuam visíveis na lista.
- **Sem matérias cadastradas**: a opção de ligar a uma matéria aparece desativada, com uma dica de
  que as matérias chegam na tela Estudos.
- **Título com espaços nas pontas ou vazio**: os espaços são removidos, e título vazio é
  recusado.
- **Tempo estimado**: aceita só números inteiros de minutos maiores que zero.
- **Prazo no passado**: é aceito, porque o usuário pode estar registrando algo atrasado, e a
  tarefa aparece como atrasada.
- **Mudar o vínculo de uma tarefa com subtarefas**: as subtarefas acompanham a nova área e o novo
  vínculo.
- **Mover uma subtarefa para virar tarefa principal**: é permitido; a partir daí, ela passa a
  exigir os campos da RN24, e o app pede o tempo estimado se faltar.
- **Reabrir uma subtarefa de uma tarefa concluída**: a tarefa principal continua concluída.
- **Item da caixa já descartado**: não pode virar tarefa sem antes ser recuperado.
- **Armazenamento cheio ou indisponível**: nada é gravado pela metade, e o app informa o que
  aconteceu e o que fazer, sem perder o que foi digitado.
- **Muitas tarefas**: com centenas de tarefas e subtarefas, filtrar e concluir continuam sem
  atraso perceptível.

## Requisitos *(obrigatório)*

### Requisitos funcionais

**Regras da tarefa (T007)**

- **FR-001**: Uma tarefa principal DEVE ter título, área, prioridade e tempo estimado. Faltando
  qualquer um, ela é recusada com um erro que indica cada campo faltante (RN24).
- **FR-002**: A prioridade DEVE ser alta, média ou baixa (RN21).
- **FR-003**: Uma tarefa DEVE pertencer a um projeto, a uma matéria ou à lista de avulsas, e
  nunca a um projeto e a uma matéria ao mesmo tempo (RN02).
- **FR-004**: Quando ligada a um projeto ou a uma matéria, a área da tarefa DEVE ser a área dele
  (RN01). Mudar o projeto ou a matéria muda a área.
- **FR-005**: O status DEVE ser aberta, concluída ou cancelada. Concluir grava a data da
  conclusão, e reabrir a apaga.
- **FR-006**: O prazo é opcional e, quando informado, é uma data. O tempo estimado é um número
  inteiro de minutos maior que zero.
- **FR-007**: A tarefa DEVE poder guardar anotações em texto livre, opcionais.
- **FR-008**: Excluir DEVE arquivar a tarefa, que pode ser recuperada (RN31).

**Subtarefas (T008)**

- **FR-009**: Uma subtarefa DEVE exigir só o título (RN33).
- **FR-010**: Uma subtarefa DEVE ter sempre a área, a prioridade e o vínculo (projeto, matéria ou
  avulsa) da tarefa principal do topo. Mudar esses campos na tarefa principal DEVE atualizar
  todas as subtarefas, em todos os níveis.
- **FR-011**: As subtarefas DEVEM aceitar vários níveis, sem limite (RN30).
- **FR-012**: Mover uma tarefa para dentro dela mesma ou de uma descendente DEVE ser recusado com
  um erro claro, sem alterar nada.
- **FR-013**: Concluir uma tarefa com subtarefas abertas DEVE pedir confirmação. Ao confirmar, as
  subtarefas abertas são concluídas junto.
- **FR-014**: Arquivar uma tarefa DEVE arquivar todas as subtarefas, e recuperar DEVE devolver
  todas.

**Tela de Tarefas (T009)**

- **FR-015**: A tela DEVE listar as tarefas principais, com as subtarefas indicadas e expansíveis.
  Cada linha mostra título, prioridade, área, vínculo, prazo e tempo estimado.
- **FR-016**: A lista DEVE filtrar por área, projeto, matéria, prioridade e status, combinando os
  filtros. Sem filtro escolhido, mostra as tarefas abertas.
- **FR-017**: A lista DEVE ordenar por prioridade (alta primeiro), depois pelo prazo mais próximo
  e, por fim, pela criação.
- **FR-018**: O usuário DEVE poder concluir e reabrir uma tarefa na própria lista, com um clique.
- **FR-019**: Clicar em uma tarefa DEVE abrir o painel lateral de detalhes, sem sair da tela, com
  todos os campos editáveis (exceto os herdados), as subtarefas e as ações de concluir, cancelar,
  excluir e mover para outra tarefa principal.
- **FR-020**: Tarefas com prazo vencido e ainda abertas DEVEM aparecer como atrasadas.
- **FR-021**: Criar, concluir, editar, excluir e desfazer DEVEM aparecer na tela na hora, sem
  recarregar a página, e qualquer outra tela que mostre a mesma tarefa DEVE mostrar a mesma
  situação (RN04).

**Conversão da caixa (T010)**

- **FR-022**: Cada item novo da caixa DEVE ter a ação "Virar tarefa", que abre o formulário da
  tarefa sem sair da Caixa, com a primeira linha do texto no título e o texto inteiro nas
  anotações.
- **FR-023**: Ao salvar a tarefa, o item DEVE sair da caixa, com a situação processado. Se a
  tarefa for recusada ou o formulário for cancelado, o item DEVE continuar na caixa.
- **FR-024**: Criar a tarefa e marcar o item como processado DEVEM acontecer juntos: ou as duas
  coisas acontecem, ou nenhuma.

**Regras gerais**

- **FR-025**: Todas as regras deste documento DEVEM ficar na camada de serviços, não nas telas
  (princípio IV).
- **FR-026**: Todos os textos, rótulos e erros DEVEM vir do arquivo de textos em português
  (princípio I).
- **FR-027**: Todo erro DEVE informar o que aconteceu e o que fazer, sem perder o que foi
  digitado.

### Entidades principais

- **Tarefa**: ação a fazer (seção 3 de `docs/spec.md`). Tem título, área, prioridade, tempo
  estimado, prazo, status, data de conclusão, anotações e, opcionalmente, um projeto ou uma
  matéria, uma coluna do Kanban (usada na Etapa 6) e uma tarefa principal, quando é subtarefa.
- **Projeto** e **Matéria**: definem a área da tarefa ligada a eles. Já existem na camada de
  dados. As telas de cada um chegam nas Etapas 5 e 8.
- **Item da caixa**: ganha o uso da situação processado, quando vira tarefa.

## Critérios de sucesso *(obrigatório)*

### Resultados mensuráveis

- **SC-001**: 100% das tentativas de criar ou editar uma tarefa sem título, área, prioridade ou
  tempo estimado são recusadas, e a mensagem aponta cada campo faltante.
- **SC-002**: O usuário cria uma tarefa completa em menos de 30 segundos.
- **SC-003**: O usuário cria uma subtarefa em menos de 5 segundos, digitando só o título.
- **SC-004**: Em 100% dos casos, as subtarefas mostram a mesma área, prioridade e vínculo da
  tarefa principal, inclusive depois de mudanças nela.
- **SC-005**: Nenhuma combinação de mudanças deixa uma tarefa dentro dela mesma.
- **SC-006**: Com 500 tarefas, aplicar um filtro ou concluir uma tarefa aparece na tela em menos de
  100 ms.
- **SC-007**: Um item da caixa vira tarefa em menos de 30 segundos, sem sair da Caixa, e nunca
  fica nos dois lugares nem desaparece dos dois.

## Premissas

- **Coluna final (RN32)**: os projetos ainda não têm colunas (o Kanban é a Etapa 6). Nesta
  etapa, concluir só muda o status. Mover para a coluna final e a coluna ao reabrir entram com o
  Kanban.
- **Matérias**: a tela Estudos chega na Etapa 8. Até lá, só é possível ligar tarefas a matérias
  que existam nos dados (por exemplo, vindas de uma cópia importada).
- **Anotações**: o campo de anotações é novo no modelo de dados. Ele é opcional e serve, por
  exemplo, para guardar o texto inteiro de um item da caixa.
- **Herança total**: além de área e prioridade (RN33), a subtarefa também segue o vínculo da
  tarefa principal. Isso evita uma subtarefa de projeto aparecer como avulsa.
- **Concluir com subtarefas**: ao confirmar, as subtarefas abertas são concluídas junto, como
  pede o `docs/plan.md` ("Concluir uma tarefa com subtarefas abertas exige confirmação").
- **Arquivados**: recuperar uma tarefa excluída é possível pelo "Desfazer" do aviso. A lista de
  arquivados chega na tela Ajustes (T030).
- **Telas futuras**: Hoje, Kanban e Agenda (Etapas 3, 6 e 7) vão usar as mesmas tarefas e os
  mesmos serviços, sem cópia (RN04).
- **Usuário único** e dados no navegador, como nas features 001 e 002.
