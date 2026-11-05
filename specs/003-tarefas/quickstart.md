# Validação: Tarefas

Regras em [contracts/servico-tarefas.md](contracts/servico-tarefas.md) e tela em
[contracts/interface.md](contracts/interface.md).

## Preparação

```bash
cd system-onPath-web-front
npm install
npm test             # inclui __tests__/tarefas.test.ts
npm run typecheck
npm run dev          # http://localhost:5173/tarefas
```

## Cenários

### 1. Criar com as regras (história 1, SC-001 e SC-002)

1. Clique em "Nova tarefa" e salve vazio. Título, área, prioridade e tempo mostram o erro.
2. Preencha título, prioridade e tempo, escolha "Avulsa" e uma área. Salve. A tarefa aparece.
3. Crie outra ligada a um projeto. A área vem do projeto e fica travada.
4. A prioridade só oferece alta, média e baixa.

### 2. Lista, filtros e painel (história 2, SC-006)

1. Filtre por área, projeto ("Avulsas" inclusive), prioridade e status, um de cada vez e
   combinados. Recarregue a página: os filtros continuam.
2. Conclua uma tarefa pelo círculo. Ela sai das abertas e aparece em "Concluídas". Reabra.
3. Clique em uma tarefa. O painel abre ao lado, com a lista visível. Mude o título e salve.
4. Dê um prazo de ontem a uma tarefa aberta. Ela aparece como atrasada.
5. Cancele uma tarefa. Exclua outra e use "Desfazer".

### 3. Subtarefas (história 3, SC-003 a SC-005)

1. No painel, crie uma subtarefa só com o título e, dentro dela, outra.
2. Mude a prioridade e o projeto da principal. As subtarefas acompanham.
3. Na subtarefa, os campos herdados aparecem só para leitura.
4. Tente mover a principal para dentro da subtarefa. Aparece o erro, e nada muda.
5. Conclua a principal com subtarefas abertas. Confirme: todas ficam concluídas.
6. Exclua a principal e desfaça: a árvore inteira volta.
7. Mova uma subtarefa para o topo. O app pede o tempo estimado.

### 4. Item da caixa vira tarefa (história 4, SC-007)

1. Anote na caixa "Revisar contrato\nver cláusula 3".
2. Clique em "Virar tarefa". O título vem "Revisar contrato", e as anotações, o texto inteiro.
3. Salve sem prioridade: o erro aparece e o item continua na caixa.
4. Complete e salve. O item sai da caixa (e não está nos descartados). Clique em "Ver tarefa".
5. Abra o formulário a partir de outro item e cancele: o item continua na caixa.

### 5. Muitas tarefas (SC-006)

Com 500 tarefas criadas pelo serviço, no build de produção (`npm run build && npm run preview`),
filtrar e concluir aparecem em menos de 100 ms.

### 6. Regras da constituição

```bash
cd system-onPath-web-front
grep -rn "dados/local" src/telas src/components src/features   # sem resultado
grep -rnE "#[0-9a-fA-F]{3,6}" src/telas src/components src/features   # sem resultado
grep -rnE "\-\[(#|rgb|hsl|oklch)" src   # sem resultado
```
