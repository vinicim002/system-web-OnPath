# Pesquisa: Áreas, metas e grupos

Decisões da Fase 0. A base técnica vem das features 001 a 004.

## 1. Serviços próprios

- **Decisão**: `ServicoAreas`, `ServicoMetas` e `ServicoGrupos`, cada um estendendo o serviço comum
  de coleção, como nas etapas anteriores.
  - **Áreas**: resumo com contagens, nome único, ordem, reordenar, arquivar com confirmação e
    recuperar no fim.
  - **Metas**: lista por área na ordem da tela.
  - **Grupos**: lista por área com as vagas, nome único na área e arquivar só sem projetos.
- **Motivo**: princípio IV. A Etapa 5 (projetos) usa as vagas dos grupos para a RN07.

## 2. Confirmação de arquivar no serviço

- **Decisão**: `areas.excluir(id)` recusa com o erro novo `area_com_itens` (com as contagens nos
  detalhes) quando a área tem metas ativas, grupos, projetos, tarefas abertas ou matérias.
  `areas.excluir(id, { confirmado: true })` arquiva. É o mesmo padrão de `subtarefas_abertas` (feature 003).
- **Motivo**: a regra de confirmar fica no serviço, e a tela só mostra o pedido.
- **Última área**: `excluir` recusa com o erro novo `ultima_area`, mesmo confirmado.

## 3. Nomes únicos

- **Decisão**: comparação sem diferenciar maiúsculas, acentos e espaços nas pontas
  (`normalize("NFD")` sem as marcas, em minúsculas). Áreas: entre as ativas. Grupos: entre os
  ativos da mesma área. Erro novo `nome_repetido`, com o campo `nome`.

## 4. Ordem das áreas

- **Decisão**: `reordenar(ids)` regrava `ordem` de 0 em diante para as áreas ativas, em uma única
  escrita, como no plano do dia. Criar ou recuperar põe a área no fim. A lista de áreas de
  `useOpcoesTarefa` já ordena por `ordem`, então a nova ordem vale nos formulários e filtros.
- **Interface**: `dnd-kit`, já instalado na Etapa 3, com o sensor de teclado.

## 5. Tons

- **Decisão**: o tom é um dos cinzas 400 a 900 do tema (`cores.cinza` de `src/theme/index.ts`),
  os mesmos dos dados iniciais. O serviço recusa outros valores (`dados_invalidos`, campo `cor`).
  Na tela, o tom aparece como um círculo de cor ao lado do nome, que é o "ícone" da área (seção 7).

## 6. Vagas dos grupos

- **Decisão**: `grupos.listarDaArea(areaId)` devolve cada grupo com `ativos` (projetos não
  arquivados com status `ativo`), `limite` e `acimaDoLimite`. A função pura `vagasDoGrupo`, em
  `src/dados/regrasGrupos.ts`, será usada pela regra de ativação da Etapa 5.
- **Limite menor que os ativos**: aceito; a tela mostra "acima do limite".
- **Arquivar grupo**: recusado com o erro novo `grupo_com_projetos` enquanto houver projetos não
  arquivados.

## 7. Metas

- **Decisão**: ordem na área: ativas primeiro; dentro de cada status, prazo mais próximo e sem
  prazo por último; depois a criação. Atrasada: ativa e com prazo anterior a hoje (fuso do
  usuário).

## 8. Tela

- **Decisão**: duas colunas, como em Tarefas: a lista de áreas à esquerda (ordenável, com as
  arquivadas recolhidas no fim) e, à direita, a área escolhida (`/areas?area=id`), com o formulário
  da área, as metas e os grupos.
- **Formulários**: pequenos e na própria tela, com `react-hook-form` e Zod, como o de tarefas.

## 9. Testes

- **Decisão**: testes Vitest dos três serviços: nomes únicos, tons, ordem, contagens, confirmação,
  última área, recuperar no fim, ordem e atraso das metas, vagas, limite abaixo dos ativos e
  arquivar grupo. A tela é validada pelo `quickstart.md`.
