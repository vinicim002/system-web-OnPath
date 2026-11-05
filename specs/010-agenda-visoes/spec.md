# Especificação: Visões e painel de tarefas da Agenda

**Branch**: `main` (sem branch própria) | **Criada em**: 2026-11-05 | **Status**: Rascunho

**Entrada**: pedido do usuário, registrado como T026a e T026b no `docs/tasks.md`: outras visões da
Agenda (Board, Timeline, Lista e Tabela, com filtro) e um painel de tarefas ao lado da grade, de onde
se arrasta uma tarefa para reservar um bloco. Só front-end.

**Referências**: `docs/spec.md` (seção 6.9), `docs/plan.md` (seção 7, "Visões e painel da Agenda" e
"Conflitos de horário").

## Cenários de uso e testes *(obrigatório)*

### História 1: Ver a semana de outros jeitos (Prioridade: P1)

O usuário troca a visão da Agenda entre Semana, Board, Timeline, Lista e Tabela. Todas mostram a
mesma semana e respeitam o mesmo filtro (tipo, área e status). Clicar num item abre o detalhe.

**Teste independente**: abrir a Agenda, passar pelas cinco visões e conferir os mesmos itens;
filtrar por "Compromissos" e ver só eles em todas.

**Cenários de aceite**:

1. **Dado** a Agenda, **quando** o usuário escolhe uma visão, **então** ela aparece e fica no
   endereço (recarregar mantém a visão).
2. **Dado** o Board, **quando** a tela abre, **então** cada dia é uma coluna com os cartões em ordem
   de horário; arrastar um cartão para outro dia mantém o horário e pede confirmação se houver
   conflito (RN09).
3. **Dado** a Timeline, **quando** a tela abre, **então** cada dia é uma linha, as horas ficam na
   horizontal e uma linha vertical marca agora.
4. **Dado** a Lista, **quando** a tela abre, **então** os itens aparecem agrupados por dia, em ordem
   de horário; dias sem itens não aparecem.
5. **Dado** a Tabela, **quando** o usuário clica no cabeçalho de uma coluna, **então** a ordem muda
   por essa coluna, crescente e decrescente.
6. **Dado** o filtro, **quando** o usuário escolhe tipos (compromissos, blocos de tarefa, blocos de
   rotina), áreas ou status, **então** todas as visões mostram só o que combina, e um botão limpa o
   filtro.

---

### História 2: Tarefas ao lado da Agenda (Prioridade: P1)

Ao lado da Agenda, um painel com duas abas. Em "Tarefas", as tarefas abertas aparecem em grupos
pelo prazo: Atrasadas, Esta semana, Este mês, Depois e Sem prazo. Uma caixa conclui a tarefa. Em
"Eventos", aparecem os compromissos e blocos de hoje. O painel pode ser recolhido.

**Teste independente**: criar tarefas com prazos diferentes e conferir os grupos; concluir uma pela
caixa.

**Cenários de aceite**:

1. **Dado** tarefas abertas, **quando** o painel abre, **então** cada uma aparece num grupo só,
   conforme o prazo, com o tempo estimado.
2. **Dado** uma tarefa, **quando** o usuário marca a caixa, **então** ela é concluída (com a mesma
   confirmação das subtarefas abertas) e sai do painel.
3. **Dado** a aba Eventos, **quando** ela abre, **então** mostra os itens de hoje em ordem de
   horário, e clicar abre o detalhe.
4. **Dado** o painel, **quando** o usuário o recolhe, **então** a Agenda ocupa a largura toda, e a
   escolha fica guardada no navegador.

---

### História 3: Arrastar uma tarefa para a grade (Prioridade: P1)

Na visão Semana, o usuário arrasta uma tarefa do painel para um horário. O app cria um bloco
planejado para ela, com a duração do tempo estimado (ou 1 hora). Se o horário estiver ocupado, pede
confirmação. Pelo teclado, o botão "Agendar" da tarefa abre a criação de bloco com ela escolhida.

**Teste independente**: arrastar "Relatório" (2 h) para terça às 14h e ver o bloco de 14h às 16h.

**Cenários de aceite**:

1. **Dado** uma tarefa, **quando** o usuário a solta num dia da grade, **então** o bloco começa no
   horário solto, arredondado para 15 minutos, com a duração do tempo estimado.
2. **Dado** uma duração que passaria da meia-noite, **quando** o usuário solta, **então** o fim é
   cortado para 23:45, no mesmo dia.
3. **Dado** um horário ocupado, **quando** o usuário solta, **então** aparece a confirmação de
   conflito; cancelar não cria nada.
4. **Dado** o teclado, **quando** o usuário aciona "Agendar", **então** abre a criação de bloco com a
   tarefa escolhida e o próximo horário cheio de hoje.

---

### Casos-limite

- **Subtarefas** aparecem no painel como as outras tarefas abertas, com o nome da tarefa principal.
- **Arrastar no Board** um item para o mesmo dia não muda nada.
- **Filtro vazio**: mostra tudo.
- **Semana sem itens**: Lista e Tabela mostram uma mensagem.

## Requisitos *(obrigatório)*

- **FR-001**: A Agenda DEVE ter as visões Semana, Board, Timeline, Lista e Tabela, guardadas no
  endereço com a semana e o filtro.
- **FR-002**: O filtro DEVE combinar tipo, área e status e valer para todas as visões.
- **FR-003**: O Board DEVE permitir mover um item para outro dia mantendo o horário, com RN09.
- **FR-004**: O painel DEVE agrupar as tarefas abertas por prazo, concluir pela caixa e mostrar os
  eventos de hoje, e poder ser recolhido.
- **FR-005**: Soltar uma tarefa na grade DEVE criar um bloco planejado com o tempo estimado (ou 60
  minutos), início arredondado para 15 minutos e fim no mesmo dia, com RN09.
- **FR-006**: Toda ação de arrastar DEVE ter um caminho pelo teclado.
- **FR-007**: Textos no arquivo de textos (I), cores do tema (V), regras de gravação nos serviços (IV).

## Critérios de sucesso *(obrigatório)*

- **SC-001**: Reservar um horário para uma tarefa leva um gesto (arrastar e soltar).
- **SC-002**: As cinco visões mostram exatamente os mesmos itens para o mesmo filtro.

## Premissas

- **Período**: todas as visões usam a semana escolhida.
- **Sem dependência nova**: o arrastar usa o `dnd-kit`, que já está no projeto.
