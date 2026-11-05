# Validação: Hoje

Regras em [contracts/servico-itens-dia.md](contracts/servico-itens-dia.md) e tela em
[contracts/interface.md](contracts/interface.md).

## Preparação

```bash
cd system-onPath-web-front
npm install
npm test             # inclui __tests__/itensDia.test.ts
npm run typecheck
npm run dev          # http://localhost:5173
```

## Cenários

### 1. Montar o dia (história 1, SC-001 a SC-003)

1. Abra `/`. A tela Hoje aparece com a data de hoje e a mensagem de dia vazio.
2. Em "Adicionar tarefas", busque e marque três tarefas. Elas entram no fim do dia; a primeira
   aparece como "Próxima".
3. Abra o diálogo de novo: as três não aparecem mais na lista.
4. Arraste a terceira para o topo. Depois, com o teclado: foco na alça, espaço, seta para cima,
   espaço. Recarregue: a ordem continua.
5. Tire uma tarefa do dia. Ela continua aberta em Tarefas.

### 2. Fazer as tarefas (história 2, SC-006)

1. Conclua a próxima. Ela fica riscada e o destaque passa para a seguinte; o resumo de "Feito"
   aumenta.
2. Em Tarefas, conclua outra do dia. Volte para Hoje: ela aparece feita.
3. Reabra uma tarefa feita. Ela volta a contar como não feita.
4. Conclua todas: aparece "Tudo feito por hoje".
5. Cancele uma tarefa do dia em Tarefas: ela sai do dia.

### 3. Pendências (história 3, SC-004 e SC-005)

1. Com tarefas no dia, mude a data dos itens para ontem pelo console (ou espere o dia virar) e
   recarregue.
2. A revisão aparece no lugar do plano, e o menu mostra o número ao lado de Hoje.
3. Remarque uma para hoje, outra para depois de amanhã, devolva uma e cancele outra. Confira em
   Hoje e em Tarefas.
4. Repita com várias e use "Remarcar todas para hoje".
5. Tente remarcar para ontem pelo campo de data: não é aceito.

### 4. Regras da constituição

```bash
cd system-onPath-web-front
grep -rn "dados/local" src/telas src/components src/features   # sem resultado
grep -rnE "#[0-9a-fA-F]{3,6}" src/telas src/components src/features   # sem resultado
grep -rnE "\-\[(#|rgb|hsl|oklch)" src   # sem resultado
```
