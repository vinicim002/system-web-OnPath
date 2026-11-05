---
description: "Lista de tarefas da base do front-end (Etapa 0)"
---

# Tarefas: Base do front-end

**Entrada**: documentos de `specs/001-base-front-end/`

**Pré-requisitos**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Testes**: os serviços locais, a carga inicial e a cópia de dados têm testes Jest
(`research.md`, item 11). As telas são validadas pelo `quickstart.md`.

**Relação com `docs/tasks.md`**: as tarefas abaixo têm numeração própria. Elas cobrem as tarefas
T001 a T005 do `docs/tasks.md`, que só são marcadas na fase final.

## Formato: `[ID] [P?] [História] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente).
- **[US1], [US2] e [US3]**: as histórias 1, 2 e 3 do `spec.md`.
- Todos os caminhos partem de `system-web-onPath/`, a pasta do sistema web dentro do repositório.

---

## Fase 1: Preparação

**Objetivo**: criar o projeto Expo em `system-onPath-web-front/`, já configurado.

- [X] T001 Criar o projeto Expo em `system-onPath-web-front/` com o template TypeScript e Expo Router (`npx create-expo-app@latest system-onPath-web-front`, na versão estável atual). Em seguida, apagar as telas, os componentes, as imagens e as constantes de exemplo do template, mantendo só `app.json`, `package.json`, `tsconfig.json`, `assets/` e a pasta `system-onPath-web-front/app/`.
- [X] T002 Instalar as dependências em `system-onPath-web-front/package.json` com `npx expo install`: `@tanstack/react-query`, `zod`, `@expo-google-fonts/inter`, `expo-font` e `expo-splash-screen`. Instalar também as dependências de desenvolvimento `jest`, `jest-expo`, `@types/jest` e `jest-environment-jsdom`.
- [X] T003 [P] Ativar `"strict": true` em `system-onPath-web-front/tsconfig.json`, alterar o atalho `@/*` para apontar para `system-onPath-web-front/src/*` e acrescentar os scripts `"web": "expo start --web"`, `"test": "jest"` e `"typecheck": "tsc --noEmit"` em `system-onPath-web-front/package.json`.
- [X] T004 [P] Configurar o Jest em `system-onPath-web-front/jest.config.js` com `preset: "jest-expo/web"`, `testEnvironment: "jsdom"`, o mapeamento `^@/(.*)$` para `<rootDir>/src/$1` os testes em `system-onPath-web-front/__tests__/` e `setupFiles: ["<rootDir>/jest.setup.js"]`. O `jest.setup.js` define `globalThis.crypto` com o `webcrypto` do Node, se o ambiente não tiver `crypto.randomUUID`.
- [X] T005 [P] Definir em `system-onPath-web-front/app.json` o nome "OnPath", o slug `onpath`, a plataforma `web` com `"output": "single"` e o esquema `onpath`.

---

## Fase 2: Base (bloqueia as histórias)

**Objetivo**: preparar o tema, os textos e a camada de dados, que todas as histórias usam.

**⚠️ Nenhuma história começa antes desta fase terminar.**

- [ ] T006 [P] Criar o tema em `system-onPath-web-front/src/theme/index.ts`, com as cores `preto: "#0A0A0A"`, `branco: "#FFFFFF"`, uma escala `cinza` de 50 a 900 e `roxo: "#6D28D9"` (só para o logo e pequenos detalhes), além de `fontes` (Inter 400, 500 e 600, com as chaves `regular`, `media` e `seminegrito`) e `espaco(n) = n * 4` (`research.md`, item 12).
- [ ] T007 [P] Criar os textos em `system-onPath-web-front/src/i18n/pt-BR.ts`: um objeto `as const` com os rótulos do menu (`contracts/rotas.md`), os títulos das telas, os textos de carregamento, de página não encontrada e da cópia de dados, uma mensagem para cada código de erro de `contracts/servicos.md` e `erros.acao.liberarArmazenamento` ("Libere o armazenamento deste site no navegador e recarregue a página."). Criar também `system-onPath-web-front/src/i18n/index.ts` com `t(chave, valores?)`: a chave é tipada, separada por pontos (ex.: `"menu.hoje"`), e o texto aceita valores no formato `{nome}`.
- [ ] T008 [P] Criar `system-onPath-web-front/src/dados/erros.ts` com a classe `ErroOnPath` (`codigo`, `mensagem`, `detalhes`), o tipo `CodigoErro` (`"nao_encontrado" | "dados_invalidos" | "copia_invalida" | "copia_versao_desconhecida" | "copia_referencia_quebrada" | "armazenamento_indisponivel"`) e uma função `criarErro(codigo, detalhes?)` que busca a mensagem em `t("erros.<codigo>")`.
- [ ] T009 [P] Criar `system-onPath-web-front/src/plataforma/id.ts` com `gerarId(): string`, que usa `crypto.randomUUID()`.
- [ ] T010 Criar `system-onPath-web-front/src/dados/tipos.ts` com os esquemas Zod e os tipos inferidos das 15 entidades de `data-model.md`. Incluir os campos comuns (`id` UUID, `criadoEm` e `atualizadoEm` em ISO UTC, `arquivadoEm` em ISO ou `null`) e os valores da seção 6 de `docs/plan.md`, mais `metas.status` (`ativa`, `concluida`, `cancelada`) e `materias.status` (`ativa`, `pausada`, `concluida`). Seguir os formatos `diasSemana` com números de 0 a 6, `horaInicio` em `HH:mm`, `data` em `AAAA-MM-DD` e `grupos.limiteAtivos` maior ou igual a 0. Para cada entidade, exportar o esquema completo, o `Novo<Entidade>` (sem os campos comuns) e a `Alteracao<Entidade>` (parcial), além da lista `NOMES_COLECOES` com as 15 chaves.
- [ ] T011 Criar `system-onPath-web-front/src/dados/contratos.ts` com `ServicoColecao<T, Novo, Alteracao>`, `ServicoDados` e `Servicos`, exatamente como em `contracts/servicos.md`. Todos os métodos devolvem `Promise`, e `listar` aceita `{ incluirArquivados?: boolean }`.
- [ ] T012 Criar o adaptador `system-onPath-web-front/src/dados/local/armazenamento.ts` sobre o `localStorage`, com as chaves `onpath:v1:<colecao>` e `onpath:v1:meta`. Ele expõe `lerColecao`, `lerMeta`, `gravar(alteracoes)` e `limparTudo`. A gravação monta todos os valores antes de escrever e guarda o valor anterior de cada chave afetada. Se qualquer `setItem` falhar, ela restaura os valores anteriores (ou remove as chaves que não existiam) e lança `ErroOnPath("armazenamento_indisponivel")`. Assim, uma gravação nunca fica pela metade. Se o próprio acesso ao `localStorage` falhar, o erro é o mesmo.
- [ ] T013 Criar `system-onPath-web-front/src/dados/local/colecao.ts` com `criarServicoColecao(nome, esquema)`, que implementa `ServicoColecao` sobre o adaptador:
  - gera o `id` com `gerarId()` de `system-onPath-web-front/src/plataforma/id.ts` e as datas com `new Date().toISOString()`;
  - valida com o esquema Zod, e uma falha vira `dados_invalidos`, com só os nomes dos campos inválidos em `detalhes.campos`, sem as mensagens do Zod, que são em inglês;
  - toda operação lê a coleção do armazenamento na hora, sem guardar cópia em memória, para que uma aba não sobrescreva o que outra gravou;
  - `excluir` preenche `arquivadoEm` (RN31), `listar` ignora arquivados por padrão, e `recuperar` limpa o `arquivadoEm`;
  - `obter` de um `id` inexistente gera `nao_encontrado`.
- [ ] T014 Criar `system-onPath-web-front/src/dados/local/servicos.ts` com `criarServicosLocais(): Servicos`, que monta as 15 coleções com `criarServicoColecao`. Em `projetos`, `criar` e `alterar` preenchem `areaId` a partir do grupo (RN01, `data-model.md`). O `dados` fica com métodos que lançam um `Error` comum do JavaScript ("não implementado"), que só existe durante o desenvolvimento, até as fases 4 e 5.
- [ ] T015 Criar `system-onPath-web-front/src/dados/ServicosProvider.tsx`, com o `ServicosProvider` (recebe `servicos` e cria um `QueryClient`) e o hook `useServicos()`. Criar também `system-onPath-web-front/src/dados/consultas.ts`, com `useLista(nomeColecao)` e `useInvalidarTudo()` sobre o TanStack Query. As telas só importam deste arquivo e do provedor.
- [ ] T016 [P] Escrever `system-onPath-web-front/__tests__/colecao.test.ts`, que cobre criar, listar, obter, alterar, excluir (arquivar), recuperar, `incluirArquivados`, `nao_encontrado`, `dados_invalidos` e a persistência depois de recriar o serviço sobre o mesmo `localStorage`.

**Ponto de controle**: `npm test` e `npm run typecheck` passam em `system-onPath-web-front/`.

---

## Fase 3: História 1, navegar pelo app vazio (P1) 🎯 MVP

**Objetivo**: ter um menu lateral fixo com as 9 telas, cada uma com endereço próprio, além da
página de não encontrada.

**Teste independente**: o cenário 1 do `quickstart.md`.

- [ ] T017 [P] [US1] Criar `system-onPath-web-front/src/components/TelaBase.tsx`: uma moldura de conteúdo que recebe `titulo` e `children`, com fundo `branco`, título em Inter seminegrito e espaçamentos do tema, sem cores literais.
- [ ] T018 [P] [US1] Criar `system-onPath-web-front/src/components/MenuLateral.tsx`, com os 9 itens de `contracts/rotas.md` na ordem e os rótulos de `t("menu.*")`. Usar o `Link` do Expo Router e marcar o item ativo com `usePathname()` e o tom de cinza do tema. Mostrar o nome "OnPath" no topo, com o detalhe roxo permitido ao logo. A largura é fixa, e a borda direita é `cinza.200`.
- [ ] T019 [US1] Criar `system-onPath-web-front/app/_layout.tsx`. Ele carrega a Inter com `useFonts`, mantém a tela de abertura até a fonte carregar e envolve o app em `ServicosProvider` com `criarServicosLocais()`. A moldura é uma linha com o `MenuLateral` à esquerda e o `<Slot />` à direita, ocupando a altura toda da janela.
- [ ] T020 [P] [US1] Criar as 9 telas `system-onPath-web-front/app/index.tsx`, `caixa.tsx`, `tarefas.tsx`, `projetos.tsx`, `areas.tsx`, `agenda.tsx`, `rotinas.tsx`, `estudos.tsx` e `ajustes.tsx`. Cada uma mostra só `<TelaBase titulo={t("telas.<nome>.titulo")} />`.
- [ ] T021 [P] [US1] Criar `system-onPath-web-front/app/+not-found.tsx` com `TelaBase`, a mensagem `t("naoEncontrada.mensagem")` e um `Link` para `/` com `t("naoEncontrada.voltar")` (FR-007).

**Ponto de controle**: o cenário 1 do `quickstart.md` passa.

---

## Fase 4: História 2, dados iniciais no primeiro uso (P2)

**Objetivo**: criar os dados da seção 5 do `docs/spec.md` uma única vez.

**Teste independente**: o cenário 2 do `quickstart.md` e `system-onPath-web-front/__tests__/carga.test.ts`.

- [ ] T022 [P] [US2] Criar `system-onPath-web-front/src/dados/iniciais.ts`, com a função pura `montarDadosIniciais(agora: string)`, que devolve os registros completos (com `id` e datas) de 6 áreas, 5 grupos, 10 projetos e 12 rotinas, exatamente como nas tabelas "Dados iniciais" de `data-model.md`. Os grupos referenciam a área pelo `id`, os projetos herdam o `areaId` do grupo, e a `posicaoFila` segue o documento. As cores das áreas são tons de `cinza` do tema, e os nomes ficam em português no próprio arquivo, porque são dados, não textos de tela.
- [ ] T023 [P] [US2] Criar `system-onPath-web-front/src/plataforma/trava.web.ts`, com `comTrava(nome, fn)`. Se `navigator.locks` existir, a função usa `navigator.locks.request(nome, fn)`. Senão, executa `fn` direto (`research.md`, item 5).
- [ ] T024 [US2] Criar `system-onPath-web-front/src/dados/local/carga.ts`, com `prepararPrimeiroUso()`. Dentro de `comTrava("onpath-carga")`, a função lê a meta. Se `dadosIniciaisEm` for `null`, grava todas as coleções de `montarDadosIniciais` junto com a meta (`versaoEsquema: 1`, `dadosIniciaisEm` igual a agora) em uma única chamada de `gravar`, e devolve `{ criou }`. A leitura da meta e o `gravar` acontecem sem nenhum `await` entre eles. Só as coleções vazias recebem os dados iniciais, e as que já têm registros ficam como estão. Ligar essa função a `servicos.dados.prepararPrimeiroUso` em `system-onPath-web-front/src/dados/local/servicos.ts`.
- [ ] T025 [US2] Criar `system-onPath-web-front/src/components/PreparoPrimeiroUso.tsx`. Ele chama `useServicos().dados.prepararPrimeiroUso()` uma vez e mostra `t("carregando")` enquanto espera. Em caso de `ErroOnPath`, mostra a mensagem do erro com `t("erros.acao.liberarArmazenamento")`. Em `system-onPath-web-front/app/_layout.tsx`, envolver o `<Slot />` com ele.
- [ ] T026 [P] [US2] Escrever `system-onPath-web-front/__tests__/carga.test.ts`, que confere:
  - no primeiro uso, as quantidades são 6, 5, 10 e 12, e cada projeto tem o `areaId` do seu grupo;
  - depois de 10 chamadas, as quantidades não mudam;
  - duas chamadas simultâneas não duplicam os dados;
  - depois de arquivar uma área, ela não volta.

**Ponto de controle**: o cenário 2 do `quickstart.md` e o `carga.test.ts` passam.

---

## Fase 5: História 3, cópia dos dados (P3)

**Objetivo**: exportar e importar todos os dados em JSON a partir da tela Ajustes.

**Teste independente**: o cenário 3 do `quickstart.md` e `system-onPath-web-front/__tests__/copia.test.ts`.

- [ ] T027 [US3] Criar `system-onPath-web-front/src/dados/local/copia.ts`:
  - `esquemaCopia` (Zod) segue `contracts/copia-dados.md`: `formato` literal `"onpath-copia"`, `versao` inteira de 1 até `VERSAO_COPIA = 1` e as 15 coleções obrigatórias.
  - `exportarCopia()` lê todas as coleções, inclusive as arquivadas, e grava `ultimaExportacaoEm` na meta.
  - `importarCopia(conteudo)` valida o esquema. Uma falha gera `copia_invalida`, e uma versão maior que a atual gera `copia_versao_desconhecida`. Depois, confere cada referência (`areaId`, `grupoId`, `metaId`, `projetoId`, `materiaId`, `colunaId`, `tarefaPaiId`, `tarefaId`, `rotinaId`, `sessaoEstudoId` e `topicoId`), e uma referência quebrada gera `copia_referencia_quebrada` com o registro em `detalhes`. Só então grava todas as coleções e a meta com `dadosIniciaisEm` igual a agora, em uma única chamada de `gravar`, e devolve `{ registros }`.
  - Ligar as duas funções a `servicos.dados` em `system-onPath-web-front/src/dados/local/servicos.ts`.
- [ ] T028 [P] [US3] Criar `system-onPath-web-front/src/plataforma/arquivos.web.ts`, com `baixarJson(nomeArquivo, objeto)` (`Blob` e link temporário) e `escolherArquivoJson(): Promise<string | null>` (`<input type="file" accept="application/json">` escondido, lido com `FileReader`). A função devolve `null` se o usuário cancelar.
- [ ] T029 [US3] Acrescentar a `system-onPath-web-front/src/dados/consultas.ts` os hooks `useExportarDados()` e `useImportarDados()` (mutações do TanStack Query). A importação invalida todas as consultas ao terminar. Os hooks só chamam `servicos.dados` e nunca acessam o armazenamento.
- [ ] T030 [US3] Criar `system-onPath-web-front/src/features/ajustes/CopiaDados.tsx`, com a seção `t("ajustes.copia.titulo")`:
  - **Exportar** baixa o arquivo `onpath-copia-AAAA-MM-DD.json`, com a data local.
  - **Importar** escolhe o arquivo e, se já existirem dados, mostra uma confirmação dentro da página com `t("ajustes.copia.confirmarSubstituir")`, sem usar `window.confirm`.
  - Mostrar o resultado (`t("ajustes.copia.importado", { registros })`) ou a mensagem do `ErroOnPath`.
  - São no máximo 3 cliques por ação (SC-007), e os textos e cores vêm de `t` e do tema.
- [ ] T031 [US3] Em `system-onPath-web-front/app/ajustes.tsx`, mostrar `<CopiaDados />` dentro da `TelaBase` (FR-024).
- [ ] T032 [P] [US3] Escrever `system-onPath-web-front/__tests__/copia.test.ts`, que confere:
  - uma cópia exportada e importada depois de `limparTudo()` reproduz 100% dos registros, inclusive os arquivados;
  - depois de importar, `prepararPrimeiroUso` devolve `{ criou: false }`;
  - texto que não é JSON, `formato` errado, `versao: 2`, coleção faltando e referência quebrada são recusados, sem alterar os dados que já existiam;
  - se o armazenamento falhar no meio da importação (simular `setItem` lançando erro na 5ª chave), os dados anteriores continuam intactos.

**Ponto de controle**: o cenário 3 do `quickstart.md` e o `copia.test.ts` passam.

---

## Fase 6: Fechamento

- [ ] T033 [P] Rodar as verificações do cenário 4 do `quickstart.md`: nenhuma importação de `dados/local` e nenhuma cor literal em `system-onPath-web-front/app/`, `system-onPath-web-front/src/components/` e `system-onPath-web-front/src/features/`. Corrigir o que aparecer.
- [ ] T034 [P] Revisar se existe texto visível escrito direto nos componentes de `system-onPath-web-front/app/`, `system-onPath-web-front/src/components/` e `system-onPath-web-front/src/features/`, e levá-lo para `system-onPath-web-front/src/i18n/pt-BR.ts`.
- [ ] T035 Rodar `npm test` e `npm run typecheck` em `system-onPath-web-front/` e percorrer todos os cenários do `quickstart.md` no navegador, conferindo também que a troca de tela parece imediata e que exportar e importar levam menos de 1 s (metas de desempenho do `plan.md`).
- [ ] T036 Marcar T001 a T005 em `docs/tasks.md` e registrar em `docs/plan.md` qualquer decisão que tenha mudado durante a implementação (constituição, princípio II).

---

## Dependências e ordem

- **Fase 1** não depende de nada.
- **Fase 2** depende da Fase 1 e bloqueia todas as histórias.
- **US1 (Fase 3)** depende só da Fase 2. É o MVP.
- **US2 (Fase 4)** depende da Fase 2. A T025 altera o `_layout.tsx` criado na T019, então vem
  depois da US1.
- **US3 (Fase 5)** depende da Fase 2. A T031 usa a tela `ajustes.tsx` da T020, e o teste da T032
  usa a carga da T024. Por isso, a US3 vem depois da US1 e da US2.
- **Fase 6** vem depois de todas as histórias.

Dentro de cada fase, as tarefas sem [P] seguem a ordem dos IDs.

## Execução em paralelo

```text
Fase 2:  T006 (tema) | T007 (textos) | T008 (erros) | T009 (id)  → depois T010 → T011 → T012 → T013 → T014 → T015
         T016 (teste) assim que a T013 terminar
US1:     T017 | T018  → T019 → T020 | T021
US2:     T022 | T023  → T024 → T025;  T026 assim que a T024 terminar
US3:     T027 | T028  → T029 → T030 → T031;  T032 assim que a T027 terminar
```

## Estratégia

1. **MVP**: as fases 1, 2 e 3. O app abre, navega e já tem a camada de dados testada.
2. **Incremento 2**: a US2. Os dados reais aparecem no primeiro uso.
3. **Incremento 3**: a US3. Fica possível exportar e restaurar, o que protege os dados antes do
   marco da Etapa 3, quando o app passa a ser usado de verdade.
4. Faça um commit ao fim de cada fase, com o ponto de controle conferido.
