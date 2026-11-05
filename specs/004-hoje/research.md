# Pesquisa: Hoje

Decisões da Fase 0. A base técnica vem das features 001 a 003.

## 1. Onde ficam as regras

- **Decisão**: um serviço próprio, `ServicoItensDia`, que estende o serviço comum de coleção. Ele
  monta o plano do dia (itens com as tarefas, a próxima e os tempos), adiciona, tira, reordena,
  lista as pendências e grava o destino de cada uma.
- **Motivo**: princípio IV. Hoje, Agenda (Etapa 7) e a API da Parte 2 usam as mesmas regras.

## 2. "Feita" vem da tarefa

- **Decisão**: o item do dia não guarda que a tarefa foi feita enquanto o dia está em andamento. A
  tela mostra a situação da própria tarefa (aberta, concluída ou cancelada). O resultado do item
  só muda quando a pendência recebe um destino (`remarcada`, `devolvida`, `cancelada`). O item de
  uma tarefa concluída fica com `pendente`, mas não é pendência, porque a tarefa não está aberta.
  O valor `feita` fica reservado para quando a API (Parte 2) fechar os dias passados.
- **Motivo**: cumpre a RN04 sem sincronizar dois campos: concluir em qualquer tela já aparece no
  dia. O resultado do item vira o histórico do dia.
- **Alternativas**: gravar `feita` no item ao concluir. Exigiria atualizar os itens a cada
  conclusão feita nas telas Tarefas, Kanban e Agenda.

## 3. O que conta no plano do dia

- **Decisão**: entram os itens ativos da data com resultado `pendente`, cuja tarefa está ativa e
  não cancelada. Tarefas concluídas continuam no dia, riscadas. A próxima é o primeiro item, na
  ordem, cuja tarefa está aberta.
- **Tempos**: planejado = soma dos tempos estimados das tarefas do dia (vazio conta zero); feito =
  soma das concluídas.

## 4. Pendências

- **Decisão**: pendência = item ativo de data anterior a hoje, com resultado `pendente`, cuja
  tarefa está ativa e aberta. Se a mesma tarefa estiver pendente em vários dias, aparece uma vez,
  com a data mais recente.
- **Destinos** (`decidirPendencia(tarefaId, destino, hoje)`), gravados em uma única escrita:
  - `remarcar` para uma data (hoje ou depois): os itens pendentes de dias anteriores viram
    `remarcada`, e a tarefa entra no fim do plano da nova data, se ainda não estiver lá.
  - `devolver`: os itens viram `devolvida`; a tarefa continua aberta, sem data.
  - `cancelar`: os itens viram `cancelada`, e a tarefa fica cancelada (RN11). Como envolve duas
    coleções, a escrita grava `itensDia` e `tarefas` juntas.
- **Remarcar todas**: `remarcarTodasPara(hoje)` aplica `remarcar` a todas, na ordem em que estavam,
  em uma única escrita.
- **Erros novos**: `data_passada` (remarcar para antes de hoje) e `nao_e_pendencia` (a tarefa não
  tem pendência, por exemplo, porque outra aba já decidiu).

## 5. Tirar do dia

- **Decisão**: tirar do dia arquiva o item (RN31). A tarefa não muda. Adicionar a tarefa de novo no
  mesmo dia cria outro item.
- **Unicidade**: ao adicionar, o serviço ignora tarefas que já têm item ativo e pendente na data
  (FR-003). Remarcar faz o mesmo na data de destino.

## 6. Reordenar

- **Decisão**: `@dnd-kit/core` e `@dnd-kit/sortable`, previstos no `docs/plan.md` para a T011, com o
  sensor de teclado (espaço pega, setas movem, espaço solta), que cumpre o "pelo teclado" do
  FR-004. O serviço recebe a nova ordem completa (`reordenar(data, idsDosItens)`) e regrava `ordem`
  de 0 em diante, em uma única escrita.
- **Alternativas**: botões de subir e descer em cada linha, mais lentos para listas maiores, e o
  arrastar nativo do HTML, sem suporte a teclado.

## 7. Data de hoje

- **Decisão**: um hook `useHoje()` devolve a data no fuso `America/Sao_Paulo` (função `hoje()` de
  `src/i18n/datas.ts`) e a recalcula quando a janela volta a ficar visível ou recebe foco, e na
  virada do dia, com um temporizador até a meia-noite seguinte.
- **Motivo**: o app costuma ficar aberto de um dia para o outro (FR-020).

## 8. Adicionar tarefas

- **Decisão**: um diálogo com busca pelo título e caixas de marcar, que lista as tarefas abertas e
  ativas que não estão no dia, na ordem da lista de tarefas. "Adicionar (n)" grava todas de uma
  vez, no fim do dia.

## 9. Concluir no dia

- **Decisão**: a tela Hoje usa as mesmas ações da tela Tarefas (`useAcoesTarefas` e
  `ConfirmarSubtarefas`), inclusive a confirmação de subtarefas abertas (FR-009).

## 10. Testes

- **Decisão**: testes Vitest do serviço de itens do dia: plano (ordem, próxima, tempos, tarefas
  concluídas e canceladas), adicionar sem repetir, tirar, reordenar, pendências (definição, data
  mais recente, tarefas já resolvidas), cada destino, remarcar todas, erros e escrita sem efeito
  parcial. As telas são validadas pelo `quickstart.md`.
