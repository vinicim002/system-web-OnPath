# Pesquisa: Kanban

## 1. Colunas

- **Decisão**: `ServicoColunas` com `listarDoProjeto`, `criar` (no fim, nunca final), `alterar`
  (nome único no projeto), `reordenar`, `marcarFinal(id)` (desmarca a outra na mesma escrita) e
  `excluir` (arquiva e tira a coluna das tarefas, na mesma escrita). `recuperar` devolve a coluna no
  fim e põe de volta as tarefas que estavam nela quando foi arquivada.
- **Como lembrar as tarefas**: arquivar grava, em cada tarefa, `colunaId = null`; para o desfazer,
  o serviço devolve a coluna para as tarefas do projeto que estão sem coluna e foram alteradas no
  mesmo instante do arquivamento (`atualizadoEm` igual ao `arquivadoEm` da coluna). Assim não é
  preciso campo novo.
- **Erro novo**: `nome_repetido` (já existe) e `dados_invalidos`.

## 2. Conclusão ligada à coluna (RN32)

- **Decisão**: o serviço de tarefas passa a cuidar da coluna:
  - `concluir`: tarefa principal de projeto com coluna final → grava a coluna final junto.
  - `reabrir`: tarefa na coluna final → grava a primeira coluna não final (ou `null`).
  - `moverParaColuna(id, colunaId | null, opcoes)` (novo): para a final, conclui (com
    `subtarefas_abertas` e `incluirSubtarefas`, como em `concluir`); de uma tarefa concluída para
    outra coluna, reabre; nos demais casos, só muda a coluna. Tudo em uma escrita.
- **Regras**: só tarefa principal de projeto tem coluna, e a coluna precisa ser ativa e do mesmo
  projeto (`dados_invalidos`, campo `colunaId`). Mudar o projeto da tarefa, virar avulsa ou virar
  subtarefa zera a coluna.
- **Motivo**: princípio IV e o "Pronto quando" da T018: qualquer tela que conclui passa pelo
  serviço, e a coluna acompanha (RN04).

## 3. Kanban

- **Decisão**: `dnd-kit` com vários contêineres (`DndContext` com uma área soltável por coluna e
  `useDraggable` nos cartões), sensor de teclado e de ponteiro. O código fica isolado em
  `src/features/kanban/` (`QuadroKanban`, `ColunaKanban`, `CartaoKanban`), como pede o `docs/plan.md`
  ("Kanban e fila"); o celular poderá trocar esses componentes.
- **Atualização otimista**: ao soltar, o cartão aparece na coluna nova na hora; se o serviço recusar
  (ou a confirmação de subtarefas for cancelada), volta.
- **Colunas**: reordenar as colunas fica num painel "Editar colunas", com lista ordenável (como as
  áreas), em vez de arrastar as colunas no quadro. É mais simples e funciona pelo teclado.

## 4. Testes

- Serviço de colunas: criar no fim, nome único, reordenar, uma só final, arquivar e recuperar com
  as tarefas.
- Serviço de tarefas: concluir vai para a final; reabrir sai dela; `moverParaColuna` conclui,
  reabre e recusa coluna de outro projeto, tarefa avulsa e subtarefa; mudar o projeto zera a
  coluna.
