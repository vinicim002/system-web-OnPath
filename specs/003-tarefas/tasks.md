---
description: "Lista de tarefas da Etapa 2 (Tarefas)"
---

# Tarefas: Tarefas

**Entrada**: documentos de `specs/003-tarefas/`

**Pré-requisitos**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Testes**: o serviço de tarefas tem testes Vitest em `__tests__/tarefas.test.ts` (`research.md`,
item 13). As telas são validadas pelo `quickstart.md`.

**Relação com `docs/tasks.md`**: cobre as tarefas T007 a T010, marcadas só na fase final.

## Formato: `[ID] [P?] [História] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente).
- **[US1] a [US4]**: as histórias 1 a 4 do `spec.md`.
- Os caminhos partem de `system-onPath-web-front/`, salvo quando indicado.

---

## Fase 1: Preparação

**Objetivo**: instalar o que a etapa usa.

- [X] T001 Instalar `react-hook-form` e `@hookform/resolvers`, e adicionar os componentes `select` e `checkbox` com `npx shadcn@latest add select checkbox`. Depois, como nas etapas anteriores: em `src/components/ui/`, trocar `import { cn } from "cn"` por `@/lib/utils`, remover o pacote `cn` (e `next-themes`, se aparecer) do `package.json`, trocar cores fora do tema (`black`, `white`) por `preto` e `branco`, e trocar textos em inglês por chaves de `src/i18n/pt-BR.ts`.

---

## Fase 2: Base (bloqueia as histórias)

**Objetivo**: modelo, erros, contrato, regras puras, escrita em lote e textos.

- [X] T002 Em `src/dados/tipos.ts`, acrescentar `anotacoes: opcional(z.string())` em `tarefas`. Conferir que `npm test` continua passando, inclusive a importação de cópias antigas sem o campo.
- [X] T003 [P] Em `src/dados/erros.ts`, acrescentar os códigos `ciclo_subtarefa`, `subtarefas_abertas` e `item_indisponivel`, com as mensagens em `erros.*` de `src/i18n/pt-BR.ts` ("Uma tarefa não pode ficar dentro dela mesma. Escolha outra tarefa principal.", "Esta tarefa tem subtarefas abertas. Confirme para concluir todas.", "Este item não está mais na caixa. Recupere-o antes de transformá-lo em tarefa.").
- [X] T004 [P] Em `src/dados/contratos.ts`, criar `FiltrosTarefas` e `ServicoTarefas`, exatamente como em `contracts/servico-tarefas.md`, e trocar o tipo de `tarefas` em `Servicos`.
- [X] T005 [P] Criar `src/dados/regrasTarefas.ts` com funções puras: `filtrarTarefas(tarefas, filtros)` (status padrão `aberta`; `projetoId: "avulsa"` = sem projeto e sem matéria; um filtro vale para a tarefa principal, e uma subtarefa que atenda ao filtro traz a principal dela), `ordenarTarefas` (prioridade alta → média → baixa, prazo mais próximo com vazio por último, `criadoEm`), `montarArvore(tarefas)` (principais com `subtarefas` aninhadas) e `estaAtrasada(tarefa, hoje)` (aberta e `prazo < hoje`).
- [X] T006 [P] Em `src/dados/local/colecao.ts`, acrescentar à `ColecaoLocal` o método `gravarVarios(mudancas: { id: string; campos: Objeto }[])`, que aplica `completar`, valida todos e grava em uma única escrita, ou não grava nada se algum falhar.
- [X] T007 [P] Em `src/i18n/datas.ts`, acrescentar `hoje()` (AAAA-MM-DD no fuso `America/Sao_Paulo`) e `dataPrazo(data)` ("10 de nov."). Em `src/i18n/pt-BR.ts`, criar as chaves `tarefas.*` de `contracts/interface.md`: título, nova tarefa, filtros (área, projeto, avulsas, matéria, prioridade, status, abertas, concluídas, canceladas, todas, limpar), campos (título, vínculo, projeto, matéria, avulsa, área, prioridade, tempo em minutos, prazo, anotações), prioridades (alta, média, baixa), status, ações (concluir, reabrir, cancelar, excluir, mover, salvar, fechar, adicionar subtarefa), avisos (criada, excluída, desfazer), confirmação de subtarefas ("Concluir também {quantidade} subtarefas abertas?"), dica de herança ("Herdado de {tarefa}"), atrasada, lista vazia, sem matérias, e `tarefas.erros.*` por campo (título, área, prioridade, tempo, projeto, matéria). Em `caixa.*`, acrescentar `virarTarefa`, `avisos.virouTarefa` ("Item virou tarefa") e `avisos.verTarefa`.

**Ponto de controle**: `npm test` e `npm run typecheck` passam.

---

## Fase 3: História 1, criar uma tarefa válida (P1) 🎯 MVP

**Objetivo**: o serviço de tarefas com as regras de criação e a tela com o formulário.

**Teste independente**: `quickstart.md`, cenário 1.

- [X] T008 [US1] Escrever em `__tests__/tarefas.test.ts` os testes de criação: tarefa completa avulsa; falta de `titulo`, `areaId`, `prioridade` ou `tempoEstimadoMin` dá `dados_invalidos` com `campos` listando cada um; prioridade fora de alta/média/baixa é recusada; `projetoId` e `materiaId` juntos são recusados; com projeto, `areaId` vira a área do projeto mesmo se outra for informada; com matéria, idem; projeto arquivado ou inexistente é recusado; título é gravado sem espaços nas pontas; `anotacoes` vazio vira `null`. Os testes devem falhar antes da T009.
- [X] T009 [US1] Criar `src/dados/local/tarefas.ts` com `criarServicoTarefas()`, sobre `criarServicoColecao("tarefas", …)`, implementando `criar` com as regras 1 a 3 do `data-model.md`. Em `src/dados/local/servicos.ts`, usar `criarServicoTarefas()`. Implementar também `listarFiltradas` com `filtrarTarefas` e `ordenarTarefas`. Rodar `npm test` até a T008 passar.
- [X] T010 [P] [US1] Em `src/dados/consultas.ts`, criar `useTarefas(filtros)`, `useTarefa(id)`, `useSubtarefas(id)`, `useOpcoesTarefa()` (áreas, projetos e matérias ativos, por ordem) e as escritas de `contracts/servico-tarefas.md`, todas invalidando `["tarefas"]`; `useCriarTarefaDeItem` também invalida `["itensCaixa"]`.
- [X] T011 [US1] Criar `src/features/tarefas/FormularioTarefa.tsx` com `react-hook-form` e `zodResolver`: título, vínculo (Projeto, Matéria ou Avulsa) com a seleção correspondente, área (travada e preenchida quando vem do projeto ou matéria), prioridade, tempo estimado em minutos, prazo e anotações. Props: `valoresIniciais`, `modo` (`principal` ou `subtarefa`, que mostra os herdados só para leitura com "Herdado de {tarefa}"), `aoSalvar(dados): Promise<ErroOnPath | null>` e `aoCancelar`. Erros do serviço com `campos` aparecem embaixo de cada campo. Sem matérias, a opção Matéria fica desativada com a dica.
- [X] T012 [US1] Criar `src/telas/Tarefas.tsx` com o layout de duas colunas de `contracts/interface.md` e o botão "Nova tarefa", que abre o painel à direita com o `FormularioTarefa` vazio. Ao salvar, mostra o aviso `tarefas.avisos.criada` e abre a tarefa criada no painel. A lista, por enquanto, mostra as tarefas abertas com `useTarefas()`.

**Ponto de controle**: cenário 1 do `quickstart.md` passa. A T007 do `docs/tasks.md` cumpre o
"Pronto quando".

---

## Fase 4: História 2, ver, filtrar e concluir (P2)

**Objetivo**: lista completa, filtros, painel de edição, concluir, reabrir, cancelar e excluir.

**Teste independente**: `quickstart.md`, cenário 2.

- [ ] T013 [US2] Acrescentar em `__tests__/tarefas.test.ts`: `alterar` aplica as mesmas regras da criação; `concluir` grava `status = concluida` e `concluidaEm`; `reabrir` volta para `aberta` com `concluidaEm` vazio; `cancelar` grava `cancelada`; `excluir` arquiva e `recuperar` desarquiva; `listarFiltradas` respeita cada filtro, a combinação deles, `avulsa`, o padrão `aberta` e a ordem (prioridade, prazo, criação). Implementar em `src/dados/local/tarefas.ts` até passar.
- [ ] T014 [P] [US2] Criar `src/features/tarefas/FiltrosTarefas.tsx`: seleções de área, projeto (com "Avulsas"), matéria, prioridade e status, ligadas aos parâmetros do endereço (`useSearchParams`), e "Limpar filtros".
- [ ] T015 [P] [US2] Criar `src/features/tarefas/acoes.ts` (`useAcoesTarefas`, criado uma vez para a lista, como em `src/features/caixa/acoes.ts`) com concluir, reabrir e excluir com aviso "Desfazer". Concluir que recebe `subtarefas_abertas` devolve o pedido de confirmação para a tela.
- [ ] T016 [US2] Criar `src/features/tarefas/LinhaTarefa.tsx` (memorizada): botão de concluir/reabrir (`Checkbox`), título, prioridade, área, vínculo, tempo, prazo com `dataPrazo` e "Atrasada" quando `estaAtrasada`. Clique abre o painel (`?tarefa=id`). E `src/features/tarefas/ListaTarefas.tsx`, com a lista vazia mostrando o filtro atual.
- [ ] T017 [US2] Criar `src/features/tarefas/PainelTarefa.tsx`: carrega a tarefa de `?tarefa=id`, mostra o `FormularioTarefa` preenchido (salvar chama `useAlterarTarefa`) e as ações Concluir/Reabrir, Cancelar e Excluir. Fecha com ✕ ou Esc, removendo `tarefa` do endereço. Ligar `FiltrosTarefas`, `ListaTarefas` e `PainelTarefa` em `src/telas/Tarefas.tsx`.

**Ponto de controle**: cenários 1 e 2 do `quickstart.md` passam.

---

## Fase 5: História 3, subtarefas (P2)

**Objetivo**: subtarefas em vários níveis, herança, ciclos e conclusão com confirmação.

**Teste independente**: `quickstart.md`, cenário 3.

- [ ] T018 [US3] Acrescentar em `__tests__/tarefas.test.ts`: `criarSubtarefa` só com título herda `areaId`, `prioridade`, `projetoId` e `materiaId` do topo (inclusive no terceiro nível); mudar esses campos no topo propaga para todos os níveis na mesma escrita; `alterar` numa subtarefa ignora os campos herdados; `mover` para dentro de si ou de uma descendente dá `ciclo_subtarefa` e não grava nada; `mover` para o topo sem `tempoEstimadoMin` dá `dados_invalidos` com `campos: ["tempoEstimadoMin"]`; `mover` para outra principal herda os campos dela; `concluir` com subtarefas abertas dá `subtarefas_abertas` com a quantidade, e com `incluirSubtarefas: true` conclui todas; `excluir` arquiva a árvore e `recuperar` devolve a árvore. Implementar em `src/dados/local/tarefas.ts` com `gravarVarios` até passar.
- [ ] T019 [P] [US3] Criar `src/features/tarefas/ArvoreSubtarefas.tsx`: subtarefas da tarefa aberta, em vários níveis, com concluir, abrir (troca `?tarefa=` para a subtarefa) e o campo "+ Subtarefa" (Enter cria com `useCriarSubtarefa`) em cada nível.
- [ ] T020 [P] [US3] Criar `src/features/tarefas/MoverTarefa.tsx`: escolher a nova tarefa principal (lista das tarefas ativas, sem a própria e as descendentes) ou "Tornar tarefa principal", que pede o tempo estimado. Erro `ciclo_subtarefa` vira aviso.
- [ ] T021 [US3] Em `src/features/tarefas/PainelTarefa.tsx`, mostrar a `ArvoreSubtarefas`, a ação "Mover para…", o modo `subtarefa` do formulário quando `tarefaPaiId` existe, e o `AlertDialog` de confirmação ao concluir com subtarefas abertas (também na lista, via `acoes.ts`). Em `LinhaTarefa.tsx` e `ListaTarefas.tsx`, a seta que expande as subtarefas.

**Ponto de controle**: cenários 1 a 3 do `quickstart.md` passam. A T008 do `docs/tasks.md`
cumpre o "Pronto quando".

---

## Fase 6: História 4, item da caixa vira tarefa (P3)

**Objetivo**: converter um item da caixa pelo formulário de tarefa.

**Teste independente**: `quickstart.md`, cenário 4.

- [ ] T022 [US4] Acrescentar em `__tests__/tarefas.test.ts`: `criarDeItemCaixa` cria a tarefa e grava o item com `status = processado` na mesma escrita; com dados inválidos, não cria a tarefa e o item continua `novo`; item descartado ou processado dá `item_indisponivel`; o item processado não aparece em `listarNovos` nem em `listarDescartados`. Implementar em `src/dados/local/tarefas.ts`, gravando `tarefas` e `itensCaixa` juntos com `gravar` de `src/dados/local/armazenamento.ts`.
- [ ] T023 [US4] Criar `src/features/caixa/VirarTarefa.tsx`: `Dialog` com o `FormularioTarefa`, título com a primeira linha do item e anotações com o texto inteiro (só quando houver mais de uma linha). Salvar chama `useCriarTarefaDeItem`; em sucesso, fecha e mostra `caixa.avisos.virouTarefa` com a ação "Ver tarefa", que navega para `/tarefas?tarefa={id}`.
- [ ] T024 [US4] Em `src/features/caixa/ItemCaixa.tsx`, acrescentar o botão "Virar tarefa" (ícone `ListChecks`, `aria-label` `caixa.virarTarefa`) antes de editar e descartar, abrindo `VirarTarefa`.

**Ponto de controle**: cenários 1 a 4 do `quickstart.md` passam.

---

## Fase 7: Acabamento

- [ ] T025 Rodar `npm test`, `npm run typecheck`, `npm run lint` e `npm run build`, e os greps do cenário 6 do `quickstart.md`.
- [ ] T026 Rodar no navegador os cenários 1 a 4 do `quickstart.md` e o cenário 5 (500 tarefas no build de produção, porta 4173), sem tocar nos dados da porta 5173 sem cópia e restauração.
- [ ] T027 Marcar T007 a T010 em `docs/tasks.md` (a partir de `system-web-onPath/`) e marcar como atendidos na `docs/spec.md` os critérios da seção 6.3 e, na seção 6.2, "Ao virar tarefa, os campos da RN24 são exigidos". O critério "Um item pode virar tarefa, projeto, compromisso ou material" continua aberto até a T029.

---

## Dependências e ordem

- **Fase 1** não depende de nada. **Fase 2** depende da Fase 1 e bloqueia as histórias.
- **História 1** depende da Fase 2. **Histórias 2, 3 e 4** dependem da história 1 (serviço,
  hooks e formulário).
- **História 3** depende da história 2 (painel e lista). **História 4** depende só da história
  1, mas segue a ordem para manter um commit por fase.
- **Fase 7** vem por último.

## Execução em paralelo

```text
Fase 2:  T002 → T003 | T004 | T005 | T006 | T007
US1:     T008 (teste) → T009;  T010 em paralelo com T009;  → T011 → T012
US2:     T013;  T014 | T015 em paralelo  → T016 → T017
US3:     T018;  T019 | T020 em paralelo  → T021
US4:     T022 → T023 → T024
```

## Estratégia

1. **MVP**: fases 1 a 3. Já dá para criar tarefas válidas.
2. **Incremento 2**: a história 2. A tela cumpre a lista, os filtros e o painel da seção 6.3.
3. **Incremento 3**: a história 3. Subtarefas com herança e sem ciclos.
4. **Incremento 4**: a história 4. A caixa passa a alimentar as tarefas.
5. Um commit por fase, com o ponto de controle conferido.
