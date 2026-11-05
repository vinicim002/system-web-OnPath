# Modelo de dados: Kanban

Nenhum campo novo. Usa `colunas` (projetoId, nome, ordem, final) e `tarefas.colunaId`.

## Regras que valem sempre

1. No máximo uma coluna final ativa por projeto.
2. `tarefa.colunaId` só existe em tarefa principal de projeto e aponta para coluna ativa do mesmo
   projeto.
3. Tarefa na coluna final ⇒ concluída. Tarefa de projeto com coluna final que é concluída ⇒ vai para
   a final.
4. Reaberta ⇒ sai da coluna final para a primeira coluna não final (ou nenhuma).
5. Nome da coluna obrigatório e único entre as ativas do projeto.
