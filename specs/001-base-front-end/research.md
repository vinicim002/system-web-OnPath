# Pesquisa: Base do front-end

Decisões da Fase 0. Os itens que estavam como "Proposta" no `docs/plan.md` e entram nesta etapa
foram resolvidos aqui.

## 1. Linguagem

- **Decisão**: TypeScript em modo estrito.
- **Motivo**: a constituição (princípio IV) exige serviços com tipos definidos. Com tipos, uma
  troca de implementação que quebre o contrato é pega antes de rodar.
- **Alternativas**: JavaScript com JSDoc. Foi descartado porque a verificação de tipos é mais
  fraca e fácil de ignorar.

## 2. Rotas

- **Decisão**: React Router, com as rotas em `src/rotas.tsx`, uma tela por arquivo em
  `src/telas/` e uma moldura que desenha o menu lateral e a tela atual ao lado. A rota `*` mostra
  a página de não encontrada.
- **Motivo**: dá a cada tela um endereço próprio (FR-004 e cenário 3 da história 1), e o
  `NavLink` já marca o item atual do menu (FR-006).
- **Alternativas**: TanStack Router, com rotas mais tipadas, mas pouco ganho com 10 rotas
  simples. Expo Router foi usado na primeira versão e saiu com a troca de stack (item 13).

## 3. Dados nas telas

- **Decisão**: TanStack Query sobre os serviços. Cada leitura vira uma consulta, e cada escrita
  invalida as consultas afetadas.
- **Motivo**: quando a implementação local for trocada pela API, as telas continuam usando os
  mesmos hooks. A invalidação também prepara a RN04, porque concluir uma tarefa em uma tela
  atualiza as outras.
- **Alternativas**: estado global (Zustand ou Context), que precisaria ser reescrito ao chegar a
  API assíncrona. Chamar os serviços direto com `useEffect` foi descartado por repetir a lógica
  de carregamento e erro em toda tela.

## 4. Armazenamento local

- **Decisão**: `localStorage`, com uma chave por coleção (`onpath:v1:areas`, ...) e uma chave de
  controle (`onpath:v1:meta`). O acesso fica isolado em um adaptador com `ler`, `gravar` e
  `transacao`.
- **Motivo**: é simples, síncrono e suficiente para o volume de um usuário. Os serviços expõem
  funções assíncronas (`Promise`) desde já, para que a troca pela API não mude o contrato. O
  adaptador isolado atende ao risco "código de web diferente no celular" do `docs/plan.md`.
- **Alternativas**: IndexedDB, direto ou com Dexie, que tem mais capacidade, mas é mais complexo e
  só existe na web. AsyncStorage também foi descartado, porque não traz ganho na web, e o
  celular só vem depois da V0.1.0, já com a API.

## 5. Criação única dos dados iniciais

- **Decisão**: no início, o app pega a trava `onpath-carga` da Web Locks API
  (`navigator.locks`), quando ela existe. Dentro da trava, sem nenhum `await` entre ler e gravar,
  ele lê a chave de controle e, se `dadosIniciaisEm` estiver vazio, grava os dados iniciais e a
  marca em uma única chamada. Só grava as coleções que estiverem vazias. Sem Web Locks, faz o
  mesmo passo sem a trava: como cada aba executa um código por vez e o `localStorage` responde
  na hora, a chance de duas abas se cruzarem é desprezível.
- **Motivo**: cumpre FR-017 e SC-003 com várias abas abertas. Como a marca fica na chave de
  controle, os itens arquivados ou editados não voltam (cenário 3 da história 2).
- **Alternativas**: verificar se já existem áreas. Foi descartado porque, se o usuário arquivar
  tudo, os dados seriam recriados.

## 6. Textos separados

- **Decisão**: um objeto tipado em `src/i18n/pt-BR.ts`, acessado por um helper `t` com chaves
  verificadas pelo TypeScript e suporte a valores interpolados.
- **Motivo**: há um único idioma. O tipo impede chaves inexistentes, e não é preciso instalar
  dependência.
- **Alternativas**: i18next ou react-i18next, que seriam úteis com vários idiomas, mas são
  pesados para um só. Podem entrar depois sem mudar as chaves.

## 7. Validação e formato da cópia

- **Decisão**: esquemas Zod para cada entidade, de onde também saem os tipos. A cópia é um JSON
  com `formato`, `versao`, `exportadoEm` e `colecoes`. A importação valida o arquivo inteiro
  com Zod e checa as referências entre registros antes de gravar qualquer coisa.
- **Motivo**: um único lugar define o tipo e a validação. Isso cumpre FR-022 (validar tudo antes
  de alterar) e SC-005, e os esquemas servirão de referência para os modelos Pydantic da Parte 2.
- **Alternativas**: validação manual, que é fácil de ficar desatualizada em relação aos tipos.

## 8. Identificadores e datas

- **Decisão**: identificadores com `crypto.randomUUID()`, chamado por `gerarId()` em `src/plataforma/id.ts`. Datas guardadas como texto ISO 8601 em
  UTC (`2026-11-05T15:00:00.000Z`), e horários de rotina como `HH:mm` locais.
- **Motivo**: UUIDs evitam colisão ao importar no banco (T047). O formato ISO cumpre a seção 7 de
  `docs/spec.md`. A exibição usa o fuso `America/Sao_Paulo` até a T030.

## 9. Nomes dos campos

- **Decisão**: no código da interface, os campos usam camelCase em português (`areaId`,
  `criadoEm`, `arquivadoEm`). A futura implementação `src/api/` converte de e para o snake_case
  da API. As entidades não têm `usuarioId`: na Parte 2, a API tira o usuário da sessão.
- **Motivo**: segue o padrão do TypeScript e mantém a conversão em um único lugar.

## 10. Exportar e importar na web

- **Decisão**: em `src/plataforma/arquivos.ts`, exportar usa `Blob` e um link de download, e
  importar usa um `<input type="file">` escondido. O nome do arquivo segue o padrão
  `onpath-copia-AAAA-MM-DD.json`.
- **Motivo**: dispensa dependências e fica isolado da plataforma, como pede o `docs/plan.md`.

## 11. Testes

- **Decisão**: Vitest com o ambiente `jsdom`, para os serviços locais (CRUD e arquivamento), a criação
  única dos dados iniciais e a cópia (ida e volta, e recusa de arquivos inválidos). O
  `localStorage` é simulado pelo ambiente `jsdom`.
- **Motivo**: são as partes com regra e risco de perder dados. As telas desta etapa são vazias e
  são verificadas pelo `quickstart.md`.

## 12. Tema

- **Decisão**: o arquivo `src/theme/index.ts` define as cores (preto `#0A0A0A`, branco `#FFFFFF`
  e uma escala de cinzas de 50 a 900, além do roxo do logo `#7357F0`, reservado ao logo e a
  pequenos detalhes), a fonte Inter (400, 500 e 600) e os espaçamentos em múltiplos de 4.
- **Motivo**: cumpre a seção 7 de `docs/spec.md` e o princípio V. Nenhum componente usa cor
  literal.

## 13. Troca de Expo por React com Vite

- **Decisão**: a interface é um app React de página única, criado com Vite. O estilo usa CSS
  Modules, e as cores, fontes e espaçamentos chegam aos componentes como variáveis CSS geradas a
  partir de `src/theme/index.ts`.
- **Motivo**: o produto principal é o app no computador. Com HTML e CSS, ficam disponíveis
  estados de foco e de mouse, atalhos e as bibliotecas web de arrastar e soltar e de calendário,
  úteis no Kanban e na Agenda. As telas de computador não seriam reaproveitadas no celular, e o
  que seria reaproveitado (tipos, serviços, textos e tema) é TypeScript puro.
- **Alternativas**: manter Expo, que reaproveitaria as telas no celular, mas limita o app no
  computador. Next.js foi descartado porque o app não precisa de renderização no servidor nem
  de SEO, e a API da Parte 2 é em FastAPI.
