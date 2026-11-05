# Validação: Áreas, metas e grupos

Regras em [contracts/servicos.md](contracts/servicos.md) e tela em
[contracts/interface.md](contracts/interface.md).

## Preparação

```bash
cd system-onPath-web-front
npm install
npm test             # inclui __tests__/areas.test.ts
npm run typecheck
npm run dev          # http://localhost:5173/areas
```

## Cenários

### 1. Áreas (história 1, SC-001 a SC-003)

1. Abra `/areas`. As seis áreas aparecem na ordem, com o resumo.
2. Crie "Família" com um tom. Ela aparece no fim e já é oferecida no formulário de tarefa.
3. Tente criar "familia": o nome repetido é recusado.
4. Mova "Família" para o topo pelo teclado. Recarregue e confira a ordem também no filtro de área
   da tela Tarefas.
5. Arquive "Família" (sem itens): sai sem confirmação; use Desfazer.
6. Arquive "Trabalho": aparece a confirmação com as contagens. Confirme e recupere pela seção de
   arquivadas.

### 2. Metas (história 2)

1. Na área Faculdade, crie uma meta sem título: erro. Crie "Entregar o TCC" com prazo de ontem:
   aparece atrasada.
2. Conclua a meta: ela vai para o fim. Reative.
3. Exclua a meta e desfaça.

### 3. Grupos (história 3, SC-004 e SC-005)

1. Na área Pessoal, o grupo Pessoal mostra "2 de 2 ativos".
2. Mude o limite para 1: aparece "Acima do limite". Mude para 3: "2 de 3 ativos".
3. Tente limite -1 e nome vazio: erro.
4. Crie o grupo "Freelas" com limite 1 e arquive-o. Tente arquivar o grupo Pessoal: recusado.

### 4. Regras da constituição

```bash
cd system-onPath-web-front
grep -rn "dados/local" src/telas src/components src/features   # sem resultado
grep -rnE "#[0-9a-fA-F]{3,6}" src/telas src/components src/features   # sem resultado
grep -rnE "\-\[(#|rgb|hsl|oklch)" src   # sem resultado
```
