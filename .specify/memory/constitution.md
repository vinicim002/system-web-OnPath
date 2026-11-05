# Constituição do OnPath

## Princípios Centrais

### I. Português e textos separados do código

- Os artefatos do projeto (especificação, plano, tarefas e demais documentos) DEVEM ser
  escritos em português.
- Todo texto exibido no app DEVE estar em português.
- Nenhum texto de interface pode ficar escrito direto nos componentes: os textos DEVEM
  ficar em arquivos próprios, separados do código.

Motivo: requisito de idioma da seção 7 de `docs/spec.md` e preparação para abrir o app
ao público no futuro.

### II. docs/ como fonte oficial

- `docs/spec.md` é a fonte oficial das regras de negócio RN01 a RN33. O código DEVE
  seguir essas regras, e as regras marcadas como **Fase 2** NÃO são implementadas na
  V0.1.0.
- `docs/spec.md` define o que construir, `docs/plan.md` define como construir, e
  `docs/tasks.md` define a ordem.
- Se uma decisão mudar, `docs/spec.md` ou `docs/plan.md` DEVEM ser atualizados antes do
  código.

Motivo: manter um único registro das decisões e evitar que o código se afaste delas.

### III. Front-end primeiro

- A Parte 1 constrói todas as telas com dados locais no navegador.
- NÃO é permitido criar API, banco de dados ou login antes da Parte 2 de
  `docs/tasks.md`.
- O back-end só começa depois da revisão da Etapa 10 (T031 e T032).

Motivo: revelar novas necessidades usando as telas antes de existir código de back-end.

### IV. Telas desacopladas por serviços tipados

- Telas NUNCA acessam dados nem aplicam regras de negócio diretamente.
- Toda leitura, escrita e regra passa por serviços com tipos definidos.
- Na Parte 1, esses serviços usam implementação local e contêm as regras. Na Parte 2, a
  implementação local é trocada pela API, que passa a ser a fonte oficial das regras.
- A troca da implementação local pela API NÃO pode exigir mudança nos componentes das
  telas.

Motivo: evitar que as regras sejam reescritas ao criar a API (risco listado em
`docs/plan.md`, seção 11).

### V. Visual da seção 7 da especificação

- O visual DEVE seguir a seção 7 de `docs/spec.md`: preto, branco e tons de cinza, com
  cor só em gráficos e ícones. Logo e pequenos detalhes podem puxar para o roxo.
- Cores, fontes e espaçamentos DEVEM vir do tema, não de valores soltos nos componentes.

Motivo: manter a interface minimalista e consistente em todas as telas.

## Restrições do projeto

- Stack decidida: React com Vite, como app web para computador; API em Python e
  FastAPI; banco PostgreSQL; servidor futuro na VPS Hostinger KVM 1. Itens marcados como
  **Proposta** em `docs/plan.md` ainda podem mudar.
- A V0.1.0 roda localmente, sem custo de servidor. A VPS só é contratada depois da
  aprovação no uso real.
- Excluir um item o arquiva, e ele pode ser recuperado (RN31).
- Datas são guardadas em UTC e exibidas no fuso do usuário.
- Todo erro informa o que aconteceu e o que fazer.

## Fluxo de trabalho

- As tarefas de `docs/tasks.md` são feitas uma por vez, na ordem.
- Antes de começar uma tarefa, os itens de `docs/spec.md` citados nela DEVEM ser lidos.
- Uma tarefa só é marcada quando o critério **Pronto quando** for cumprido.
- As tarefas da Parte 2 DEVEM ser revisadas na T032 antes de começar.

## Governança

- Esta constituição prevalece sobre outras práticas do projeto. Em caso de conflito com
  `docs/`, os documentos e a constituição DEVEM ser alinhados antes de qualquer código.
- Emendas são feitas com o comando `/speckit-constitution`, registradas neste arquivo e
  acompanhadas do motivo.
- Versionamento semântico: MAIOR para remover ou redefinir um princípio; MENOR para
  adicionar um princípio ou seção ou ampliar uma regra; CORREÇÃO para ajustes de texto.
- Todo plano e toda revisão de código DEVEM verificar a conformidade com estes
  princípios.

**Versão**: 1.1.0 | **Ratificada**: 2026-11-05 | **Última emenda**: 2026-11-05

### Emendas

- **1.1.0 (2026-11-05):** a interface troca React Native/Expo por React com Vite. Motivo: o
  produto principal é o app no computador, e as telas de computador não seriam
  reaproveitadas no celular. O código reaproveitável (tipos, serviços, textos e tema) é
  TypeScript puro e pode servir a um app de celular futuro.
