# Especificação: Rotina perdida, tempo livre e lembretes

**Branch**: `main` (sem branch própria) | **Criada em**: 2026-11-05 | **Status**: Rascunho

**Entrada**: segunda parte da Etapa 7 do `docs/tasks.md` (T024 a T026): proposta de novo horário
para a rotina perdida (RN18), tempo livre com aviso de dia cheio na tela Hoje (RN10) e lembretes com
as notificações do navegador. Só front-end.

**Referências**: `docs/spec.md` (RN10, RN18, seções 6.4 e 6.9), `docs/plan.md` (seção 7, "Tempo
livre", "Rotinas e blocos" e "Lembretes"), `docs/tasks.md` (T024 a T026).

## Cenários de uso e testes *(obrigatório)*

### História 1: Remarcar uma rotina perdida (Prioridade: P1)

Um bloco de rotina de hoje terminou e o usuário não o marcou como realizado. Na tela Hoje, o app
mostra a rotina perdida com uma proposta de novo horário: o primeiro horário livre, com a mesma
duração, a partir de agora e dentro da janela do dia (ou amanhã, se hoje não couber). O usuário
aceita (o bloco vai para o novo horário), recusa (fica como perdido) ou informa que fez (realizado).

**Por que esta prioridade**: é o "Pronto quando" da T024 e a RN18.

**Teste independente**: com o almoço de hoje já passado e não realizado, abrir Hoje, ver a proposta
e aceitar; conferir na Agenda o almoço no novo horário e o antigo fora da grade.

**Cenários de aceite**:

1. **Dado** um bloco de rotina de hoje, planejado, com fim antes de agora, **quando** o usuário abre
   Hoje, **então** vê a rotina, o horário perdido e a proposta de novo horário.
2. **Dado** a proposta, **quando** o usuário aceita, **então** o bloco antigo fica como remarcado e um
   novo bloco planejado da mesma rotina ocupa o horário proposto.
3. **Dado** a proposta, **quando** o usuário recusa, **então** o bloco fica como perdido e a proposta
   some.
4. **Dado** a rotina perdida, **quando** o usuário diz que fez, **então** o bloco fica como realizado.
5. **Dado** que não há horário livre com a mesma duração hoje nem amanhã, **quando** o app procura,
   **então** mostra a rotina sem proposta, só com "Fiz" e "Recusar".

---

### História 2: Ver o tempo livre e o aviso de dia cheio (Prioridade: P1)

Na tela Hoje, ao lado do tempo planejado, o app mostra o tempo livre do dia: a janela do dia menos
os blocos de rotina e os compromissos. Se o planejado passar do tempo livre, aparece um aviso, sem
impedir nada (RN10).

**Por que esta prioridade**: é o "Pronto quando" da T025.

**Teste independente**: num dia com trabalho, almoço e academia, colocar tarefas que somam mais que
o tempo livre e conferir o aviso; tirar uma tarefa e ver o aviso sumir.

**Cenários de aceite**:

1. **Dado** o plano do dia, **quando** Hoje abre, **então** mostra o tempo livre do dia.
2. **Dado** um planejado maior que o tempo livre, **quando** Hoje abre ou o plano muda, **então**
   aparece o aviso com quanto passou, e adicionar tarefas continua possível.
3. **Dado** blocos e compromissos sobrepostos, **quando** o app calcula o tempo livre, **então** o
   tempo sobreposto é descontado uma vez só, e só a parte dentro da janela do dia conta.

---

### História 3: Receber lembretes (Prioridade: P2)

O usuário ativa os lembretes em Ajustes. Com o app aberto, 10 minutos antes de um compromisso ou de
um bloco planejado, aparece um aviso no app e, se o navegador permitir, uma notificação do sistema.
Ajustes também guarda a janela do dia usada no tempo livre e nas propostas.

**Por que esta prioridade**: é o "Pronto quando" da T026; depende do app aberto (`docs/plan.md`).

**Teste independente**: ativar os lembretes, criar um compromisso que começa em 5 minutos e ver o
aviso aparecer uma vez.

**Cenários de aceite**:

1. **Dado** Ajustes, **quando** o usuário ativa os lembretes, **então** o navegador pede a permissão
   de notificação, e a tela informa que os lembretes dependem do app aberto.
2. **Dado** os lembretes ativos, **quando** falta 10 minutos ou menos para um compromisso ou bloco
   planejado, **então** aparece um aviso com o título e o horário, uma vez por item.
3. **Dado** a permissão negada, **quando** chega a hora, **então** o aviso aparece só dentro do app.
4. **Dado** Ajustes, **quando** o usuário muda o início ou o fim da janela do dia, **então** o tempo
   livre de Hoje usa a nova janela; fim antes do início é recusado.

---

### Casos-limite

- **Rotinas perdidas de dias anteriores**: não geram proposta; só as de hoje.
- **Bloco realizado, remarcado ou já perdido**: não gera proposta.
- **Proposta**: começa na próxima meia hora cheia depois de agora, cabe inteira na janela do dia e
  não sobrepõe blocos ativos nem compromissos.
- **Horário ocupado ao aceitar** (algo foi criado no meio tempo): o app avisa e mostra nova proposta.
- **Itens no passado ou já começados**: não geram lembrete.
- **Mesmo item**: um lembrete só, mesmo recarregando a página.

## Requisitos *(obrigatório)*

### Requisitos funcionais

- **FR-001**: O app DEVE listar os blocos de rotina de hoje planejados com fim antes de agora, cada um
  com a proposta de novo horário ou sem proposta quando não houver (RN18).
- **FR-002**: Aceitar DEVE marcar o bloco como remarcado e criar o novo bloco planejado, numa escrita;
  recusar DEVE marcá-lo como perdido; "Fiz" DEVE marcá-lo como realizado.
- **FR-003**: O tempo livre DEVE ser a janela do dia menos a união dos blocos de rotina ativos e dos
  compromissos do dia, limitados à janela.
- **FR-004**: Hoje DEVE mostrar o tempo livre e avisar, sem bloquear, quando o planejado passar dele
  (RN10).
- **FR-005**: A janela do dia DEVE ter início e fim (padrão 07:00 às 23:00), editáveis em Ajustes.
- **FR-006**: Com os lembretes ativos e o app aberto, o app DEVE avisar 10 minutos antes de cada
  compromisso e bloco planejado, uma vez por item, no app e, com permissão, no sistema.
- **FR-007**: Regras nos serviços (IV), textos no arquivo de textos (I) e cores do tema (V).

### Entidades principais

- **Preferências**: janela do dia e lembretes ativos. Novo, guardado no navegador (no servidor, viram
  `hora_inicio_dia` e `hora_fim_dia` do usuário).
- **Bloco de tempo**: passa a usar os status perdido e remarcado. Já existe.

## Critérios de sucesso *(obrigatório)*

- **SC-001**: Toda rotina de hoje não realizada aparece com uma proposta em Hoje ou com o motivo de
  não haver.
- **SC-002**: O aviso de dia cheio aparece sempre que o planejado passa do livre e nunca impede ações.
- **SC-003**: Cada item recebe no máximo um lembrete.

## Premissas

- **Antecedência**: 10 minutos (proposta de `docs/spec.md`, seção 9), fixa nesta etapa.
- **Ajustes completo** (fuso e arquivados) é a T030; aqui entram só a janela do dia e os lembretes.
- **Lembretes** só com o app aberto, como diz o `docs/plan.md`.
