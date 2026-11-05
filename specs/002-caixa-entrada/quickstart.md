# Validação: Caixa de entrada

Roteiro para conferir a feature no navegador. As regras estão em
[contracts/servico-itens-caixa.md](contracts/servico-itens-caixa.md) e a tela em
[contracts/interface.md](contracts/interface.md).

## Preparação

```bash
cd system-onPath-web-front
npm install
npm test             # inclui __tests__/caixa.test.ts
npm run typecheck
npm run dev          # http://localhost:5173
```

## Cenários

### 1. Anotar só com texto (história 1, SC-001 e SC-002)

1. Abra `/caixa`. O campo de anotação está com o foco.
2. Digite "Ligar para o banco" e aperte Enter. O item aparece no topo, e o campo fica vazio e
   com o foco.
3. Sem tocar no mouse, anote mais 4 itens. Os 5 aparecem, do mais novo para o mais antigo.
4. Digite só espaços e aperte Enter. Nada é criado.
5. Digite uma linha, aperte Shift+Enter, digite outra e aperte Enter. O item mostra as duas
   linhas.
6. Recarregue a página. Os itens continuam lá, e o menu mostra o contador.

### 2. Descartar e recuperar (história 2, SC-003 e SC-007)

1. Descarte um item. Ele some da lista, o contador diminui e aparece "Item descartado" com
   "Desfazer".
2. Clique em "Desfazer". O item volta na mesma posição.
3. Descarte de novo e espere o aviso sumir. Abra a aba Descartados: o item está lá, com a data.
4. Clique em "Recuperar". O item volta para a aba Caixa.
5. Descarte um item, exporte uma cópia em Ajustes e confira que ele está no arquivo, com
   `"status": "descartado"`.

### 3. Editar (história 3)

1. Clique em editar em um item, mude o texto e aperte Enter. O texto novo aparece na mesma
   posição e continua depois de recarregar.
2. Edite, aperte Esc. O texto anterior volta.
3. Edite, apague tudo e aperte Enter. O texto anterior é mantido.

### 4. Anotar de qualquer tela (história 4, SC-006)

1. Abra `/projetos`. Aperte Ctrl+K. O campo rápido abre com o foco.
2. Digite "Ideia rápida" e aperte Enter. O campo fecha, aparece "Anotado na caixa", a tela
   continua em Projetos e o contador do menu aumenta.
3. Clique no botão "Anotar" do menu, digite algo e aperte Esc. Nada é criado.
4. Com o campo aberto, aperte Ctrl+K de novo. Não abre um segundo campo.
5. Na própria Caixa, anote pelo Ctrl+K. O item aparece no topo da lista.

### 5. Erro ao salvar (casos-limite e FR-019)

1. No console do navegador, encha o `localStorage` até o limite ou bloqueie o armazenamento do
   site.
2. Tente anotar. Aparece um aviso dizendo o que aconteceu e o que fazer, e o texto continua no
   campo.

### 6. Muitos itens (SC-005)

1. Crie 500 itens pelo console, com o serviço, ou importe uma cópia com 500 itens.
2. Abra a Caixa e role a lista. Não há atraso perceptível.

### 7. Regras da constituição

```bash
cd system-onPath-web-front
grep -rn "dados/local" src/telas src/components src/features   # sem resultado
grep -rnE "#[0-9a-fA-F]{3,6}" src/telas src/components src/features   # sem resultado
grep -rnE "\-\[(#|rgb|hsl|oklch)" src   # sem resultado
```

## Resultado esperado

Todos os cenários passam, os testes passam e o TypeScript não acusa erros.
