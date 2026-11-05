# Validação: Kanban

```bash
cd system-onPath-web-front
npm test             # inclui __tests__/kanban.test.ts
npm run dev          # http://localhost:5173/projetos/<id>
```

1. **Colunas** (história 1): num projeto, abra "Kanban": sem colunas. Crie "A fazer", "Fazendo",
   "Revisão" e "Feito"; em "Editar colunas", renomeie "Revisão", mova "Feito" para o fim pelo
   teclado, marque "Feito" como final e arquive "Revisão"; desfaça.
2. **Arrastar** (história 2): crie tarefas nas colunas; arraste uma para "Fazendo" e depois para
   "Feito" (fica concluída em Tarefas e Hoje); arraste de volta (reaberta). Tarefas avulsas não
   aparecem. Uma tarefa com subtarefa aberta pede confirmação ao entrar em "Feito".
3. **Qualquer caminho** (história 3): conclua em Hoje uma tarefa do projeto (vai para "Feito");
   reabra em Tarefas (volta para "A fazer").
4. **Constituição**: os três greps sem resultado.
