# Validação: Projetos

## Preparação

```bash
cd system-onPath-web-front
npm test             # inclui __tests__/projetos.test.ts
npm run typecheck
npm run dev          # http://localhost:5173/projetos
```

## Cenários

### 1. Visão por grupo (história 1)

1. Abra `/projetos`. Servioeste mostra "1 de 1 ativo", RookMTR em ativos com "Sem próxima ação" e a
   fila App do Edu, App do Matheus, App do RH.
2. Crie "App da Loja" em Servioeste: entra no fim da fila.
3. Leve "App da Loja" ao topo da fila pelo teclado e recarregue.
4. Filtre por área Pessoal e por status Fila.
5. Edite o limite de Coronel para 2 na própria tela.

### 2. Ativar com as regras (história 2)

1. Ative "App do Edu": recusa por grupo cheio, com RookMTR listado. Pause RookMTR: App do Edu tenta
   ativar e pede a próxima ação.
2. Crie a tarefa no pedido: App do Edu fica ativo.
3. Em Tarefas, conclua a única tarefa de App do Edu: aparece "ficou sem próxima ação".
4. Conclua um projeto, reabra (volta ao fim da fila); devolva um pausado à fila.

### 3. Detalhe (história 3)

1. Abra "TCC / RookHub": dados e tarefas. Crie duas tarefas pelo detalhe; conclua uma.
2. Mude o prazo e a descrição; recarregue.
3. Mude o projeto para um grupo de outra área: as tarefas passam para a área nova (confira em
   Tarefas).
4. Exclua o projeto e desfaça.

### 4. Regras da constituição

```bash
grep -rn "dados/local" src/telas src/components src/features   # sem resultado
grep -rnE "#[0-9a-fA-F]{3,6}" src/telas src/components src/features   # sem resultado
grep -rnE "\-\[(#|rgb|hsl|oklch)" src   # sem resultado
```
