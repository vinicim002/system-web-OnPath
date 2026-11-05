---
description: "Lista de tarefas da Etapa 4 (Áreas, metas e grupos)"
---

# Tarefas: Áreas, metas e grupos

**Entrada**: documentos de `specs/005-areas-metas-grupos/`

**Pré-requisitos**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Testes**: os três serviços têm testes Vitest em `__tests__/areas.test.ts` (`research.md`, item 9).
A tela é validada pelo `quickstart.md`.

**Relação com `docs/tasks.md`**: cobre as tarefas T013 e T014, marcadas só na fase final.

## Formato: `[ID] [P?] [História] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente).
- **[US1] a [US3]**: as histórias 1 a 3 do `spec.md`.
- Os caminhos partem de `system-onPath-web-front/`, salvo quando indicado.

---

## Fase 1: Base (bloqueia as histórias)

- [X] T001 [P] Em `src/dados/erros.ts`, acrescentar `nome_repetido`, `area_com_itens`, `ultima_area` e `grupo_com_projetos`, com mensagens em `erros.*` de `src/i18n/pt-BR.ts` ("Já existe um item com este nome. Escolha outro.", "Esta área ainda tem itens ativos. Confirme para arquivar.", "Não é possível arquivar a última área. Crie outra antes.", "Este grupo tem projetos. Mova ou arquive os projetos antes de arquivar o grupo.").
- [X] T002 [P] Em `src/dados/contratos.ts`, criar `ContagemArea`, `AreaComResumo`, `ServicoAreas`, `MetaNaLista`, `ServicoMetas`, `GrupoComVagas` e `ServicoGrupos`, exatamente como em `contracts/servicos.md`, e trocar os tipos de `areas`, `metas` e `grupos` em `Servicos`.
- [X] T003 [P] Criar `src/dados/local/nomes.ts` com `chaveDeNome(texto)` (sem espaços nas pontas, minúsculas, sem acentos com `normalize("NFD")`) e `src/dados/regrasGrupos.ts` com `vagasDoGrupo(grupo, projetos)` → `{ ativos, acimaDoLimite }` (projetos não arquivados do grupo com `status = ativo`).
- [X] T004 [P] Em `src/theme/index.ts`, exportar `TONS_AREA` com os cinzas 900, 800, 700, 600, 500 e 400 de `cores.cinza`, e usar essa lista em `src/dados/iniciais.ts`. Em `src/i18n/pt-BR.ts`, criar `areas.*`, `metas.*` e `grupos.*` de `contracts/interface.md` (títulos, campos, tons, ações, avisos com desfazer, confirmação "Arquivar {area}?" com as contagens, arquivadas, status das metas, atrasada, "{ativos} de {limite} ativos", "Acima do limite" e erros por campo).

---

## Fase 2: História 1, organizar as áreas (P1) 🎯 MVP

**Teste independente**: `quickstart.md`, cenário 1.

- [X] T005 [US1] Escrever em `__tests__/areas.test.ts` os testes de áreas: criar no fim com nome sem espaços; nome vazio dá `dados_invalidos`; nome repetido entre ativas (inclusive "familia" × "Família") dá `nome_repetido`, mas pode repetir o de uma arquivada; tom fora de `TONS_AREA` dá `dados_invalidos` (`cor`); `alterar` respeita as mesmas regras; `listarComResumo` traz as ativas na ordem com as contagens certas (metas ativas, grupos ativos, projetos, tarefas abertas e matérias); `reordenar` regrava de 0 e recusa lista incompleta; `excluir` sem itens arquiva; com itens dá `area_com_itens` com a contagem e não grava; com `confirmado: true` arquiva; a última área ativa dá `ultima_area`; `recuperar` põe no fim; `listarArquivadas` traz as arquivadas. Devem falhar antes da T006.
- [X] T006 [US1] Criar `src/dados/local/areas.ts` com `criarServicoAreas()` sobre `criarServicoColecao("areas", …)` e as regras de `data-model.md`. Em `src/dados/local/servicos.ts`, usar o serviço novo. Rodar `npm test` até a T005 passar.
- [X] T007 [P] [US1] Em `src/dados/consultas.ts`, criar `useAreasComResumo`, `useAreasArquivadas`, `useCriarArea`, `useAlterarArea`, `useReordenarAreas`, `useArquivarArea` e `useRecuperarArea`, invalidando `["areas"]` e `["opcoesTarefa"]`.
- [X] T008 [P] [US1] Criar `src/features/areas/FormularioArea.tsx` (nome e tom com os círculos de `TONS_AREA`, `react-hook-form` + Zod, erros do serviço por campo) e `src/features/areas/ListaAreas.tsx` (ordenável com `dnd-kit` e teclado, círculo do tom, nome, resumo, seleção pelo endereço `?area=id`, seção "Arquivadas" recolhida com Recuperar).
- [X] T009 [US1] Criar `src/features/areas/PainelArea.tsx` com o formulário da área e "Arquivar área": sem itens, arquiva com aviso e Desfazer; com `area_com_itens`, abre um `AlertDialog` com as contagens e arquiva confirmado; com `ultima_area`, mostra o erro. Criar `src/telas/Areas.tsx` em duas colunas, com "Nova área" e a primeira área escolhida quando não houver `?area=`.

**Ponto de controle**: cenário 1 do `quickstart.md` passa.

---

## Fase 3: História 2, metas (P1)

**Teste independente**: `quickstart.md`, cenário 2.

- [X] T010 [US2] Acrescentar em `__tests__/areas.test.ts`: meta sem título ou com área arquivada dá `dados_invalidos`; título sem espaços; `listarDaArea` traz ativas primeiro, por prazo (sem prazo por último) e criação; `atrasada` só para ativa com prazo anterior a `hoje`; metas arquivadas não aparecem. Criar `src/dados/local/metas.ts` até passar e usar em `src/dados/local/servicos.ts`.
- [X] T011 [P] [US2] Em `src/dados/consultas.ts`, criar `useMetasDaArea(areaId, hoje)`, `useCriarMeta`, `useAlterarMeta`, `useExcluirMeta` e `useRecuperarMeta`, invalidando `["metas"]` e `["areas"]`.
- [X] T012 [US2] Criar `src/features/areas/FormularioMeta.tsx` (título, descrição e prazo) e `src/features/areas/MetasDaArea.tsx` (lista com "Atrasada", status, menu Concluir/Cancelar/Reativar, editar no lugar e Excluir com Desfazer), e mostrar em `PainelArea.tsx`.

**Ponto de controle**: cenários 1 e 2 passam. A T013 do `docs/tasks.md` cumpre o "Pronto quando".

---

## Fase 4: História 3, grupos (P2)

**Teste independente**: `quickstart.md`, cenário 3.

- [X] T013 [US3] Acrescentar em `__tests__/areas.test.ts`: grupo sem nome, com limite negativo ou quebrado, ou com área arquivada dá `dados_invalidos`; nome repetido na mesma área dá `nome_repetido`, mas em outra área é aceito; `listarDaArea` traz os grupos por nome com `ativos` e `acimaDoLimite` (projetos arquivados e não ativos não contam); baixar o limite abaixo dos ativos é aceito e não muda os projetos; `excluir` com projetos dá `grupo_com_projetos` e sem projetos arquiva. Criar `src/dados/local/grupos.ts` até passar e usar em `src/dados/local/servicos.ts`.
- [X] T014 [P] [US3] Em `src/dados/consultas.ts`, criar `useGruposDaArea(areaId)`, `useCriarGrupo`, `useAlterarGrupo`, `useExcluirGrupo` e `useRecuperarGrupo`, invalidando `["grupos"]` e `["areas"]`.
- [X] T015 [US3] Criar `src/features/areas/FormularioGrupo.tsx` (nome e limite) e `src/features/areas/GruposDaArea.tsx` (nome, "{ativos} de {limite} ativos", "Acima do limite", editar no lugar, novo grupo, arquivar com Desfazer e o erro `grupo_com_projetos` como aviso), e mostrar em `PainelArea.tsx`.

**Ponto de controle**: cenários 1 a 3 passam. A T014 do `docs/tasks.md` cumpre o "Pronto quando" (o
limite novo aparece na hora e é o valor que a regra de ativação da Etapa 5 vai consultar).

---

## Fase 5: Acabamento

- [X] T016 Rodar `npm test`, `npm run typecheck`, `npm run lint` e `npm run build`, e os greps do cenário 4 do `quickstart.md`.
- [X] T017 Rodar no navegador os cenários 1 a 3 do `quickstart.md` no build de produção (porta 4173).
- [X] T018 Marcar T013 e T014 em `docs/tasks.md` (a partir de `system-web-onPath/`) e os três critérios da seção 6.5 de `docs/spec.md`.

---

## Dependências e ordem

- **Fase 1** primeiro (tarefas paralelas). A Fase 1 e a Fase 2 vão no mesmo commit, porque o
  contrato novo só compila com o serviço de áreas.
- **Histórias 2 e 3** dependem da história 1 (painel da área). Entre si, são independentes.
- **Fase 5** por último.

## Execução em paralelo

```text
Fase 1:  T001 | T002 | T003 | T004
US1:     T005 (teste) → T006;  T007 | T008 em paralelo  → T009
US2:     T010 → T011 | T012
US3:     T013 → T014 | T015
```

## Estratégia

1. **MVP**: fases 1 e 2. As áreas podem ser organizadas.
2. **Incremento 2**: metas. A seção 6.5 fica completa.
3. **Incremento 3**: grupos e limites. Prepara a Etapa 5.
4. Um commit por fase.
