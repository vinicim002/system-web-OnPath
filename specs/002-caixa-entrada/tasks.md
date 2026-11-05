---
description: "Lista de tarefas da Caixa de entrada (Etapa 1)"
---

# Tarefas: Caixa de entrada

**Entrada**: documentos de `specs/002-caixa-entrada/`

**Pré-requisitos**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Testes**: o serviço da caixa tem testes Vitest em `__tests__/caixa.test.ts` (`research.md`,
item 9). As telas são validadas pelo `quickstart.md`.

**Relação com `docs/tasks.md`**: as tarefas abaixo cobrem a T006 do `docs/tasks.md`, que só é
marcada na fase final.

## Formato: `[ID] [P?] [História] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente).
- **[US1] a [US4]**: as histórias 1 a 4 do `spec.md`.
- Os caminhos partem de `system-onPath-web-front/`, salvo quando indicado.

---

## Fase 1: Preparação

**Objetivo**: instalar os componentes do shadcn/ui que a caixa usa.

- [ ] T001 Adicionar os componentes `dialog`, `textarea`, `tabs` e `sonner` do shadcn/ui com `npx shadcn@latest add dialog textarea tabs sonner`. Conferir em `src/components/ui/` que todos importam `cn` de `@/lib/utils` (e não de um pacote `cn`), remover o pacote `cn` se ele aparecer em `package.json`, e trocar cores fora do tema (`black`, `white` e similares) por `preto` e `branco`. No `src/components/ui/sonner.tsx`, remover o uso de `next-themes`, se houver, e fixar o tema claro.

---

## Fase 2: Base (bloqueia as histórias)

**Objetivo**: o contrato e a implementação local do serviço da caixa, com testes, e os textos.

- [ ] T002 Em `src/dados/contratos.ts`, criar `ServicoItensCaixa`, que estende `ServicoColecao<ItemCaixa, NovoItemCaixa, AlteracaoItemCaixa>` com `listarNovos()`, `listarDescartados()`, `capturar(conteudo)`, `descartar(id)` e `recuperar(id)`, como em `contracts/servico-itens-caixa.md`. Trocar o tipo de `itensCaixa` em `Servicos` para `ServicoItensCaixa`.
- [ ] T003 [P] Escrever `__tests__/caixa.test.ts` com os casos do contrato: `capturar("  ideia  ")` grava `"ideia"` com `status = novo` e `arquivadoEm` vazio; texto vazio ou só espaços dá `dados_invalidos` e não grava nada; quebras de linha são mantidas; `listarNovos` vem do mais novo para o mais antigo; `descartar` grava `status = descartado` e `arquivadoEm` na mesma escrita; `excluir` faz o mesmo; descartar de novo não muda o item; `recuperar` volta para `novo` com `arquivadoEm` vazio; o item recuperado volta à mesma posição de `listarNovos`; `listarDescartados` traz só descartados, do descarte mais recente ao mais antigo; `alterar` com texto vazio dá `dados_invalidos`; `nao_encontrado` para id inexistente; a cópia exportada inclui os descartados. Os testes devem falhar antes da T004.
- [ ] T004 Criar `src/dados/local/caixa.ts` com `criarServicoItensCaixa()`, que usa `criarServicoColecao("itensCaixa", ...)` e acrescenta os métodos do contrato. Regra do `data-model.md`: "`status = descartado` se, e somente se, `arquivadoEm` estiver preenchido. O serviço grava os dois campos na mesma escrita." `capturar` remove os espaços das pontas e cria com `status: "novo"`. `excluir` chama `descartar`. Em `src/dados/local/servicos.ts`, usar `criarServicoItensCaixa()` em `itensCaixa`. Rodar `npm test` até a T003 passar.
- [ ] T005 [P] Em `src/dados/consultas.ts`, criar `useItensNovos()` (chave `["itensCaixa", "novos"]`), `useItensDescartados()` (chave `["itensCaixa", "descartados"]`), `useCapturarItem()`, `useDescartarItem()`, `useRecuperarItem()` e `useEditarItem()`. Toda escrita invalida a chave `["itensCaixa"]`.
- [ ] T006 [P] Em `src/i18n/pt-BR.ts`, criar as chaves `caixa.*` e `menu.anotar` listadas em `contracts/interface.md`: dica do campo ("Anote uma ideia…", "Enter para salvar · Shift+Enter para nova linha"), abas ("Caixa", "Descartados"), listas vazias, rótulos de editar, descartar e recuperar, avisos ("Item descartado", "Desfazer", "Item recuperado", "Anotado na caixa") e campo rápido (`caixa.rapida.titulo` "Anotar na caixa" e `caixa.rapida.dica` "Enter para salvar · Esc para fechar").
- [ ] T007 [P] Criar `src/i18n/datas.ts` com `tempoRelativo(dataIso, agora?)` ("agora", "há 5 minutos", "há 2 horas", "ontem", "há 3 dias"), usando `Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })`, e `dataCurta(dataIso)` ("5 de nov., 14:30"), usando `Intl.DateTimeFormat("pt-BR")` com `timeZone: "America/Sao_Paulo"`.
- [ ] T008 Em `src/components/Moldura.tsx`, renderizar o `Toaster` de `src/components/ui/sonner.tsx` (no canto inferior direito), para que os avisos funcionem em todas as telas.

**Ponto de controle**: `npm test` e `npm run typecheck` passam.

---

## Fase 3: História 1, anotar uma ideia só com texto (P1) 🎯 MVP

**Objetivo**: anotar na tela Caixa e ver a lista de itens novos.

**Teste independente**: abrir `/caixa`, anotar com Enter, conferir que o item está no topo e
continua depois de recarregar (`quickstart.md`, cenário 1).

- [ ] T009 [P] [US1] Criar `src/features/caixa/CampoAnotacao.tsx`: `Textarea` que cresce com o conteúdo e recebe `aoSalvar(conteudo): Promise<boolean>` e `focarAoMontar`. Enter salva e Shift+Enter quebra a linha. Enter durante `isComposing` não salva. Texto vazio ou só espaços não chama `aoSalvar`. Se `aoSalvar` devolver `true`, limpa o campo e mantém o foco. Se devolver `false`, mantém o texto. Mostra a dica `caixa.dicaCampo` abaixo do campo.
- [ ] T010 [P] [US1] Criar `src/features/caixa/ItemCaixa.tsx`: mostra o texto inteiro, com as quebras de linha (`whitespace-pre-wrap`, `break-words`), e o tempo relativo de `criadoEm` com `tempoRelativo`. Reservar o espaço das ações, que entram nas histórias 2 e 3.
- [ ] T011 [US1] Criar `src/features/caixa/ListaCaixa.tsx` com `useItensNovos()`: lista os itens com `ItemCaixa`, do mais novo para o mais antigo. Com a lista vazia, mostra `caixa.vazia`.
- [ ] T012 [US1] Em `src/telas/Caixa.tsx`, montar `CampoAnotacao` (com foco ao abrir) e `ListaCaixa` dentro de `TelaBase`. O `aoSalvar` chama `useCapturarItem()`. Em erro, mostra aviso com a mensagem do `ErroOnPath` e, para `armazenamento_indisponivel`, a ação `erros.acao.liberarArmazenamento`, e devolve `false` para manter o texto.
- [ ] T013 [US1] Em `src/components/MenuLateral.tsx`, mostrar ao lado de "Caixa de entrada" o número de itens de `useItensNovos()`, escondido quando for zero (FR-008).

**Ponto de controle**: o cenário 1 do `quickstart.md` passa. A T006 do `docs/tasks.md` já
cumpre o "Pronto quando".

---

## Fase 4: História 2, descartar e recuperar (P2)

**Objetivo**: descartar com "Desfazer" e recuperar pela aba de descartados.

**Teste independente**: descartar, desfazer, descartar de novo e recuperar pela aba
(`quickstart.md`, cenário 2).

- [ ] T014 [US2] Em `src/features/caixa/ItemCaixa.tsx`, acrescentar o botão de descartar (`Button` `ghost` com ícone `X` do lucide e `aria-label` `caixa.descartar`), visível ao passar o mouse ou com foco no item. Ao clicar, chama `useDescartarItem()` sem confirmação e mostra o aviso `caixa.avisos.descartado` por 5 s com a ação `caixa.avisos.desfazer`, que chama `useRecuperarItem()`. Em erro, mostra o aviso de erro.
- [ ] T015 [P] [US2] Criar `src/features/caixa/ItemDescartado.tsx`: texto do item, data do descarte (`arquivadoEm`) com `dataCurta`, e o botão `caixa.recuperar`, que chama `useRecuperarItem()` e mostra o aviso `caixa.avisos.recuperado`.
- [ ] T016 [US2] Em `src/features/caixa/ListaCaixa.tsx`, colocar as abas (`Tabs`) "Caixa" e "Descartados", cada uma com a contagem. A aba Descartados lista `useItensDescartados()` com `ItemDescartado`. Com a lista vazia, mostra `caixa.descartadosVazia`.

**Ponto de controle**: os cenários 1 e 2 do `quickstart.md` passam.

---

## Fase 5: História 4, anotar de qualquer tela (P2)

**Objetivo**: o campo rápido, aberto por Ctrl+K (⌘K no Mac) ou pelo botão "Anotar" do menu.

**Teste independente**: em `/projetos`, anotar pelo atalho e pelo botão, sem sair da tela
(`quickstart.md`, cenário 4).

- [ ] T017 [P] [US4] Criar `src/features/caixa/useAtalhoCaptura.ts`: escuta `keydown` na `window` e, com Ctrl+K (ou ⌘K no Mac), chama `preventDefault` e o callback recebido. Funciona com o foco em campos de texto e ignora a tecla repetida (`event.repeat`). Exportar também `textoAtalho()`, que devolve "Ctrl K" ou "⌘K" conforme a plataforma.
- [ ] T018 [P] [US4] Criar `src/features/caixa/CapturaRapida.tsx`: `Dialog` controlado (`aberta`, `aoMudar`) com o título `caixa.rapida.titulo` e um `CampoAnotacao` com foco e a dica `caixa.rapida.dica`. Ao salvar com sucesso, fecha e mostra o aviso `caixa.avisos.anotado`. Em erro, mantém aberto com o texto e mostra o aviso de erro. Esc e o clique fora fecham sem criar nada.
- [ ] T019 [US4] Em `src/components/Moldura.tsx`, guardar o estado `capturaAberta`, ligar `useAtalhoCaptura(() => setCapturaAberta(true))` e renderizar `CapturaRapida`. Como o estado só abre, apertar o atalho com o campo aberto não abre outro. Passar `abrirCaptura` para o `MenuLateral`.
- [ ] T020 [US4] Em `src/components/MenuLateral.tsx`, colocar abaixo do logo o botão `menu.anotar` (ícone `Plus` do lucide, variante `outline`, largura total), com o atalho de `textoAtalho()` à direita, em `text-cinza-500`. Ao clicar, chama `abrirCaptura`.

**Ponto de controle**: os cenários 1, 2 e 4 do `quickstart.md` passam.

---

## Fase 6: História 3, corrigir o texto de um item (P3)

**Objetivo**: editar o texto na própria lista.

**Teste independente**: editar, salvar, cancelar e tentar salvar vazio (`quickstart.md`,
cenário 3).

- [ ] T021 [US3] Em `src/features/caixa/ItemCaixa.tsx`, acrescentar o botão de editar (ícone `Pencil`, `aria-label` `caixa.editar`), ao lado do de descartar. Ao clicar, troca o texto por um `Textarea` com o texto atual e o foco. Enter salva com `useEditarItem()`, Shift+Enter quebra a linha, Esc cancela e volta o texto anterior. Texto vazio ou só espaços cancela sem salvar. Em erro, mantém a edição aberta e mostra o aviso de erro.

**Ponto de controle**: os cenários 1 a 4 do `quickstart.md` passam.

---

## Fase 7: Acabamento

**Objetivo**: validar tudo e registrar a conclusão.

- [ ] T022 Rodar `npm test`, `npm run typecheck`, `npm run lint` e `npm run build` em `system-onPath-web-front/`, e os greps do cenário 7 do `quickstart.md`.
- [ ] T023 Rodar no navegador os cenários 1 a 6 do `quickstart.md`, incluindo 500 itens criados pelo serviço para o SC-005.
- [ ] T024 Marcar a T006 em `docs/tasks.md` (caminho a partir de `system-web-onPath/`) e marcar como atendidos, na seção 6.2 de `docs/spec.md`, os critérios "Um item é criado só com texto (RN03)", "A captura funciona com poucos cliques, sem abrir outra tela" e "Um item pode ser descartado e recuperado (RN31)". Os critérios de transformar o item ficam para a T010.

---

## Dependências e ordem

- **Fase 1** não depende de nada.
- **Fase 2** depende da Fase 1 e bloqueia as histórias. A T003 (testes) vem antes da T004.
- **História 1 (Fase 3)** depende da Fase 2.
- **Histórias 2 e 4 (Fases 4 e 5)** dependem da história 1, porque usam `ItemCaixa`,
  `ListaCaixa` e `CampoAnotacao`. Elas não dependem uma da outra, mas as duas mexem em
  arquivos diferentes do `MenuLateral` e do `ItemCaixa`, então siga a ordem.
- **História 3 (Fase 6)** depende da história 2, porque divide o espaço de ações do `ItemCaixa`.
- **Fase 7** vem por último.

Dentro de cada fase, as tarefas sem [P] seguem a ordem dos IDs.

## Execução em paralelo

```text
Fase 2:  T002 → T003 (teste) → T004;  T005 | T006 | T007 depois da T002;  T008 depois da Fase 1
US1:     T009 | T010  → T011 → T012 → T013
US2:     T014;  T015 em paralelo  → T016
US4:     T017 | T018  → T019 → T020
US3:     T021
```

## Estratégia

1. **MVP**: as fases 1, 2 e 3. A caixa já anota e lista, e cumpre o "Pronto quando" da T006.
2. **Incremento 2**: a história 2. O descarte com desfazer mantém a caixa limpa sem perder nada.
3. **Incremento 3**: a história 4. A captura sai da tela Caixa e funciona em todo o app.
4. **Incremento 4**: a história 3. A edição corrige anotações feitas com pressa.
5. Faça um commit ao fim de cada fase, com o ponto de controle conferido.
