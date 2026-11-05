# Especificação: Hoje

**Branch**: `main` (sem branch própria da funcionalidade)

**Criada em**: 2026-11-05

**Status**: Rascunho

**Entrada**: Etapa 3 do `docs/tasks.md` (T011 e T012): tela Hoje para montar o plano do dia com
as tarefas existentes, adicionar, remover e reordenar, com a próxima em destaque (RN20); e, ao
abrir o app no dia seguinte, perguntar o destino de cada tarefa não feita: remarcar, devolver à
lista ou cancelar (RN11 e RN25). Seção 6.4 de `docs/spec.md`. Só front-end, com os dados locais.

**Referências**: `docs/spec.md` (seção 3, RN04, RN11, RN20, RN25, RN32 e seção 6.4),
`docs/plan.md` (seção 6, `itens_dia`; seção 7, "Pendências do dia"), `docs/tasks.md` (T011 e
T012), `.specify/memory/constitution.md` e `specs/003-tarefas/`.

## Cenários de uso e testes *(obrigatório)*

### História 1: Montar o plano do dia (Prioridade: P1)

O usuário abre o app e cai na tela Hoje. Ele escolhe, entre as tarefas abertas, as que vai fazer
hoje, e elas entram na lista do dia. Ele arruma a ordem como quiser, e a primeira tarefa ainda
não feita aparece em destaque como "a próxima". Se mudar de ideia, tira uma tarefa do dia sem
apagá-la.

**Por que esta prioridade**: é o critério de pronto da T011 ("a tela abrir como inicial e
destacar a próxima tarefa") e responde à pergunta central do produto: o que fazer agora.

**Teste independente**: abrir o app, adicionar três tarefas ao dia, mudar a ordem e conferir
que a primeira não feita está em destaque; tirar uma do dia e conferir que ela continua na tela
Tarefas.

**Cenários de aceite**:

1. **Dado** que o usuário abre o app, **quando** a primeira tela carrega, **então** é a tela Hoje,
   com a data de hoje.
2. **Dado** a tela Hoje, **quando** o usuário escolhe adicionar, **então** vê as tarefas abertas
   que ainda não estão no dia, pode buscar pelo título e adicionar uma ou várias.
3. **Dado** tarefas no dia, **quando** a tela mostra a lista, **então** elas aparecem na ordem
   escolhida, e a primeira ainda não feita aparece em destaque como a próxima (RN20).
4. **Dado** tarefas no dia, **quando** o usuário muda a ordem (arrastando ou pelo teclado),
   **então** a nova ordem fica gravada e continua depois de recarregar a página.
5. **Dado** uma tarefa no dia, **quando** o usuário a tira do dia, **então** ela sai da lista de
   hoje, mas continua aberta na tela Tarefas.
6. **Dado** o dia sem tarefas, **quando** a tela abre, **então** mostra uma mensagem convidando a
   escolher as tarefas do dia.

---

### História 2: Fazer as tarefas do dia (Prioridade: P1)

Durante o dia, o usuário marca as tarefas como feitas na própria tela Hoje. A tarefa feita fica
riscada, o destaque passa para a próxima, e a tarefa aparece como concluída em qualquer outra
tela. A tela mostra quanto tempo foi planejado e quanto já foi feito.

**Por que esta prioridade**: sem concluir, o plano do dia não anda, e a "próxima" nunca muda.

**Teste independente**: com três tarefas no dia, concluir a primeira e conferir que o destaque
passa para a segunda e que a tarefa aparece concluída na tela Tarefas.

**Cenários de aceite**:

1. **Dado** a próxima tarefa em destaque, **quando** o usuário a marca como feita, **então** ela
   fica concluída (RN32), aparece riscada no dia, e o destaque passa para a seguinte.
2. **Dado** uma tarefa concluída na tela Tarefas, **quando** o usuário volta para Hoje, **então**
   ela aparece como feita no dia (RN04).
3. **Dado** uma tarefa feita no dia, **quando** o usuário a reabre, **então** ela volta a contar
   como não feita e pode voltar a ser a próxima.
4. **Dado** tarefas no dia, **quando** a tela mostra o resumo, **então** aparecem o tempo
   planejado (soma dos tempos estimados) e o tempo das tarefas já feitas.
5. **Dado** uma tarefa com subtarefas abertas, **quando** o usuário a conclui pela tela Hoje,
   **então** o app pede a mesma confirmação da tela Tarefas.
6. **Dado** todas as tarefas do dia feitas, **quando** a tela mostra a lista, **então** não há
   destaque e aparece uma mensagem de dia concluído.

---

### História 3: Decidir o destino das pendências (Prioridade: P2)

O usuário abre o app em um novo dia, e ficaram tarefas não feitas de dias anteriores. Antes de
montar o dia, a tela Hoje mostra cada pendência e pede um destino: remarcar (para hoje ou outra
data), devolver à lista de tarefas, sem data, ou cancelar. Só depois de decidir todas ele volta
ao plano do dia.

**Por que esta prioridade**: é o critério de pronto da T012 ("nenhuma pendência de dia anterior
ficar sem destino") e cumpre a RN11 e a RN25. Depende das histórias 1 e 2.

**Teste independente**: montar um dia com três tarefas, deixar duas sem fazer, simular a virada
do dia e conferir que as duas pedem destino; escolher um destino diferente para cada uma e
conferir o resultado nas telas Hoje e Tarefas.

**Cenários de aceite**:

1. **Dado** tarefas não feitas em dias anteriores, **quando** o usuário abre a tela Hoje, **então**
   a revisão de pendências aparece antes do plano do dia, com a data original de cada uma (RN25).
2. **Dado** uma pendência, **quando** o usuário escolhe remarcar para hoje, **então** ela entra no
   plano de hoje, no fim da lista.
3. **Dado** uma pendência, **quando** o usuário escolhe remarcar para outra data, **então** ela
   entra no plano daquela data e some da revisão.
4. **Dado** uma pendência, **quando** o usuário escolhe devolver à lista, **então** ela sai dos
   planos de dia, mas continua aberta na tela Tarefas.
5. **Dado** uma pendência, **quando** o usuário escolhe cancelar, **então** a tarefa fica
   cancelada.
6. **Dado** várias pendências, **quando** o usuário escolhe "remarcar todas para hoje", **então**
   todas entram no plano de hoje, na ordem em que estavam.
7. **Dado** que ainda há pendências sem destino, **quando** o usuário tenta montar o dia, **então**
   o plano só aparece depois que a última for decidida (RN11).
8. **Dado** uma pendência cuja tarefa já foi concluída ou cancelada em outra tela, **quando** a
   revisão é montada, **então** ela não aparece, porque já tem destino.
9. **Dado** pendências sem destino, **quando** o usuário está em outra tela, **então** o menu
   mostra, ao lado de Hoje, quantas pendências faltam decidir.

---

### Casos-limite

- **Virada do dia com o app aberto**: ao voltar para o app depois da meia-noite, a tela Hoje passa
  a mostrar o novo dia e, se houver pendências, a revisão.
- **Fuso**: "hoje" é a data no fuso do usuário (`America/Sao_Paulo` até a T030), e não a data em
  UTC.
- **Mesma tarefa duas vezes no dia**: não é possível; uma tarefa aparece no máximo uma vez em cada
  data.
- **Tarefa arquivada ou cancelada que estava no dia**: some do plano de hoje. Se for desarquivada,
  volta.
- **Tarefa remarcada para uma data em que já está**: fica uma só vez naquela data.
- **Remarcar para uma data passada**: não é permitido; a data mínima é hoje.
- **Pendência de vários dias atrás**: aparece uma vez, com a data mais recente em que estava
  planejada.
- **Subtarefa no dia**: pode ser adicionada; aparece com o título da tarefa principal como
  contexto.
- **Armazenamento cheio ou indisponível**: nada é gravado pela metade, e o app informa o que
  aconteceu e o que fazer.
- **Muitas tarefas abertas**: a busca ao adicionar continua imediata com centenas de tarefas.

## Requisitos *(obrigatório)*

### Requisitos funcionais

**Plano do dia (T011)**

- **FR-001**: Hoje DEVE ser a tela inicial do app e mostrar a data de hoje, por extenso.
- **FR-002**: O usuário DEVE poder adicionar ao dia de hoje qualquer tarefa aberta e ativa que
  ainda não esteja nele, buscando pelo título, uma ou várias de uma vez.
- **FR-003**: Uma tarefa DEVE aparecer no máximo uma vez em cada data.
- **FR-004**: O usuário DEVE poder reordenar as tarefas do dia arrastando e também pelo teclado,
  e a ordem DEVE ficar gravada.
- **FR-005**: A primeira tarefa do dia, na ordem escolhida, que ainda não foi feita DEVE aparecer
  em destaque como a próxima (RN20).
- **FR-006**: O usuário DEVE poder tirar uma tarefa do dia sem mudar a tarefa.
- **FR-007**: Cada tarefa do dia DEVE mostrar título, prioridade, vínculo (projeto, matéria ou
  avulsa), tempo estimado e, se for subtarefa, o título da tarefa principal.
- **FR-008**: Clicar no título DEVE abrir os detalhes da tarefa na tela Tarefas.

**Fazer as tarefas (T011)**

- **FR-009**: O usuário DEVE poder concluir e reabrir uma tarefa do dia na própria tela, com as
  mesmas regras da tela Tarefas, inclusive a confirmação quando há subtarefas abertas.
- **FR-010**: Uma tarefa concluída em qualquer tela DEVE aparecer como feita no dia (RN04).
- **FR-011**: A tela DEVE mostrar o tempo planejado do dia (soma dos tempos estimados) e o tempo
  das tarefas já feitas.
- **FR-012**: Tarefas canceladas ou arquivadas DEVEM sair do plano do dia.

**Pendências (T012)**

- **FR-013**: Uma pendência é uma tarefa que estava no plano de um dia anterior, não foi feita e
  continua aberta, e que ainda não recebeu destino.
- **FR-014**: Havendo pendências, a tela Hoje DEVE mostrar a revisão antes do plano do dia, com o
  título, o contexto e a data original de cada pendência (RN25).
- **FR-015**: Para cada pendência, o usuário DEVE escolher um destino: remarcar para hoje,
  remarcar para outra data (hoje ou depois), devolver à lista ou cancelar a tarefa (RN11).
- **FR-016**: O usuário DEVE poder remarcar todas as pendências para hoje com uma só ação.
- **FR-017**: O plano do dia só DEVE aparecer quando não restar pendência sem destino.
- **FR-018**: Enquanto houver pendências, o menu DEVE mostrar a quantidade ao lado de Hoje.
- **FR-019**: Cada destino DEVE ficar registrado no item do dia de origem (remarcada, devolvida ou
  cancelada), e uma tarefa remarcada DEVE entrar no plano da nova data.

**Regras gerais**

- **FR-020**: "Hoje" DEVE ser a data no fuso do usuário e DEVE ser recalculado quando o usuário
  volta ao app depois da virada do dia.
- **FR-021**: Todas as regras do plano do dia e das pendências DEVEM ficar na camada de serviços
  (princípio IV).
- **FR-022**: Todos os textos DEVEM vir do arquivo de textos em português (princípio I).
- **FR-023**: Todo erro DEVE informar o que aconteceu e o que fazer.

### Entidades principais

- **Item do dia**: tarefa escolhida para uma data (seção 3 de `docs/spec.md`). Tem a tarefa, a
  data, a posição na ordem do dia e o resultado: pendente, feita, remarcada, devolvida ou
  cancelada. Já existe na camada de dados desde a feature 001.
- **Tarefa**: a mesma da feature 003, nunca uma cópia (RN04). Concluir no dia conclui a tarefa.

## Critérios de sucesso *(obrigatório)*

### Resultados mensuráveis

- **SC-001**: O app abre na tela Hoje em 100% das vezes, com a próxima tarefa visível sem rolar a
  página.
- **SC-002**: O usuário monta um dia com cinco tarefas em menos de 1 minuto.
- **SC-003**: Reordenar uma tarefa aparece na tela em menos de 100 ms e continua na mesma posição
  depois de recarregar.
- **SC-004**: Nenhuma pendência de dia anterior fica sem destino: 100% delas aparecem na revisão,
  e o plano só é liberado quando todas foram decididas.
- **SC-005**: O usuário resolve dez pendências em menos de 30 segundos, usando "remarcar todas"
  ou um clique por pendência.
- **SC-006**: Em 100% dos casos, a situação de uma tarefa (aberta, feita ou cancelada) é a mesma
  nas telas Hoje e Tarefas.

## Premissas

- **Rotinas, compromissos e blocos de tempo** (seção 6.4) chegam com a Agenda (Etapa 7). Nesta
  etapa, a tela Hoje mostra só as tarefas do dia.
- **Aviso de tempo livre (RN10)** depende da janela do dia e das rotinas, e fica para a T025. Nesta
  etapa, a tela mostra o tempo planejado, sem comparar com o tempo livre.
- **Sem conexão** (seção 6.4) é da T048, na Parte 2. Hoje os dados já ficam no navegador.
- **Onde aparece a revisão**: na tela Hoje, que é a tela inicial. As outras telas continuam
  acessíveis, e o menu mostra quantas pendências faltam. Assim o usuário não fica preso se só
  quiser anotar algo.
- **Tirar do dia** não é excluir: o item do dia é arquivado (RN31), e a tarefa não muda.
- **Cancelar uma pendência** cancela a tarefa, como pede a RN11 ("é cancelada").
- **Remarcar** cria o item na nova data e marca o de origem como remarcado; a tarefa continua
  aberta.
- **Tarefas sem tempo estimado** (subtarefas) contam zero no tempo planejado.
- **Usuário único** e dados no navegador, como nas features anteriores.
