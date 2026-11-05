# OnPath — Plano técnico da V0.1.0

> Define **como** construir o que está em `spec.md`. A ordem de execução está em `tasks.md`.
> Atualizado em 2026-11-05.

Itens marcados com **Proposta** ainda não foram debatidos e podem mudar. Os demais são decisões tomadas.

## 1. Stack

> 2026-11-05: a interface trocou React Native/Expo por React com Vite (constituição 1.1.0). O app é para computador, e um app de celular futuro reaproveita só a camada de dados, os textos e o tema.

| Camada | Escolha | Situação |
|---|---|---|
| Interface | React com Vite, como app web de página única para computador | Decidido |
| Linguagem da interface | TypeScript | Decidido |
| Rotas da interface | React Router | Decidido |
| Estilo da interface | Tailwind CSS, com a paleta do tema | Decidido |
| Componentes da interface | shadcn/ui (sobre Radix) e ícones lucide | Decidido |
| Dados na interface | TanStack Query | Decidido |
| Validação na interface | Zod | Decidido |
| Testes da interface | Vitest | Decidido |
| API | Python e FastAPI | Decidido |
| Validação | Pydantic | Proposta |
| Banco | PostgreSQL | Decidido |
| Acesso ao banco | SQLAlchemy 2 | Proposta |
| Migrações | Alembic | Proposta |
| Testes da API | pytest | Proposta |
| Banco local | PostgreSQL em Docker Compose | Proposta |
| Servidor futuro | VPS Hostinger KVM 1, com Docker e proxy reverso | Decidido |

Use versões estáveis atuais no momento de instalar.

Versões instaladas na Etapa 0 (interface): React 19, Vite 8, TypeScript 7, React Router 8, TanStack Query 5, Zod 4, Vitest 5 e Tailwind CSS 4.

Outras bibliotecas entram na tarefa em que forem usadas: sonner (avisos com desfazer) na T006, react-hook-form na T009, date-fns com `@date-fns/tz` nas T011 e T012, e dnd-kit nas T011 e T019.

### Modo escuro

O tema define a paleta clara no `@theme` do Tailwind (`src/theme/tema.css`). A classe `.dark` na raiz da página troca as mesmas variáveis de cor pelos tons invertidos, então os componentes não mudam: `bg-branco` passa a ser o fundo escuro e `text-preto` o texto claro. A escolha (claro, escuro ou sistema) fica no `localStorage` e é aplicada antes da primeira pintura da tela, para não piscar.

### Painel do projeto

Em desenvolvimento (`npm run dev`), a rota `/painel` mostra o que é o projeto, o andamento das
etapas, um Board das tarefas, o histórico de commits e os documentos `docs/` e `specs/`. Os
documentos são lidos direto dos arquivos, e o histórico vem do `git log` por um endereço do
servidor de desenvolvimento. O painel não entra no build final. Ele usa `react-markdown` e
`remark-gfm` para mostrar os documentos.

## 2. Ordem de construção

A construção é **front-end primeiro**. As telas são feitas com dados locais no navegador, para revelar novas necessidades antes de existir código de back-end.

- **Camada de dados:** telas nunca acessam dados nem regras diretamente. Elas usam serviços com tipos definidos, que primeiro usam o armazenamento local e depois chamam a API.
- **Regras:** durante a Parte 1, as regras ficam nesses serviços. Na Parte 2, a API passa a ser a fonte oficial.
- **Dados:** o armazenamento do navegador pode ser apagado, então exporte uma cópia em JSON com frequência.
- **Revisão:** o modelo de dados, a API e os testes das seções seguintes serão revisados antes do início do back-end.

## 3. Ambientes

### Local, na V0.1.0

Tudo roda no computador do usuário, sem custo de servidor. Primeiro, roda só a interface (Vite) no navegador. Depois, entram a API em Python e o PostgreSQL em um contêiner.

- Interface: `http://localhost:5173`
- API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

A máquina de desenvolvimento não roda emulador Android. O desenvolvimento acontece no navegador.

### VPS, depois da aprovação no uso real

A KVM 1 só será contratada depois que o app for aprovado. Nessa etapa, cada projeto hospedado roda em seu contêiner, com proxy reverso para os domínios, e o banco ganha backup automático diário fora do servidor.

## 4. Estrutura do repositório

O repositório guarda cada sistema em uma pasta própria. O sistema web fica em `system-web-onPath/`, e um app para celular, no futuro, ganha uma pasta irmã.

```text
onPath/                           # Repositório
└── system-web-onPath/            # Sistema web
    ├── .specify/                 # Spec Kit
    ├── docs/
    │   ├── spec.md
    │   ├── plan.md
    │   └── tasks.md
    ├── specs/                    # Especificações por etapa
    ├── system-onPath-web-front/  # React com Vite
    │   └── src/
    │       ├── api/              # Implementação dos serviços pela API (Parte 2)
    │       ├── components/       # Componentes do app; ui/ guarda os do shadcn/ui
    │       ├── dados/            # Tipos, contratos dos serviços e implementação local
    │       ├── features/         # Um módulo por área do produto; painel/ só em desenvolvimento
    │       ├── i18n/             # Textos em português
    │       ├── telas/            # Uma tela por rota
    │       ├── plataforma/       # APIs do navegador: arquivos, travas e notificações
    │       └── theme/            # Cores, fontes e espaçamentos (tema do Tailwind)
    ├── system-onPath-web-back/   # FastAPI
    │   ├── app/
    │   │   ├── core/             # Configuração, banco e segurança
    │   │   ├── modules/          # Um módulo por área do produto
    │   │   └── main.py
    │   ├── alembic/
    │   └── tests/
    ├── scripts/                  # Backup e dados iniciais
    ├── docker-compose.yml
    └── README.md
```

Cada módulo da API separa rotas, esquemas, serviço e modelos. As regras de negócio ficam nos serviços, nunca nas rotas.

## 5. Arquitetura

```text
React (Vite)  -->  API FastAPI  -->  PostgreSQL
   |
   +--> Cópia local do plano do dia
```

- A interface só acessa os dados pela API.
- A API aplica todas as regras de negócio.
- Toda consulta filtra por `usuario_id` (RN17).
- Excluir define `arquivado_em`, e as listagens ignoram itens arquivados por padrão (RN31).
- Datas são salvas em UTC.

## 6. Modelo de dados

Toda tabela tem `id`, `usuario_id`, `criado_em`, `atualizado_em` e `arquivado_em`. Campos com `?` são opcionais. A tabela de usuários é a exceção: ela não tem `usuario_id`.

| Entidade | Atributos |
|---|---|
| usuarios | `nome`, `email`, `google_id`, `fuso_horario`, `hora_inicio_dia`, `hora_fim_dia` |
| areas | `nome`, `cor`, `ordem` |
| metas | `area_id`, `titulo`, `descricao?`, `prazo?`, `status` |
| grupos | `area_id`, `nome`, `limite_ativos` |
| projetos | `area_id`, `grupo_id`, `meta_id?`, `nome`, `descricao?`, `prazo?`, `prioridade`, `status`, `posicao_fila` |
| colunas | `projeto_id`, `nome`, `ordem`, `final` |
| tarefas | `area_id`, `projeto_id?`, `materia_id?`, `coluna_id?`, `tarefa_pai_id?`, `titulo`, `prioridade`, `tempo_estimado_min?`, `prazo?`, `status`, `concluida_em?`, `anotacoes?` |
| itens_caixa | `conteudo`, `status` |
| itens_dia | `tarefa_id`, `data`, `ordem`, `resultado` |
| rotinas | `area_id`, `nome`, `tipo`, `dias_semana`, `hora_inicio?`, `duracao_min?`, `meta_min?` |
| compromissos | `area_id`, `titulo`, `inicio`, `fim`, `local?` |
| blocos_tempo | `tarefa_id?`, `rotina_id?`, `sessao_estudo_id?`, `inicio`, `fim`, `status` |
| materias | `area_id`, `nome`, `descricao?`, `status` |
| topicos | `materia_id`, `nome`, `ordem` |
| materiais | `materia_id`, `topico_id?`, `tipo`, `titulo`, `conteudo?`, `url?` |
| sessoes_estudo | `materia_id`, `topico_id?`, `duracao_planejada_min`, `duracao_real_min?`, `anotacoes?`, `status` |

Adições ao modelo do minimundo: `hora_inicio_dia` e `hora_fim_dia` calculam o tempo livre. O campo `tempo_estimado_min` é opcional no banco porque subtarefas não o exigem (RN33); a API o exige nas tarefas principais (RN24).

### Valores permitidos

| Campo | Valores |
|---|---|
| `projetos.status` | `fila`, `ativo`, `pausado`, `concluido`, `cancelado` |
| Prioridade | `alta`, `media`, `baixa` |
| `tarefas.status` | `aberta`, `concluida`, `cancelada` |
| `itens_caixa.status` | `novo`, `processado`, `descartado` |
| `metas.status` | `ativa`, `concluida`, `cancelada` |
| `materias.status` | `ativa`, `pausada`, `concluida` |
| `itens_dia.resultado` | `pendente`, `feita`, `remarcada`, `devolvida`, `cancelada` |
| `rotinas.tipo` | `horario`, `meta_horas` |
| `blocos_tempo.status` | `planejado`, `realizado`, `perdido`, `remarcado` |
| `materiais.tipo` | `resumo`, `link` |
| `sessoes_estudo.status` | `planejada`, `realizada`, `cancelada` |

### Restrições do banco

- `tarefas`: no máximo um entre `projeto_id` e `materia_id`.
- `tarefas`: `coluna_id` só existe quando há `projeto_id`.
- `blocos_tempo`: no máximo uma origem entre tarefa, rotina e sessão, e `fim` depois de `inicio`.
- `compromissos`: `fim` depois de `inicio`.
- `colunas`: no máximo uma coluna final por projeto.
- `itens_dia`: uma tarefa aparece uma vez em cada data.
- `grupos`: `limite_ativos` maior ou igual a 0.
- `projetos`: `area_id` igual ao `area_id` do grupo (RN01).

## 7. Comportamentos importantes

### Autenticação

O navegador obtém o token do Google e o envia à API. A API valida esse token, cria ou encontra o usuário e devolve uma sessão própria. Credenciais do Google ficam em variáveis de ambiente, nunca no repositório.

### Limite de projetos ativos

A ativação roda em uma transação: conta os ativos do grupo e bloqueia se o limite foi alcançado (RN06 e RN07). A mesma transação verifica se existe uma tarefa aberta (RN08).

Cada grupo tem a própria fila, com ordem manual (RN26); entrar na fila põe o projeto no fim. Transições de status: fila ou pausado → ativo (com as verificações); ativo → pausado; pausado → fila; qualquer status não final → concluído ou cancelado; concluído ou cancelado → fila.

### Conclusão de tarefas

Mudar para a coluna final conclui a tarefa. Concluir por outra tela a move para a coluna final, se existir (RN32). Reabrir a tarefa a tira da coluna final; a interface escolhe a primeira coluna não final.

### Subtarefas

Uma subtarefa usa `tarefa_pai_id`, herda `area_id`, `prioridade` e o vínculo (`projeto_id` ou `materia_id`) da tarefa do topo e pode não ter tempo estimado (RN33). Mudar esses campos na tarefa do topo atualiza todas as subtarefas. Impedir ciclos é obrigatório. Concluir uma tarefa com subtarefas abertas exige confirmação, e confirmar conclui as subtarefas abertas junto.

### Rotinas e blocos

O serviço gera blocos das rotinas com horário para os próximos 14 dias e renova essa janela ao abrir o app. Assim, cada ocorrência tem status próprio para a RN18. Mudar uma rotina recria só os blocos futuros ainda planejados.

Uma rotina com meta de horas não gera blocos automaticamente. O usuário cria os blocos, e a API soma os realizados e planejados do dia (RN28).

### Tempo livre

```text
tempo livre = janela do dia - blocos de rotina - compromissos
planejado   = soma do tempo estimado dos itens do dia
```

Se `planejado` passar de `tempo livre`, a API devolve um aviso, sem bloquear (RN10).

### Pendências do dia

Ao abrir o app, a API busca itens pendentes de datas passadas. A interface pede um destino para cada um antes de liberar o planejamento do dia (RN25).

### Conflitos de horário

A API compara blocos e compromissos no intervalo. Sem confirmação, retorna `409`. Com `confirmar_conflito=true`, grava (RN09).

### Consulta sem conexão

A interface guarda a última resposta da tela Hoje no armazenamento local do navegador. Se a API não responder, mostra essa cópia em modo leitura.

### Lembretes

Na V0.1.0, os lembretes usam as notificações do navegador e dependem de o app estar aberto. Notificações com o app fechado ficam para o celular ou para uma etapa própria.

### Kanban e fila

Na web, o arrastar usa o `dnd-kit` (com suporte a teclado), isolado em `src/features/kanban/`, porque o celular precisará de outra implementação. Os cartões seguem a ordem da lista de tarefas; não há ordem manual dentro da coluna.

## 8. API

Base: `/api/v1`. Todas as rotas exigem sessão, exceto o login. Cada recurso da lista abaixo tem as rotas `GET`, `POST`, `PATCH` e `DELETE`, sendo que `DELETE` arquiva.

| Recurso | Caminho |
|---|---|
| Áreas | `/areas` |
| Metas | `/metas` |
| Grupos | `/grupos` |
| Projetos | `/projetos` |
| Colunas | `/projetos/{id}/colunas` |
| Tarefas | `/tarefas` |
| Itens da caixa | `/caixa` |
| Rotinas | `/rotinas` |
| Compromissos | `/compromissos` |
| Blocos de tempo | `/blocos` |
| Matérias | `/materias` |
| Tópicos | `/materias/{id}/topicos` |
| Materiais | `/materiais` |
| Sessões de estudo | `/sessoes-estudo` |

Rotas específicas:

| Método e caminho | Função |
|---|---|
| `POST /auth/google` | Faz login com o token do Google |
| `POST /auth/logout` | Encerra a sessão |
| `GET /me` | Devolve o usuário atual |
| `PATCH /me` | Atualiza fuso e janela do dia |
| `GET /hoje?data=` | Devolve o plano do dia e o resumo de tempo |
| `POST /hoje/itens` | Adiciona uma tarefa ao dia |
| `PATCH /hoje/itens/{id}` | Muda ordem ou resultado |
| `PUT /hoje/ordem` | Reordena o dia |
| `GET /hoje/pendencias` | Lista pendências de dias anteriores |
| `POST /projetos/{id}/ativar` | Ativa um projeto |
| `POST /projetos/{id}/pausar` | Pausa um projeto |
| `PUT /projetos/fila` | Reordena a fila |
| `POST /tarefas/{id}/concluir` | Conclui uma tarefa |
| `POST /tarefas/{id}/reabrir` | Reabre uma tarefa |
| `POST /tarefas/{id}/mover` | Muda a coluna |
| `POST /caixa/{id}/converter` | Converte um item da caixa |
| `POST /blocos/{id}/remarcar` | Remarca um bloco |
| `POST /sessoes-estudo/{id}/concluir` | Registra uma sessão realizada |
| `GET /arquivados` | Lista itens arquivados |
| `POST /arquivados/{tipo}/{id}/recuperar` | Recupera um item |

### Respostas de erro

```json
{
  "erro": {
    "codigo": "limite_grupo_atingido",
    "mensagem": "Este grupo já tem o máximo de projetos ativos.",
    "detalhes": {}
  }
}
```

| Status | Uso |
|---|---|
| `401` | Sem sessão válida |
| `404` | Item inexistente ou de outro usuário |
| `409` | Conflito com uma regra, como limite ou horário |
| `422` | Dados inválidos |

## 9. Testes

Cada regra de negócio implementada precisa de ao menos um teste na API.

Prioridade dos testes:

1. Isolamento entre usuários (RN17)
2. Limite de ativos e próxima ação (RN06, RN07 e RN08)
3. Campos obrigatórios e subtarefas (RN24 e RN33)
4. Conclusão pelo Kanban e pelas outras telas (RN32)
5. Pendências do dia (RN25)
6. Conflitos e tempo livre (RN09 e RN10)
7. Rotinas e blocos (RN18 e RN28)

Na interface, a validação da V0.1.0 é feita pelos critérios de aceite de `spec.md`, com testes automatizados nos fluxos mais importantes conforme houver tempo.

## 10. Backup local

Enquanto estiver local, os dados dependem do computador do usuário. Um script usa `pg_dump` para gerar uma cópia, que deve ser guardada fora da máquina. A VPS terá backup automático diário (RN23).

## 11. Riscos

| Risco | Como reduzir |
|---|---|
| Escopo grande para 5 horas por semana | Seguir as tarefas na ordem e usar o app assim que possível |
| Regras reescritas ao criar a API | Manter as regras nos serviços, separadas das telas |
| Dados locais apagados no navegador | Exportar o JSON com frequência |
| Perda de dados no computador local | Rodar o backup com frequência |
| Lembretes dependem do app aberto | Deixar a limitação clara na tela de Ajustes |
| Um app de celular no futuro | Manter tipos, serviços, textos e tema em TypeScript puro, sem depender da interface |
| VPS KVM 1 ter pouca capacidade futura | Medir o uso antes de contratar |
