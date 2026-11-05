# Especificação: Agenda, blocos e rotinas

**Branch**: `main` (sem branch própria) | **Criada em**: 2026-11-05 | **Status**: Rascunho

**Entrada**: primeira parte da Etapa 7 do `docs/tasks.md` (T020 a T023): blocos de tempo com
conflitos (RN09), rotinas com horário ou meta de horas e geração de blocos (RN28), tela Rotinas
(seção 6.8) e Agenda semanal com compromissos e blocos (seção 6.9). A segunda parte (T024 a T026:
rotina perdida, tempo livre e lembretes) fica para a feature 009. Só front-end.

**Referências**: `docs/spec.md` (seção 5, RN09, RN28, seções 6.8 e 6.9), `docs/plan.md` (seção 7,
"Rotinas e blocos" e "Conflitos de horário"), `docs/tasks.md` (T020 a T023).

## Cenários de uso e testes *(obrigatório)*

### História 1: Ver a semana na Agenda (Prioridade: P1)

O usuário abre a Agenda e vê a semana atual, de segunda a domingo, com os horários do dia em
linhas. Os compromissos e os blocos de tempo (das rotinas, das tarefas) aparecem no horário certo,
com o título e a área. Ele avança e volta semanas e volta para a semana atual.

**Por que esta prioridade**: é a visão principal da seção 6.9 e mostra a rotina da seção 5 já
organizada na semana.

**Teste independente**: abrir a Agenda num navegador com os dados iniciais e conferir os blocos do
trabalho, do almoço e da academia nos dias e horários certos; ir para a próxima semana e voltar.

**Cenários de aceite**:

1. **Dado** os dados iniciais, **quando** o usuário abre a Agenda, **então** vê a semana atual com os
   blocos das rotinas com horário e duração (trabalho, almoço, academia, aula), cada um no dia e no
   horário certos.
2. **Dado** a Agenda, **quando** o usuário avança ou volta uma semana, **então** vê os blocos e
   compromissos daquela semana; "Hoje" volta para a semana atual.
3. **Dado** a semana atual, **quando** a tela abre, **então** o dia de hoje está destacado e uma linha
   marca a hora atual.

---

### História 2: Criar compromissos e blocos, com aviso de conflito (Prioridade: P1)

O usuário cria um compromisso (consulta, reunião) com título, área, início, fim e local. Ele também
reserva um bloco de tempo para uma tarefa ou para uma rotina com meta de horas. Se o horário já
estiver ocupado por outro bloco ou compromisso, o app mostra o que ocupa e só grava com confirmação
(RN09).

**Por que esta prioridade**: é o "Pronto quando" da T020 e o uso diário da Agenda.

**Teste independente**: criar um compromisso numa tarde livre (grava direto); criar um bloco de
tarefa às 14h de segunda (conflita com "Trabalho (tarde)"; pede confirmação); confirmar e conferir
os dois lado a lado.

**Cenários de aceite**:

1. **Dado** a Agenda, **quando** o usuário clica num horário vazio, **então** abre a criação com o
   dia e a hora já preenchidos, para escolher entre compromisso e bloco.
2. **Dado** um compromisso sem título, área ou com fim antes do início, **quando** o usuário salva,
   **então** nada é gravado e cada campo mostra o erro.
3. **Dado** um horário livre, **quando** o usuário cria um compromisso ou um bloco, **então** ele
   aparece na Agenda.
4. **Dado** um horário ocupado, **quando** o usuário cria ou move um bloco ou compromisso para ele,
   **então** o app lista o que já ocupa e pede confirmação; confirmando, grava; cancelando, nada muda
   (RN09).
5. **Dado** um bloco, **quando** o usuário escolhe o que ele reserva, **então** pode ser uma tarefa
   aberta ou uma rotina com meta de horas (as sessões de estudo chegam na Etapa 8).
6. **Dado** um compromisso, **quando** o usuário o edita ou arquiva, **então** a Agenda mostra a
   mudança, e arquivar oferece desfazer (RN31).
7. **Dado** um bloco, **quando** o usuário o marca como realizado ou o exclui, **então** a Agenda
   mostra a mudança.

---

### História 3: Manter as rotinas (Prioridade: P1)

Na tela Rotinas, o usuário vê as rotinas com horário (dias, hora e duração) e as rotinas com meta de
horas (dias e meta por dia). Ele cria, edita e arquiva rotinas. As rotinas com horário geram os
blocos na Agenda sozinhas, sem duplicar. Uma rotina com meta mostra quanto do dia já foi reservado ou
feito (RN28). Alterar uma rotina muda só os blocos futuros.

**Por que esta prioridade**: cobre T021 e T022 e a seção 6.8.

**Teste independente**: mudar o horário do almoço para 12h30 e conferir que os blocos de hoje à
tarde em diante mudaram e os passados não; criar dois blocos para "Estudo por conta própria" e
conferir a soma do dia.

**Cenários de aceite**:

1. **Dado** a tela Rotinas, **quando** ela abre, **então** mostra as rotinas da seção 5, separadas
   em "Com horário" e "Com meta de horas".
2. **Dado** uma rotina com horário e duração, **quando** o app é aberto, **então** os blocos dela
   existem para os próximos 14 dias, nos dias escolhidos, sem duplicar ao abrir de novo.
3. **Dado** uma rotina com horário, **quando** o usuário muda dias, hora ou duração, **então** só os
   blocos futuros ainda planejados mudam; os passados e os já realizados ficam.
4. **Dado** uma rotina com meta de horas, **quando** o usuário cria vários blocos dela no mesmo dia,
   **então** a tela mostra a soma do dia ao lado da meta (RN28).
5. **Dado** uma rotina, **quando** o usuário a arquiva, **então** os blocos futuros planejados dela
   somem da Agenda, e desfazer os traz de volta.
6. **Dado** o formulário, **quando** falta o nome, a área, os dias, a hora (com horário) ou a meta (com
   meta), **então** nada é gravado e o campo mostra o erro.

---

### Casos-limite

- **Rotina sem duração** (Acordar, Sono): não gera blocos; marca o começo e o fim do dia.
- **Blocos de rotinas** gerados automaticamente não pedem confirmação entre si.
- **Bloco que atravessa a meia-noite**: não é permitido nesta etapa; início e fim no mesmo dia.
- **Fim igual ou antes do início**: recusado.
- **Tarefa concluída ou arquivada com bloco**: o bloco continua, com a marca da tarefa.
- **Fuso**: horários de rotina são locais (`America/Sao_Paulo`); blocos e compromissos são gravados
  em UTC.
- **Janela de 14 dias**: renovada ao abrir o app e na virada do dia.

## Requisitos *(obrigatório)*

### Requisitos funcionais

**Blocos e conflitos (T020)**

- **FR-001**: Um bloco DEVE reservar um intervalo (início e fim no mesmo dia, fim depois do início)
  para uma tarefa aberta, uma rotina ou, depois, uma sessão de estudo — exatamente um deles.
- **FR-002**: Criar ou mover um bloco ou compromisso para um intervalo que se sobrepõe a outro bloco
  ativo (não remarcado nem perdido) ou compromisso DEVE ser recusado sem confirmação, informando o que
  ocupa o horário (RN09).
- **FR-003**: Com a confirmação, o app DEVE gravar mesmo com a sobreposição.
- **FR-004**: Um bloco DEVE poder ser marcado como realizado e excluído.

**Rotinas (T021)**

- **FR-005**: Uma rotina DEVE ter nome, área, dias da semana e um tipo: horário (hora de início e
  duração opcional) ou meta de horas (minutos por dia).
- **FR-006**: Rotinas com horário e duração DEVEM gerar um bloco por dia escolhido nos próximos 14
  dias, sem duplicar, renovando a janela ao abrir o app.
- **FR-007**: Alterar ou arquivar uma rotina DEVE refazer só os blocos futuros ainda planejados.
- **FR-008**: Para uma rotina com meta, o app DEVE somar os blocos planejados e realizados do dia e
  mostrar ao lado da meta (RN28).

**Telas (T022 e T023)**

- **FR-009**: A tela Rotinas DEVE listar, criar, editar e arquivar rotinas (seção 6.8).
- **FR-010**: A Agenda DEVE mostrar a semana (segunda a domingo) com compromissos e blocos, navegar
  entre semanas e destacar hoje e a hora atual.
- **FR-011**: A Agenda DEVE permitir criar compromissos e blocos clicando num horário, editar e
  arquivar compromissos e marcar ou excluir blocos.

**Gerais**

- **FR-012**: Regras nos serviços (IV), textos no arquivo de textos (I), cores do tema (V) e erros que
  dizem o que fazer.

### Entidades principais

- **Bloco de tempo**: intervalo reservado para tarefa, rotina ou sessão, com status (planejado,
  realizado, perdido, remarcado). Já existe.
- **Compromisso**: evento com hora marcada, área e local. Já existe.
- **Rotina**: atividade recorrente com horário ou meta de horas. Já existe.

## Critérios de sucesso *(obrigatório)*

- **SC-001**: 100% das criações em horário ocupado pedem confirmação; nenhuma grava sem ela.
- **SC-002**: Abrir o app várias vezes não cria blocos de rotina repetidos.
- **SC-003**: A Agenda mostra uma semana com dezenas de blocos em menos de 1 segundo.
- **SC-004**: Alterar uma rotina não mexe em nenhum bloco passado ou realizado.

## Premissas

- **Sessões de estudo** como alvo de bloco chegam na Etapa 8.
- **Rotinas sem duração** não geram blocos.
- **Janela visível da Agenda**: das 6h às 24h, com rolagem.
- **Semana** começa na segunda-feira.
- **Usuário único** e dados no navegador.
