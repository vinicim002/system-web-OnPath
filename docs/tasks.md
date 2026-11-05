# OnPath — Tarefas da V0.1.0

> Define **a ordem** de construção. Consulte `spec.md` para o que construir e `plan.md` para como construir.
> A construção é **front-end primeiro**: as telas funcionam com dados locais, e o back-end só começa depois da revisão.
> Atualizado em 2026-11-05.

## Como usar

1. Faça uma tarefa por vez, na ordem.
2. Antes de começar, leia os itens da `spec.md` citados nela.
3. Marque a tarefa só quando o critério **Pronto quando** for cumprido.
4. Se uma decisão mudar, atualize `spec.md` ou `plan.md` antes do código.
5. Nas telas, nenhuma regra ou chamada de dados fica no componente. Use a camada de dados da T003.

## Parte 1 — Front-end com dados locais

### Etapa 0 — Base do front-end

- [x] **T001: Criar o repositório.** Crie a estrutura de pastas e adicione `spec.md`, `plan.md` e `tasks.md` em `docs/`.
  - Pronto quando: existirem a pasta `system-web-onPath/`, com `system-onPath-web-front/`, `system-onPath-web-back/` e os documentos.
- [x] **T002: Criar o app base.** Configure o app web (React com Vite), rotas, tema preto e branco, textos separados e menu lateral.
  - Pronto quando: o menu navegar entre telas vazias no navegador.
- [x] **T003: Criar a camada de dados.** Defina os tipos e os serviços que as telas usam, com implementação local no navegador.
  - Pronto quando: as telas puderem trocar a implementação local pela API sem mudar seus componentes.
- [x] **T004: Carregar os dados iniciais.** Crie áreas, grupos, projetos e rotina da `spec.md`, seção 5.
  - Pronto quando: os dados aparecerem uma única vez, sem duplicar.
- [x] **T005: Exportar e importar dados.** Crie uma cópia em JSON dos dados locais.
  - Pronto quando: uma cópia exportada for restaurada em um navegador limpo.

### Etapa 1 — Caixa de entrada

- [x] **T006: Construir a tela da caixa.** Cubra a captura rápida, o descarte e a recuperação (RN03 e RN31).
  - Pronto quando: o usuário registrar uma ideia só com texto.

### Etapa 2 — Tarefas

- [x] **T007: Implementar as regras de tarefas.** Cubra RN02, RN21 e RN24 na camada de dados.
  - Pronto quando: uma tarefa inválida for recusada com erro claro.
- [x] **T008: Implementar subtarefas.** Permita vários níveis, herança e bloqueio de ciclos (RN30 e RN33).
  - Pronto quando: uma subtarefa herdar área e prioridade.
- [x] **T009: Construir a tela de Tarefas.** Inclua lista, filtros e painel lateral de detalhes.
  - Pronto quando: os critérios da seção 6.3 forem cumpridos.
- [x] **T010: Converter item da caixa em tarefa.** Abra o formulário da tarefa com o texto do item.
  - Pronto quando: o item convertido sair da caixa e virar tarefa.

### Etapa 3 — Hoje

- [x] **T011: Construir a tela Hoje.** Adicione, reordene e destaque a próxima tarefa (RN20).
  - Pronto quando: a tela abrir como inicial e destacar a próxima tarefa.
- [x] **T012: Tratar as pendências.** Pergunte o destino ao abrir o app no dia seguinte (RN11 e RN25).
  - Pronto quando: nenhuma pendência de dia anterior ficar sem destino.

> **Marco:** nesta etapa, o OnPath já pode organizar o seu dia. Comece a usar, exporte os dados com frequência e anote o que incomoda.

### Etapa 4 — Áreas, metas e grupos

- [x] **T013: Construir a tela de Áreas e metas.** Cubra a seção 6.5.
  - Pronto quando: os critérios de aceite forem cumpridos.
- [x] **T014: Permitir editar grupos.** Inclua nome e limite de ativos.
  - Pronto quando: um limite alterado passar a valer nos projetos.

### Etapa 5 — Projetos

- [x] **T015: Implementar as regras de projetos.** Cubra RN01, RN05, RN06, RN07, RN08 e RN26.
  - Pronto quando: ativar em um grupo cheio ou sem próxima ação for recusado.
- [x] **T016: Construir a tela Projetos.** Mostre grupos, vagas e fila.
  - Pronto quando: os critérios da seção 6.6 forem cumpridos.
- [x] **T017: Construir o Detalhe do projeto.** Mostre dados e tarefas.
  - Pronto quando: abrir um projeto mostrar suas tarefas.

### Etapa 6 — Kanban

- [x] **T018: Implementar colunas e conclusão.** Cubra RN22 e RN32, com uma coluna final por projeto.
  - Pronto quando: concluir por qualquer caminho atualizar todas as telas (RN04).
- [x] **T019: Construir o Kanban.** Arraste tarefas entre colunas e mantenha avulsas fora dele (RN29).
  - Pronto quando: os critérios da seção 6.7 forem cumpridos.

### Etapa 7 — Agenda e rotinas

- [X] **T020: Implementar blocos e conflitos.** Cubra RN09 na camada de dados.
  - Pronto quando: criar um bloco em horário ocupado exigir confirmação.
- [X] **T021: Implementar rotinas.** Inclua horário, meta e geração de blocos (RN28).
  - Pronto quando: as rotinas gerarem blocos sem duplicar.
- [X] **T022: Construir a tela Rotinas.** Cubra a seção 6.8.
  - Pronto quando: os critérios de aceite forem cumpridos.
- [X] **T023: Construir a tela Agenda.** Crie a visão semanal, os compromissos e os blocos.
  - Pronto quando: os critérios da seção 6.9 forem cumpridos.
- [X] **T024: Remarcar rotina perdida.** Proponha um novo horário (RN18).
  - Pronto quando: o usuário puder aceitar ou recusar a proposta.
- [X] **T025: Calcular o tempo livre.** Mostre o aviso de dia cheio na tela Hoje (RN10).
  - Pronto quando: o aviso aparecer sem bloquear.
- [X] **T026: Criar os lembretes.** Use as notificações do navegador.
  - Pronto quando: um lembrete aparecer com o app aberto.
- [ ] **T026a: Criar as visões da Agenda.** Board, Timeline, Lista e Tabela, com filtro.
  - Pronto quando: as cinco visões mostrarem a mesma semana filtrada.
- [ ] **T026b: Criar o painel de tarefas da Agenda.** Tarefas por prazo e eventos do dia.
  - Pronto quando: arrastar uma tarefa para a grade criar um bloco para ela.

### Etapa 8 — Estudos

- [ ] **T027: Construir a tela Estudos.** Cubra a seção 6.10 e a RN19.
  - Pronto quando: os critérios de aceite forem cumpridos.
- [ ] **T028: Construir o Detalhe da matéria.** Inclua tópicos, materiais e sessões (RN12).
  - Pronto quando: uma sessão planejada ocupar tempo na agenda.

### Etapa 9 — Conversões e ajustes

- [ ] **T029: Completar a caixa de entrada.** Converta itens em projeto, compromisso e material.
  - Pronto quando: todos os caminhos da seção 6.2 funcionarem.
- [ ] **T030: Construir a tela Ajustes.** Inclua fuso, janela do dia, lembretes e arquivados.
  - Pronto quando: os critérios da seção 6.12 forem cumpridos.

### Etapa 10 — Revisão antes do back-end

- [ ] **T031: Usar o app e revisar as telas.** Liste o que entra, muda ou sai.
  - Pronto quando: a lista de mudanças estiver decidida.
- [ ] **T032: Atualizar os documentos.** Ajuste `spec.md`, `plan.md` e o modelo de dados.
  - Pronto quando: os documentos refletirem o app real, e as tarefas da Parte 2 forem revisadas.

> **Marco:** front-end completo. O back-end só começa depois daqui.

## Parte 2 — Back-end e integração

Estas tarefas devem ser revisadas na T032, pois podem mudar com o uso das telas.

### Etapa 11 — Base do back-end

- [ ] **T033: Subir o banco local.** Crie o `docker-compose.yml` com PostgreSQL.
  - Pronto quando: o banco subir com um comando e aceitar conexão.
- [ ] **T034: Criar a API base.** Configure FastAPI, variáveis de ambiente, conexão, Alembic, pytest e rota `/health`.
  - Pronto quando: `/health` responder e um teste simples passar.
- [ ] **T035: Padronizar os erros.** Implemente o formato de erro do `plan.md`, seção 8.
  - Pronto quando: um teste confirmar o formato de erro.

### Etapa 12 — Conta e isolamento

- [ ] **T036: Implementar o login com Google.** Valide o token e crie a sessão.
  - Pronto quando: a rota `/me` só responder com sessão válida.
- [ ] **T037: Garantir o isolamento por usuário.** Crie a base usada por todas as consultas.
  - Pronto quando: um teste provar que um usuário não acessa dados de outro (RN17).
- [ ] **T038: Criar a tela de Login.** Cubra a seção 6.1 da `spec.md`.
  - Pronto quando: os critérios de aceite forem cumpridos.
  - Já existe uma versão só visual em `/login`, feita na Parte 1. Esta tarefa liga a tela ao login real.

### Etapa 13 — API por módulo

Em cada tarefa, crie modelos, migrações, rotas e testes, e leve para a API as regras da camada local.

- [ ] **T039: Construir áreas, metas e grupos.**
  - Pronto quando: os testes do módulo passarem.
- [ ] **T040: Construir caixa de entrada.**
  - Pronto quando: os testes do módulo passarem, incluindo RN03 e RN31.
- [ ] **T041: Construir tarefas e subtarefas.**
  - Pronto quando: os testes de RN02, RN21, RN24, RN30 e RN33 passarem.
- [ ] **T042: Construir o plano do dia.**
  - Pronto quando: os testes de RN11, RN20 e RN25 passarem.
- [ ] **T043: Construir projetos, fila e colunas.**
  - Pronto quando: os testes de RN01, RN05 a RN08, RN22, RN26, RN29 e RN32 passarem.
- [ ] **T044: Construir agenda e rotinas.**
  - Pronto quando: os testes de RN09, RN10, RN18 e RN28 passarem.
- [ ] **T045: Construir estudos.**
  - Pronto quando: os testes de RN12 e RN19 passarem.

### Etapa 14 — Integração

- [ ] **T046: Conectar as telas à API.** Troque a implementação local pela API, módulo por módulo.
  - Pronto quando: todas as telas funcionarem com a API, sem mudar seus componentes.
- [ ] **T047: Importar os dados locais.** Leve o JSON exportado para o banco.
  - Pronto quando: seus dados reais estiverem no PostgreSQL.
- [ ] **T048: Criar a consulta sem conexão.** Mantenha a última versão da tela Hoje no navegador.
  - Pronto quando: a tela abrir em modo leitura com a API desligada.
- [ ] **T049: Criar o backup local.** Faça o script com `pg_dump` e o passo de restauração (RN23).
  - Pronto quando: uma cópia for restaurada em um banco vazio.

### Etapa 15 — Fechamento da V0.1.0

- [ ] **T050: Revisar regras.** Confira cada regra da fase 1 na `spec.md`.
  - Pronto quando: cada regra tiver implementação e teste, quando aplicável.
- [ ] **T051: Revisar critérios de aceite.** Percorra todas as telas.
  - Pronto quando: todos os critérios estiverem marcados.
- [ ] **T052: Documentar a execução.** Atualize o `README.md`.
  - Pronto quando: o projeto subir do zero seguindo só o README.
- [ ] **T053: Marcar a versão.** Crie a tag `v0.1.0`.
  - Pronto quando: a tag existir no repositório.
