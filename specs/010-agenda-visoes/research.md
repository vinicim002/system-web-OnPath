# Pesquisa: Visões e painel de tarefas da Agenda

## 1. Visões

- **Decisão**: `?visao=semana|board|timeline|lista|tabela` (padrão `semana`), junto de `?semana`. Os
  itens vêm do `useAgenda` da semana e passam por `filtrarItens(itens, filtro)` antes de qualquer
  visão, para todas mostrarem o mesmo.
- **Board**: sete colunas com cartões; `dnd-kit` (ponteiro e teclado) move o item para outro dia
  mantendo a hora: `alterarBloco`/`alterarCompromisso` com `useSalvarComConflito`.
- **Timeline**: uma linha por dia, eixo das 6h às 24h na horizontal, barras posicionadas em
  porcentagem; itens sobrepostos dividem a altura da linha (mesmo `posicionar` da grade, em faixas).
- **Lista**: grupos por dia; **Tabela**: `ordenarItens(itens, coluna, direção)`.
- **Motivo**: tudo é apresentação dos mesmos dados; nenhuma regra nova de gravação.

## 2. Filtro

- **Decisão**: `tipos` (`compromisso`, `tarefa`, `rotina`), `areas` (ids) e `status` (`planejado`,
  `realizado`, `perdido`), cada um vazio = todos, no endereço como listas separadas por vírgula. O
  status só vale para blocos.

## 3. Painel

- **Decisão**: `agruparPorPrazo(tarefas, hoje)` em `atrasadas` (prazo < hoje), `semana` (até o
  domingo), `mes` (até o fim do mês), `depois` e `semPrazo`, cada grupo por prazo e prioridade. A aba
  Eventos usa `useAgenda` de hoje. Recolhido fica em `onpath:agenda-painel`.
- **Arrastar para a grade**: um `DndContext` envolve painel e grade; cada coluna do dia é um alvo.
  No soltar, a posição do ponteiro (`activatorEvent` + `delta`) menos o topo da coluna vira minutos
  (`horaDoSoltar`, de 15 em 15). `intervaloDaTarefa(data, hora, minutos)` corta o fim em 23:45.
- **Teclado**: botão "Agendar" abre `CriarNaAgenda` na aba Bloco com a tarefa escolhida.

## 4. Testes

`__tests__/agendaVisoes.test.ts`: filtro, ordenação da tabela, grupos por prazo, hora do soltar e
corte do fim no mesmo dia.
