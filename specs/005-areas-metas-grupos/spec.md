# Especificação: Áreas, metas e grupos

**Branch**: `main` (sem branch própria da funcionalidade)

**Criada em**: 2026-11-05

**Status**: Rascunho

**Entrada**: Etapa 4 do `docs/tasks.md` (T013 e T014): tela de Áreas e metas cobrindo a seção 6.5
de `docs/spec.md`, e edição de grupos com nome e limite de projetos ativos. Só front-end, com os
dados locais.

**Referências**: `docs/spec.md` (seção 3, RN01, RN06, RN07, RN31, seções 5, 6.5 e 7),
`docs/plan.md` (seção 6 e "Limite de projetos ativos"), `docs/tasks.md` (T013 e T014),
`.specify/memory/constitution.md`.

## Cenários de uso e testes *(obrigatório)*

### História 1: Organizar as áreas da vida (Prioridade: P1)

O usuário abre a tela Áreas e metas e vê as áreas da vida (Faculdade, Trabalho, Estudos, Saúde,
Pessoal e Finanças, vindas dos dados iniciais). Ele cria uma área nova, muda o nome ou o tom de
uma área, arruma a ordem em que elas aparecem no app e arquiva as que não usa mais. Se a área
ainda tiver coisas ativas, o app avisa antes de arquivar.

**Por que esta prioridade**: as áreas organizam tudo no app (RN01). Sem poder ajustá-las, o
usuário fica preso aos dados iniciais.

**Teste independente**: criar uma área, renomeá-la, movê-la para o topo, recarregar e conferir a
ordem; arquivar uma área com tarefas abertas e conferir o pedido de confirmação; recuperar a área.

**Cenários de aceite**:

1. **Dado** a tela Áreas e metas, **quando** ela abre, **então** mostra as áreas ativas na ordem
   escolhida, cada uma com a quantidade de metas ativas, grupos e tarefas abertas.
2. **Dado** que o usuário cria uma área com nome e tom, **quando** salva, **então** ela aparece no
   fim da lista e passa a ser oferecida nos formulários de tarefa e nos filtros.
3. **Dado** uma área, **quando** o usuário muda o nome ou o tom e salva, **então** a mudança
   aparece em todas as telas.
4. **Dado** as áreas, **quando** o usuário muda a ordem (arrastando ou pelo teclado), **então** a
   nova ordem fica gravada e vale nos formulários e filtros.
5. **Dado** uma área sem itens ativos, **quando** o usuário a arquiva, **então** ela sai da lista
   sem pedir confirmação, e um aviso oferece desfazer (RN31).
6. **Dado** uma área com metas ativas, grupos, projetos, tarefas abertas ou matérias, **quando** o
   usuário pede para arquivar, **então** o app mostra quantos itens de cada tipo ela tem e só
   arquiva depois da confirmação.
7. **Dado** uma área arquivada, **quando** o usuário abre a lista de arquivadas e a recupera,
   **então** ela volta para o fim da lista de áreas ativas.

---

### História 2: Definir as metas de cada área (Prioridade: P1)

Ao escolher uma área, o usuário vê as metas dela. Ele cria uma meta com título, descrição
opcional e prazo opcional, muda o status quando ela é alcançada ou abandonada e exclui as que
criou por engano.

**Por que esta prioridade**: é o restante da seção 6.5 e dá sentido às áreas: para onde cada
parte da vida está indo.

**Teste independente**: criar duas metas numa área, uma com prazo; concluir uma; excluir a outra e
desfazer.

**Cenários de aceite**:

1. **Dado** uma área escolhida, **quando** o usuário cria uma meta com título, **então** ela
   aparece nas metas da área com o status ativa.
2. **Dado** o formulário da meta, **quando** falta o título, **então** a meta não é criada e o campo
   mostra o erro.
3. **Dado** uma meta, **quando** o usuário informa um prazo, **então** ele aparece na meta, e uma
   meta ativa com prazo vencido aparece como atrasada.
4. **Dado** uma meta ativa, **quando** o usuário a marca como concluída ou cancelada, **então** o
   status muda e ela vai para o fim da lista de metas da área.
5. **Dado** uma meta concluída ou cancelada, **quando** o usuário a reativa, **então** ela volta a
   ficar ativa.
6. **Dado** uma meta, **quando** o usuário a exclui, **então** ela é arquivada e um aviso oferece
   desfazer (RN31).

---

### História 3: Ajustar os grupos e o limite de projetos ativos (Prioridade: P2)

Na área, o usuário vê os grupos de projetos com as vagas usadas e o limite de cada um (por
exemplo, "Servioeste · 1 de 1 ativo"). Ele muda o nome e o limite de um grupo, cria grupos novos
e arquiva grupos sem projetos. Ao baixar o limite abaixo do número de ativos, o app avisa que o
grupo fica acima do limite até algum projeto ser pausado ou concluído.

**Por que esta prioridade**: é a T014 e prepara o limite de projetos ativos (RN06 e RN07), que
passa a ser aplicado ao ativar projetos na Etapa 5.

**Teste independente**: mudar o limite do grupo Pessoal de 2 para 1 e conferir o aviso de "acima
do limite"; voltar para 3 e conferir "2 de 3 ativos"; criar um grupo e arquivá-lo.

**Cenários de aceite**:

1. **Dado** uma área escolhida, **quando** a tela mostra os grupos, **então** cada grupo aparece com
   o nome, a quantidade de projetos ativos e o limite (RN06).
2. **Dado** um grupo, **quando** o usuário muda o nome ou o limite e salva, **então** a mudança
   aparece na hora e vale para as próximas ativações de projeto (RN07).
3. **Dado** um grupo com dois projetos ativos, **quando** o usuário baixa o limite para um,
   **então** o app aceita, avisa que o grupo fica acima do limite e não pausa nenhum projeto
   sozinho.
4. **Dado** o formulário do grupo, **quando** o limite não é um número inteiro maior ou igual a
   zero, ou falta o nome, **então** nada é gravado e o campo mostra o erro.
5. **Dado** uma área, **quando** o usuário cria um grupo com nome e limite, **então** ele aparece nos
   grupos da área, com zero projetos ativos.
6. **Dado** um grupo sem projetos, **quando** o usuário o arquiva, **então** ele sai da área, com
   opção de desfazer.
7. **Dado** um grupo com projetos, **quando** o usuário tenta arquivá-lo, **então** o app recusa e
   explica que os projetos precisam ser movidos ou arquivados antes.

---

### Casos-limite

- **Nome repetido**: duas áreas ativas não podem ter o mesmo nome (sem diferenciar maiúsculas e
  acentos); dois grupos da mesma área também não.
- **Espaços nas pontas**: são removidos dos nomes e títulos; nome ou título vazio é recusado.
- **Última área ativa**: não pode ser arquivada, porque toda tarefa precisa de uma área (RN24).
- **Área arquivada com itens**: os itens continuam existindo e aparecem nas telas como antes; a
  área só deixa de ser oferecida em formulários e filtros novos.
- **Limite zero**: é aceito e significa que o grupo não aceita projetos ativos.
- **Mudança feita em outra aba**: aparece ao voltar para a tela.
- **Armazenamento cheio ou indisponível**: nada é gravado pela metade, e o app informa o que
  aconteceu e o que fazer.

## Requisitos *(obrigatório)*

### Requisitos funcionais

**Áreas (T013)**

- **FR-001**: A tela DEVE listar as áreas ativas na ordem escolhida, com a quantidade de metas
  ativas, grupos e tarefas abertas de cada uma.
- **FR-002**: O usuário DEVE poder criar e editar uma área com nome (obrigatório) e tom, escolhido
  entre os tons de cinza do tema.
- **FR-003**: Duas áreas ativas NÃO DEVEM ter o mesmo nome.
- **FR-004**: O usuário DEVE poder reordenar as áreas, arrastando e pelo teclado, e a ordem DEVE
  valer em todas as listas de áreas do app.
- **FR-005**: Arquivar uma área DEVE pedir confirmação quando ela tem metas ativas, grupos,
  projetos, tarefas abertas ou matérias, mostrando a quantidade de cada um.
- **FR-006**: A última área ativa NÃO DEVE poder ser arquivada.
- **FR-007**: As áreas arquivadas DEVEM ficar numa lista à parte, de onde podem ser recuperadas
  (RN31).

**Metas (T013)**

- **FR-008**: Cada meta DEVE pertencer a uma única área (RN01), com título obrigatório, descrição
  opcional, prazo opcional e status ativa, concluída ou cancelada.
- **FR-009**: O usuário DEVE poder criar, editar, mudar o status e excluir (arquivar, com desfazer)
  as metas de uma área.
- **FR-010**: As metas DEVEM aparecer com as ativas primeiro, ordenadas pelo prazo mais próximo
  (sem prazo por último); uma meta ativa com prazo vencido DEVE aparecer como atrasada.

**Grupos (T014)**

- **FR-011**: Cada grupo DEVE mostrar o nome, a quantidade de projetos ativos e o limite de ativos
  (RN06).
- **FR-012**: O usuário DEVE poder criar e editar um grupo com nome (obrigatório, único na área) e
  limite (número inteiro maior ou igual a zero).
- **FR-013**: Um limite menor que a quantidade de ativos DEVE ser aceito, com o aviso de que o
  grupo está acima do limite; nenhum projeto é pausado automaticamente.
- **FR-014**: O limite DEVE ser a referência para ativar projetos (RN07): a regra de ativação, da
  Etapa 5, consulta sempre o valor atual.
- **FR-015**: Arquivar um grupo DEVE ser recusado enquanto ele tiver projetos não arquivados.

**Regras gerais**

- **FR-016**: Todas as regras DEVEM ficar na camada de serviços (princípio IV).
- **FR-017**: Todos os textos DEVEM vir do arquivo de textos em português (princípio I).
- **FR-018**: Os tons de área DEVEM vir do tema (princípio V).
- **FR-019**: Todo erro DEVE informar o que aconteceu e o que fazer.

### Entidades principais

- **Área**: parte da vida (seção 3). Tem nome, tom e posição na ordem. Já existe.
- **Meta**: objetivo de uma área. Tem título, descrição, prazo e status. Já existe.
- **Grupo**: conjunto de projetos de uma área, com nome e limite próprio de ativos. Já existe.
- **Projeto**: usado aqui só para contar os ativos de cada grupo. A tela de projetos é da Etapa 5.

## Critérios de sucesso *(obrigatório)*

### Resultados mensuráveis

- **SC-001**: O usuário cria uma área ou uma meta em menos de 20 segundos.
- **SC-002**: A nova ordem das áreas aparece na tela em menos de 100 ms e é a mesma nos formulários
  de tarefa depois de recarregar.
- **SC-003**: 100% das tentativas de arquivar uma área com itens ativos pedem confirmação, com a
  contagem certa de cada tipo.
- **SC-004**: Em 100% dos grupos, a contagem de ativos e o limite mostrados batem com os projetos
  gravados.
- **SC-005**: Um limite alterado aparece em todas as telas na hora, sem recarregar.

## Premissas

- **Ativar projetos** (RN07) e a tela Projetos são da Etapa 5. Nesta etapa, o limite é gravado,
  mostrado com as vagas e fica pronto para a regra de ativação, que consulta o valor atual.
- **Tons de área**: a seção 7 de `docs/spec.md` reserva a cor para gráficos e ícones. O tom da área
  é escolhido entre os cinzas do tema, como nos dados iniciais.
- **Arquivar área não arquiva os itens dela**: metas, grupos, projetos e tarefas continuam como
  estão. A confirmação existe para o usuário saber o que fica sem área ativa.
- **Grupos** ficam na tela Áreas e metas, dentro de cada área, porque pertencem a uma área (RN01).
- **Matérias** são contadas na confirmação de arquivar, mas a tela delas é da Etapa 8.
- **Usuário único** e dados no navegador, como nas features anteriores.
