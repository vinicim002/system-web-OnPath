# Pesquisa: Tarefas

Decisões da Fase 0. A base técnica vem das features 001 e 002 e não muda aqui.

## 1. Campo de anotações

- **Decisão**: a entidade `tarefas` ganha `anotacoes`, texto opcional, guardado como `null`
  quando vazio.
- **Motivo**: a conversão de um item da caixa com várias linhas precisa guardar o texto inteiro
  (história 4, cenário 5), e o usuário precisa de um lugar para detalhes da tarefa.
- **Compatibilidade**: o campo é opcional e tem `null` como padrão. Dados já gravados e cópias
  exportadas antes desta etapa continuam válidos, sem migração e sem mudar a versão da cópia.

## 2. Onde ficam as regras

- **Decisão**: um serviço próprio, `ServicoTarefas`, que estende o serviço comum de coleção, como
  o da caixa (feature 002). Ele valida a RN24 para tarefas principais, deriva a área do projeto
  ou da matéria, propaga a herança para as subtarefas, bloqueia ciclos, conclui, reabre,
  cancela, arquiva a árvore inteira e converte itens da caixa.
- **Motivo**: princípio IV. A API da Parte 2 cumpre o mesmo contrato, e as telas não mudam.
- **Alternativas**: validar no formulário. Isso deixaria o serviço aceitar tarefas inválidas e
  repetiria a regra em cada tela que cria tarefas (Hoje, Kanban, Caixa).

## 3. RN24 só para a tarefa principal

- **Decisão**: no esquema, `tempoEstimadoMin` continua opcional, porque a subtarefa pode não ter
  (RN33). O serviço exige o tempo quando `tarefaPaiId` é vazio, ao criar, editar ou mover uma
  subtarefa para o topo.
- **Erros**: faltando campos, o serviço devolve `dados_invalidos` com a lista `campos`. O
  formulário usa essa lista para mostrar a mensagem de cada campo.

## 4. Herança e vínculo

- **Decisão**: a subtarefa grava a área, a prioridade, o projeto e a matéria da tarefa do topo.
  Toda mudança desses campos na tarefa do topo é copiada para a árvore inteira na mesma escrita.
  Nas subtarefas, o serviço ignora mudanças desses campos.
- **Motivo**: gravar os valores, em vez de calcular na leitura, mantém filtros e listas simples
  (filtrar por área funciona igual para tarefas e subtarefas) e a API da Parte 2 recebe os
  campos prontos. A propagação na mesma escrita garante o SC-004.

## 5. Ciclos

- **Decisão**: ao mudar `tarefaPaiId`, o serviço sobe a cadeia de pais a partir do novo pai. Se
  encontrar a própria tarefa, recusa com o erro novo `ciclo_subtarefa`. Um pai inexistente ou
  arquivado dá `dados_invalidos` no campo `tarefaPaiId`.

## 6. Concluir com subtarefas abertas

- **Decisão**: `concluir(id)` recusa com o erro novo `subtarefas_abertas` (com a quantidade nos
  detalhes) quando há descendentes abertos. `concluir(id, { incluirSubtarefas: true })` conclui a
  tarefa e os descendentes abertos na mesma escrita. A tela pede a confirmação ao receber o erro.
- **Motivo**: a regra de confirmar fica no serviço. Uma tela futura (Hoje ou Kanban) que esquecer
  de confirmar recebe o erro, em vez de concluir sem perguntar.

## 7. Gravar vários registros de uma vez

- **Decisão**: o serviço local de coleção ganha `gravarVarios`, que altera vários registros em
  uma única escrita, com validação de todos antes de gravar. A conversão da caixa usa a escrita
  do armazenamento com duas coleções (`tarefas` e `itensCaixa`) ao mesmo tempo, que já é atômica
  desde a feature 001.
- **Motivo**: herança, arquivamento da árvore e conclusão em lote não podem ficar pela metade
  (FR-024 e casos-limite).

## 8. Filtros e ordem

- **Decisão**: o contrato tem `listar(filtros)`, com área, projeto, matéria, prioridade e
  status. A implementação local filtra e ordena em memória (prioridade, prazo e criação). A
  tela guarda os filtros e a tarefa aberta no endereço (`/tarefas?status=aberta&tarefa=…`).
- **Motivo**: com a API, os filtros viram parâmetros da consulta sem mudar a tela. No endereço,
  os filtros sobrevivem a recarregar a página, e o aviso da Caixa pode levar direto à tarefa
  criada.
- **Árvore**: um filtro vale para as tarefas principais. As subtarefas aparecem sob a principal,
  e uma subtarefa que atenda ao filtro mostra a principal dela, para não perder o contexto.

## 9. Formulário

- **Decisão**: `react-hook-form` com `@hookform/resolvers` e Zod, como previsto no `docs/plan.md`
  para a T009, mais os componentes `select` e `checkbox` do shadcn/ui. Um só componente,
  `FormularioTarefa`, serve para criar, editar no painel e converter um item da caixa.
- **Motivo**: o formulário tem muitos campos com regras que dependem uns dos outros (vínculo e
  área). O Zod valida no navegador com as mesmas mensagens, e o serviço continua sendo a regra
  final.

## 10. Painel lateral

- **Decisão**: a tela é dividida em duas colunas: a lista à esquerda e, quando há uma tarefa
  aberta, o painel à direita, sem cobrir a lista. O painel fecha com Esc ou pelo botão de
  fechar.
- **Alternativas**: o `Sheet` do shadcn/ui, que cobre a lista com uma camada escura e contraria a
  seção 6 de `docs/spec.md` ("sem sair da tela atual").

## 11. Atrasadas

- **Decisão**: uma tarefa aberta está atrasada quando o prazo é anterior à data de hoje no fuso
  `America/Sao_Paulo`. A regra fica em `src/dados/regrasTarefas.ts`, e a data de hoje vem de
  `src/i18n/datas.ts`.

## 12. Desempenho

- **Decisão**: as ações da lista são criadas uma vez e as linhas são memorizadas, como na Caixa
  (feature 002, item 10). Meta: 500 tarefas com filtro e conclusão em menos de 100 ms (SC-006).
- **Medição (T026)**: com 507 tarefas no build de produção, concluir levou de 36 a 50 ms, e
  trocar o filtro, de 14 a 37 ms.

## 13. Testes

- **Decisão**: testes Vitest do serviço de tarefas: RN24, RN21, RN02, área derivada, herança,
  propagação, ciclos, conclusão com e sem subtarefas, reabrir, cancelar, arquivar e recuperar a
  árvore, filtros, ordem e conversão da caixa (inclusive a falha sem efeito parcial). As telas
  são validadas pelo `quickstart.md`.
