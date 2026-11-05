# Especificação: Caixa de entrada

**Branch**: `main` (sem branch própria da funcionalidade)

**Criada em**: 2026-11-05

**Status**: Rascunho

**Entrada**: Etapa 1 do `docs/tasks.md` (T006): tela da Caixa de entrada, com captura rápida de
itens, descarte e recuperação, cobrindo a RN03, a RN31 e a seção 6.2 de `docs/spec.md`. Só
front-end, com os dados locais da feature 001.

**Referências**: `docs/spec.md` (seção 3, RN03, RN24, RN31 e seção 6.2), `docs/plan.md`
(seção 6, `itens_caixa`), `docs/tasks.md` (T006 e T010), `.specify/memory/constitution.md`,
`specs/001-base-front-end/`.

## Cenários de uso e testes *(obrigatório)*

### História 1: Anotar uma ideia só com texto (Prioridade: P1)

O usuário teve uma ideia e quer tirá-la da cabeça sem decidir nada agora. Na tela Caixa de
entrada, ele digita o texto e confirma. O item aparece na lista na hora, sem pedir data, área,
prioridade ou qualquer outro campo, e o campo fica pronto para a próxima anotação.

**Por que esta prioridade**: é o critério de pronto da T006 ("o usuário registrar uma ideia só
com texto") e o motivo de a caixa existir. Sem a captura, as outras histórias não têm o que
mostrar.

**Teste independente**: abrir a Caixa, digitar um texto, confirmar, conferir que o item está no
topo da lista e que continua lá depois de recarregar a página.

**Cenários de aceite**:

1. **Dado** que o usuário está na Caixa, **quando** digita um texto e confirma, **então** o item
   aparece no topo da lista, e o campo fica vazio e com o foco, pronto para outra anotação.
2. **Dado** que o campo está vazio ou só tem espaços, **quando** o usuário confirma, **então**
   nada é criado e nenhum erro é mostrado.
3. **Dado** que existem itens na caixa, **quando** a página é recarregada, **então** todos
   continuam na lista, do mais novo para o mais antigo.
4. **Dado** que a caixa está vazia, **quando** a tela abre, **então** ela mostra uma mensagem
   curta explicando para que serve a caixa, junto do campo de anotação.

---

### História 2: Descartar e recuperar um item (Prioridade: P2)

Ao rever a caixa, o usuário percebe que uma ideia não vale a pena e a descarta. O item some da
lista principal, mas não é apagado: fica em uma lista de descartados, de onde pode voltar para a
caixa. Logo depois de descartar, o app oferece desfazer.

**Por que esta prioridade**: sem descarte, a caixa só cresce e perde a utilidade. A recuperação
cumpre a RN31 e evita perder uma ideia por um clique errado.

**Teste independente**: criar um item, descartá-lo, conferir que sumiu da lista principal e que
aparece nos descartados, recuperá-lo e conferir que voltou para a caixa.

**Cenários de aceite**:

1. **Dado** um item na caixa, **quando** o usuário o descarta, **então** ele sai da lista
   principal e aparece um aviso com a opção de desfazer.
2. **Dado** que o aviso de descarte está visível, **quando** o usuário escolhe desfazer,
   **então** o item volta para a caixa, na mesma posição de antes.
3. **Dado** um item descartado, **quando** o usuário abre a lista de descartados, **então** o
   item aparece lá, com a data em que foi descartado.
4. **Dado** um item na lista de descartados, **quando** o usuário o recupera, **então** ele volta
   para a lista principal da caixa.
5. **Dado** um item descartado, **quando** o usuário exporta uma cópia dos dados, **então** o
   item descartado está na cópia.

---

### História 3: Corrigir o texto de um item (Prioridade: P3)

O usuário anotou com pressa e quer corrigir ou completar o texto. Ele edita o item na própria
lista, sem abrir outra tela.

**Por que esta prioridade**: melhora a captura feita com pressa, mas a caixa já é útil sem isso.

**Teste independente**: criar um item, editar o texto, confirmar e conferir que o texto novo
continua depois de recarregar a página.

**Cenários de aceite**:

1. **Dado** um item na caixa, **quando** o usuário edita o texto e confirma, **então** o item
   mostra o texto novo e mantém a posição na lista.
2. **Dado** que o usuário está editando, **quando** cancela, **então** o texto anterior é mantido.
3. **Dado** que o usuário está editando, **quando** apaga todo o texto e confirma, **então** a
   edição é recusada e o texto anterior é mantido.

---

### História 4: Anotar de qualquer tela (Prioridade: P2)

O usuário está em outra tela, como Projetos ou Agenda, e lembra de algo. Ele aperta o atalho de
teclado, ou clica no botão de anotar no menu lateral, e um campo rápido abre sobre a tela atual.
Ele digita, confirma, e continua onde estava. O item vai para a caixa.

**Por que esta prioridade**: cumpre a seção 6.2 de `docs/spec.md` ("sem abrir outra tela"). Sem
isso, anotar exige trocar de tela e perder o contexto.

**Teste independente**: abrir uma tela qualquer que não seja a Caixa, usar o atalho, anotar,
conferir que continua na mesma tela e que o item está na Caixa. Repetir pelo botão do menu.

**Cenários de aceite**:

1. **Dado** que o usuário está em qualquer tela, **quando** usa o atalho de teclado, **então** um
   campo rápido abre sobre a tela atual, já com o foco.
2. **Dado** que o usuário está em qualquer tela, **quando** clica no botão de anotar do menu
   lateral, **então** o mesmo campo rápido abre.
3. **Dado** que o campo rápido está aberto, **quando** o usuário digita e confirma, **então** o
   item é salvo na caixa, o campo fecha, um aviso curto confirma e a tela atual não muda.
4. **Dado** que o campo rápido está aberto, **quando** o usuário fecha sem confirmar, **então**
   nada é criado.
5. **Dado** que o usuário está na tela Caixa, **quando** anota pelo campo rápido, **então** o
   item aparece no topo da lista da tela.

---

### Casos-limite

- **Texto longo ou com várias linhas**: o item guarda o texto inteiro, inclusive as quebras de
  linha, e a lista mostra o texto sem cortar palavras ao meio.
- **Espaços nas pontas**: os espaços no começo e no fim do texto são removidos ao salvar.
- **Textos repetidos**: dois itens com o mesmo texto são permitidos, porque a caixa não julga as
  anotações.
- **Armazenamento cheio ou indisponível**: a anotação não é perdida em silêncio. O app informa
  que não conseguiu salvar, diz o que fazer, e o texto digitado continua no campo.
- **Várias abas abertas**: um item criado em uma aba aparece na outra quando ela é recarregada.
- **Itens já processados**: itens que no futuro virarem tarefa, projeto, compromisso ou material
  (T010) não aparecem na lista principal nem nos descartados.
- **Atalho enquanto digita**: o atalho funciona mesmo com o foco em outro campo de texto, e não
  conflita com atalhos comuns do navegador, como copiar, colar e recarregar.
- **Campo rápido já aberto**: usar o atalho de novo não abre um segundo campo.
- **Muitos itens**: com centenas de itens, a lista continua respondendo sem atraso perceptível.

## Requisitos *(obrigatório)*

### Requisitos funcionais

**Captura**

- **FR-001**: A tela Caixa de entrada DEVE ter um campo de anotação sempre visível no topo,
  com o foco nele ao abrir a tela.
- **FR-002**: Um item DEVE ser criado só com o texto, sem pedir data, área, prioridade ou outro
  campo (RN03 e RN24).
- **FR-003**: O usuário DEVE poder criar o item pelo teclado, sem usar o mouse. Uma tecla
  confirma, e outra combinação insere uma quebra de linha.
- **FR-004**: Textos vazios ou só com espaços NÃO DEVEM criar itens. Os espaços nas pontas
  DEVEM ser removidos ao salvar.
- **FR-005**: Depois de criar um item, o campo DEVE ficar vazio e manter o foco, para permitir
  anotações em sequência.
- **FR-006**: O usuário DEVE poder anotar um item na caixa a partir de qualquer tela, sem sair
  da tela em que está, de duas formas: um atalho de teclado e um botão fixo no menu lateral. As
  duas abrem um campo rápido sobre a tela atual, que segue as regras do FR-002 ao FR-004.
- **FR-006a**: Ao confirmar no campo rápido, o item DEVE ser salvo, o campo DEVE fechar e o
  usuário DEVE continuar na mesma tela, com um aviso curto de que o item foi para a caixa. Fechar
  o campo sem confirmar não cria nada.
- **FR-006b**: O botão do menu DEVE mostrar o atalho de teclado, para que o usuário o aprenda.

**Lista**

- **FR-007**: A lista principal DEVE mostrar os itens novos da caixa, do mais novo para o mais
  antigo, com o texto e há quanto tempo foram criados.
- **FR-008**: O menu lateral DEVE mostrar, ao lado de "Caixa de entrada", quantos itens novos
  existem, e esconder o número quando a caixa estiver vazia.
- **FR-009**: Com a caixa vazia, a tela DEVE mostrar uma mensagem curta sobre o uso da caixa.

**Descarte e recuperação**

- **FR-010**: O usuário DEVE poder descartar um item com uma ação, sem confirmação prévia.
- **FR-011**: Descartar NÃO DEVE apagar o item: ele sai da lista principal e fica guardado como
  descartado, com a data do descarte (RN31).
- **FR-012**: Logo após descartar, o app DEVE mostrar um aviso por alguns segundos com a opção
  de desfazer. Desfazer devolve o item para a caixa.
- **FR-013**: A tela DEVE dar acesso à lista de descartados, do descarte mais recente para o
  mais antigo, sem sair da Caixa.
- **FR-014**: O usuário DEVE poder recuperar um item descartado, que volta para a lista
  principal.
- **FR-015**: Itens descartados DEVEM entrar na cópia exportada e voltar na importação, como os
  demais dados.

**Edição**

- **FR-016**: O usuário DEVE poder editar o texto de um item novo na própria lista, confirmar ou
  cancelar a edição. A edição segue as regras de texto do FR-004.

**Regras gerais**

- **FR-017**: Toda leitura e escrita da caixa DEVE passar pela camada de serviços da feature
  001, e as regras de descarte e recuperação DEVEM ficar nessa camada, não na tela (princípio
  IV).
- **FR-018**: Todos os textos da tela, avisos e erros DEVEM vir do arquivo de textos em
  português (princípio I).
- **FR-019**: Todo erro ao salvar DEVE informar o que aconteceu e o que fazer, sem perder o
  texto digitado.
- **FR-020**: As ações de criar, descartar, desfazer, recuperar e editar DEVEM aparecer na tela
  na hora, sem recarregar a página.

### Entidades principais

- **Item da caixa**: ideia ainda não organizada (seção 3 de `docs/spec.md`). Tem o texto, a
  situação (novo, processado ou descartado), a data de criação, a data da última alteração e,
  quando descartado, a data do descarte. Nesta etapa, só as situações novo e descartado são
  usadas. A situação processado fica para a T010, quando o item vira tarefa ou outro registro.

## Critérios de sucesso *(obrigatório)*

### Resultados mensuráveis

- **SC-001**: O usuário registra uma ideia em menos de 5 segundos a partir da tela Caixa, só com
  o teclado.
- **SC-002**: O usuário anota 5 itens seguidos sem tocar no mouse e sem clicar no campo de novo.
- **SC-003**: Nenhum item descartado é perdido: 100% dos descartados podem ser recuperados e
  aparecem na cópia exportada.
- **SC-004**: O item criado, descartado ou recuperado aparece no lugar certo da tela em menos de
  100 ms, sem recarregar a página.
- **SC-005**: Com 500 itens na caixa, abrir a tela e rolar a lista não tem atraso perceptível.
- **SC-006**: De qualquer tela, o usuário registra uma ideia em menos de 5 segundos e continua
  na mesma tela.
- **SC-007**: Um descarte feito por engano é desfeito com um clique, sem procurar o item.

## Premissas

- **Escopo**: transformar um item em tarefa, projeto, compromisso ou material fica para a T010 e
  as etapas seguintes. Esta etapa não muda a situação de nenhum item para processado.
- **Descarte e arquivamento**: na caixa, "descartar" é a forma de excluir da RN31. Não há
  exclusão definitiva nesta versão, e a lista de descartados não é limpa automaticamente.
- **Ordem**: a lista segue a data de criação. Reordenar os itens à mão não faz parte desta
  etapa.
- **Usuário único**: como na feature 001, há um só usuário e os dados ficam no navegador.
- **Atalho**: a tecla exata do atalho é escolhida no plano, evitando os atalhos do navegador.
- **Tempo do aviso de desfazer**: cerca de 5 segundos, padrão comum em apps de produtividade.
- **Dados existentes**: a coleção de itens da caixa já existe na camada de dados da feature 001.
  Itens criados antes desta etapa, se houver, aparecem normalmente.
