# OnPath — Especificação da V0.1.0

> Define **o que** construir e **por quê**. O **como** está em `plan.md`, e a ordem em `tasks.md`.
> OnPath é o nome provisório. Atualizado em 2026-11-05.

## 1. Objetivo

O OnPath é um app para organizar a vida inteira em um só lugar e responder: **o que eu devo fazer agora?**

O usuário tem muitos projetos, TCC, matérias atrasadas, estudos, trabalho, academia e vida pessoal. Falta saber por onde começar, quando terminar e o que vem depois. A V0.1.0 é para uso próprio, mas deve permitir abrir o app ao público no futuro.

## 2. Escopo da V0.1.0

### Entra

- Fase 1 completa: Hoje, Caixa de entrada, Áreas e metas, Projetos, Tarefas, Kanban, Agenda, Rotinas e Estudos.
- Interface para computador, como app web no navegador.
- Construção front-end primeiro: as telas funcionam com dados locais, e o back-end começa depois da revisão.
- Execução local, sem gastos com servidor.
- Login com conta Google.
- Consulta do plano do dia sem conexão.
- Lembretes de compromissos, rotinas e blocos de tempo.
- Visual minimalista em preto e branco.
- Português, com textos separados do código.

### Fica fora

| Item | Quando |
|---|---|
| Revisões guiadas, IA conselheira, diário de decisões e Google Agenda | Fase 2 |
| Finanças, com lançamentos manuais | Fase 3 |
| Versão pública | Fase 3 |
| App para celular | Depois da V0.1.0 |
| Discord | Em espera até surgir um caso real |
| Equipes e projetos compartilhados | Fora do escopo atual |
| Conexão automática com bancos | Fora do escopo atual |
| Gamificação | Fora do escopo atual |
| Editor de notas avançado | Fora do escopo atual |
| Arquivos e PDFs em Estudos | Fora do escopo atual |

## 3. Conceitos

| Conceito | Definição |
|---|---|
| Área | Parte da vida, como Faculdade, Trabalho, Estudos, Saúde, Pessoal e Finanças |
| Meta | Objetivo de uma área |
| Grupo | Conjunto de projetos de uma área, com limite próprio de ativos |
| Projeto | Trabalho com prazo, prioridade, status e tarefas |
| Fila | Ordem dos projetos que aguardam uma vaga |
| Coluna | Etapa do Kanban de um projeto |
| Tarefa | Ação a fazer, ligada a projeto, matéria ou avulsa |
| Item da caixa | Ideia ainda não organizada |
| Item do dia | Tarefa escolhida para uma data |
| Rotina | Atividade recorrente, com horário ou meta de horas |
| Compromisso | Evento com hora marcada |
| Bloco de tempo | Horário reservado na agenda |
| Matéria | Assunto em estudo |
| Tópico | Parte de uma matéria |
| Material | Resumo ou link |
| Sessão de estudo | Período de estudo planejado ou realizado |

## 4. Regras de negócio

As regras marcadas como **Fase 2** ficam registradas, mas não são implementadas na V0.1.0.

| Código | Regra |
|---|---|
| RN01 | Todo projeto, meta e matéria pertence a uma única área da vida. Todo grupo pertence a uma área, e seus projetos ficam na área do grupo. |
| RN02 | Toda tarefa pertence a um projeto, a uma matéria ou à lista de avulsas. |
| RN03 | Um item na caixa de entrada não precisa de data, área ou prioridade. |
| RN04 | Agenda, checklist e Kanban exibem a mesma tarefa, nunca uma cópia. |
| RN05 | Um projeto está sempre em um status: fila, ativo, pausado, concluído ou cancelado. |
| RN06 | Cada grupo tem um limite próprio de projetos ativos. |
| RN07 | Para ativar um projeto além do limite, outro projeto do grupo precisa ser pausado ou concluído. |
| RN08 | Todo projeto ativo precisa ter pelo menos uma próxima ação definida. |
| RN09 | Dois blocos de tempo não podem ocupar o mesmo horário sem confirmação. |
| RN10 | O plano do dia não pode ultrapassar o tempo livre sem um aviso. |
| RN11 | Nenhuma pendência fica sem destino na revisão do dia: ela é remarcada, volta à fila ou é cancelada. A revisão guiada é da Fase 2; a V0.1.0 cumpre a regra pela RN25. |
| RN12 | Uma sessão de estudo planejada aparece na agenda e ocupa tempo do dia. |
| RN13 | **Fase 2.** A IA pode sugerir, mas só altera dados depois da aprovação do usuário. |
| RN14 | **Fase 2.** Toda sugestão da IA informa o motivo e os dados usados. |
| RN15 | **Fase 2.** Toda decisão feita com a IA fica registrada com opções, escolha e motivo. |
| RN16 | **Fase 2.** O usuário pode desligar o acesso da IA a uma área. |
| RN17 | Cada conta tem acesso somente aos próprios dados. |
| RN18 | Quando um horário da rotina é perdido, o app propõe um novo horário, e o usuário aceita ou recusa. |
| RN19 | Matérias não contam no limite de projetos ativos. |
| RN20 | Na primeira versão da tela Hoje, o app lista as tarefas escolhidas para o dia e destaca a próxima. |
| RN21 | Toda prioridade de tarefa é alta, média ou baixa. |
| RN22 | Cada projeto começa sem colunas de Kanban, e o usuário cria as próprias. |
| RN23 | O banco de dados tem backup automático diário fora do servidor quando estiver na VPS. Em ambiente local, o backup é manual. |
| RN24 | Toda tarefa exige título, área, prioridade e tempo estimado. Itens na caixa de entrada seguem livres. |
| RN25 | Se uma tarefa do dia não for feita, o app pergunta o que fazer quando for aberto no dia seguinte. |
| RN26 | A ordem da fila é manual na fase 1. Depois, a IA sugere, e o usuário aprova. |
| RN27 | **Fase 2.** A IA só vê títulos, prazos e status dos projetos da Servioeste. |
| RN28 | Uma rotina com meta de horas pode ser dividida em vários blocos, e o app soma o total do dia. |
| RN29 | Tarefas sem projeto aparecem só no checklist e na tela Hoje, não no Kanban. |
| RN30 | Uma tarefa pode ter subtarefas em vários níveis. |
| RN31 | Excluir um item o arquiva, e ele pode ser recuperado. |
| RN32 | Uma tarefa é concluída ao ser movida para a coluna final do projeto ou ao ser marcada como feita em qualquer tela. |
| RN33 | Uma subtarefa exige só o título e herda área e prioridade da tarefa principal. |

## 5. Dados iniciais

Criados no primeiro login ou por um script de carga, sempre editáveis.

### Áreas

Faculdade, Trabalho, Estudos, Saúde, Pessoal e Finanças.

### Grupos

| Grupo | Área | Limite de ativos |
|---|---|---|
| Servioeste | Trabalho | 1 |
| Faculdade | Faculdade | 1 |
| Zona Sul | Trabalho | 1 |
| Coronel | Trabalho | 1 |
| Pessoal | Pessoal | 2 |

### Projetos

| Projeto | Grupo | Status |
|---|---|---|
| TCC / RookHub | Faculdade | Ativo |
| Zona Sul | Zona Sul | Ativo, urgente |
| RookMTR | Servioeste | Ativo |
| OnPath | Pessoal | Ativo |
| Portfólio | Pessoal | Ativo |
| App do Edu | Servioeste | Fila |
| App do Matheus | Servioeste | Fila |
| App do RH | Servioeste | Fila |
| CRO | Coronel | Fila |
| App de seminário | Coronel | Fila |

### Rotina

| Atividade | Quando |
|---|---|
| Acordar | 7h30 |
| Trabalho, segunda e quarta | 8h–12h, 13h–15h e 16h30–19h |
| Trabalho, terça e quinta | 9h–12h, 13h–15h e 16h30–20h |
| Trabalho, sexta | 13h–15h e 16h30–20h30 |
| Aula | Sexta, das 8h às 12h |
| Estudo por conta própria | Segunda a quinta, com meta de horas por dia, sem horário fixo |
| Almoço | 12h |
| Academia | 15h |
| Sono | 23h |

O trabalho soma 40 horas por semana, mas a carga vai cair para 6 horas por dia, em horários ainda não definidos. A grade pode mudar com o uso, e o fim de semana ainda não foi definido.

## 6. Telas e critérios de aceite

Ao lado esquerdo, um menu fixo leva a todas as telas principais. O detalhe da tarefa abre em um painel lateral, sem sair da tela atual.

### 6.1 Login

> 2026-11-05: uma tela de login só visual foi adiantada para a Parte 1 (constituição 1.3.0). Ela
> tem e-mail, senha e um botão de acesso rápido, mas não autentica nem bloqueia as rotas. O login
> com Google e os critérios abaixo continuam nas T036 e T038.

- [ ] Sem sessão, qualquer rota leva ao login.
- [ ] O usuário entra com a conta Google.
- [ ] No primeiro login, os dados iniciais são criados uma única vez.
- [ ] O usuário consegue sair da conta.

### 6.2 Caixa de entrada

- [x] Um item é criado só com texto (RN03).
- [x] A captura funciona com poucos cliques, sem abrir outra tela.
- [ ] Um item pode virar tarefa, projeto, compromisso ou material.
- [x] Um item pode ser descartado e recuperado (RN31).
- [x] Ao virar tarefa, os campos da RN24 são exigidos.

### 6.3 Tarefas

- [x] A lista filtra por área, projeto, matéria, prioridade e status.
- [x] Criar uma tarefa sem título, área, prioridade ou tempo estimado é recusado com erro claro (RN24).
- [x] Prioridade aceita somente alta, média ou baixa (RN21).
- [x] Uma tarefa pode ser projeto, matéria ou avulsa (RN02).
- [x] Subtarefas aceitam vários níveis e exigem só título (RN30 e RN33).
- [x] Concluir uma tarefa atualiza todas as telas (RN04 e RN32).

### 6.4 Hoje

- [ ] É a tela inicial depois do login.
- [ ] Lista as tarefas do dia na ordem escolhida, com a próxima em destaque (RN20).
- [ ] O usuário adiciona, remove e reordena tarefas.
- [ ] Mostra rotinas, compromissos e blocos do dia em ordem de horário.
- [ ] Avisa quando o tempo planejado passa do tempo livre, sem bloquear (RN10).
- [ ] Ao abrir no dia seguinte, pergunta o destino de cada tarefa pendente: remarcar, devolver à lista ou cancelar (RN25).
- [ ] Sem conexão, exibe a última versão salva do dia em modo leitura e informa isso.

### 6.5 Áreas e metas

- [ ] O usuário cria, edita, ordena e arquiva áreas.
- [ ] Uma meta pertence a uma área e tem status e prazo opcional.
- [ ] Arquivar uma área com itens ativos pede confirmação.

### 6.6 Projetos

- [ ] Mostra os projetos por área, grupo e status, com vagas usadas e limite (RN01, RN05 e RN06).
- [ ] A ordem da fila é definida arrastando os projetos (RN26).
- [ ] Ativar um projeto em grupo cheio é recusado, com opção de pausar ou concluir outro (RN07).
- [ ] Ativar um projeto sem tarefa aberta é recusado, com pedido de definir a próxima ação (RN08).
- [ ] Concluir a última tarefa aberta de um projeto ativo avisa que falta uma próxima ação.
- [ ] O usuário edita grupos e limites nesta tela.

### 6.7 Detalhe do projeto

- [ ] Mostra dados, tarefas e Kanban.
- [ ] Um projeto novo começa sem colunas (RN22).
- [ ] O usuário cria, renomeia, ordena e arquiva colunas, e marca uma como final.
- [ ] Mover uma tarefa para a coluna final a conclui (RN32).
- [ ] Marcar uma tarefa como feita a move para a coluna final, se existir.
- [ ] Tarefas avulsas ou de matérias não aparecem no Kanban (RN29).

### 6.8 Rotinas

- [ ] Uma rotina pode ter dias e horário, ou meta de horas.
- [ ] Uma rotina com meta aceita vários blocos, e o app soma o total do dia (RN28).
- [ ] Alterar uma rotina muda apenas os blocos futuros.

### 6.9 Agenda

- [ ] A visão principal é semanal e mostra compromissos e blocos de tempo.
- [ ] O usuário cria blocos para tarefas, rotinas e sessões de estudo.
- [ ] Criar um bloco em horário ocupado exige confirmação (RN09).
- [ ] O usuário cria, edita e arquiva compromissos.
- [ ] Um bloco de rotina não realizado no horário gera uma proposta de novo horário (RN18).
- [ ] Lembretes são exibidos antes de compromissos, rotinas e blocos.

### 6.10 Estudos

- [ ] Lista as matérias, que ficam fora do limite de projetos (RN19).
- [ ] O usuário cria, edita e arquiva matérias.

### 6.11 Detalhe da matéria

- [ ] Mostra tópicos, materiais, tarefas e sessões.
- [ ] Um material é um resumo ou um link.
- [ ] Uma sessão planejada ocupa um bloco na agenda (RN12).
- [ ] Ao terminar, o usuário registra duração, assunto e anotações.

### 6.12 Ajustes

- [ ] O usuário define seu fuso horário e sua janela do dia, usada para calcular o tempo livre.
- [ ] O usuário ativa os lembretes.
- [ ] O usuário vê e recupera itens arquivados.

## 7. Requisitos gerais

- **Privacidade:** cada usuário acessa somente os próprios dados (RN17).
- **Horários:** o app guarda datas em UTC e exibe no fuso do usuário.
- **Mensagens:** todo erro informa o que aconteceu e o que fazer.
- **Visual:** preto, branco e tons de cinza, com cor só em gráficos e ícones. Logo e pequenos detalhes podem puxar para o roxo. A fonte sugerida é a Inter.
- **Idioma:** textos em português, separados do código.

## 8. Definição de pronto

A V0.1.0 está pronta quando todos os módulos da fase 1 estiverem construídos e os critérios de aceite deste documento forem cumpridos.

## 9. Pontos em aberto

- Meta de horas por dia do estudo por conta própria.
- Novos horários de trabalho, com carga de 6 horas por dia.
- Uso do fim de semana.
- Antecedência dos lembretes. Proposta: 10 minutos.
