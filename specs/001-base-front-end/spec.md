# Especificação: Base do front-end

**Branch**: `docs/versionar-documentos` (sem branch própria da funcionalidade)

**Criada em**: 2026-11-05

**Status**: Rascunho

**Entrada**: Etapa 0 do `docs/tasks.md` (T001 a T005): base do front-end com Expo web, rotas,
tema preto e branco, textos separados do código, menu lateral, camada de dados local tipada que
poderá ser trocada pela API sem mudar as telas, dados iniciais da seção 5 do `docs/spec.md`
carregados uma única vez, e exportação/importação dos dados locais em JSON.

**Referências**: `docs/spec.md` (seções 5, 6 e 7), `docs/plan.md` (seções 2 e 4),
`docs/tasks.md` (T001 a T005), `.specify/memory/constitution.md`.

## Cenários de uso e testes *(obrigatório)*

### História 1: Navegar pelo app vazio (Prioridade: P1)

O usuário abre o OnPath no navegador do computador e vê um menu fixo à esquerda com todas as
telas principais da fase 1. Ao clicar em cada item, a tela correspondente abre, ainda sem
conteúdo, com o título em português e o visual em preto, branco e tons de cinza.

**Por que esta prioridade**: é a base sobre a qual todas as telas seguintes serão construídas.
Sem ela, nenhuma outra etapa pode ser vista nem usada.

**Teste independente**: abrir o app, clicar em cada item do menu e conferir que a tela certa
abre, com o título certo e o visual da seção 7 de `docs/spec.md`.

**Cenários de aceite**:

1. **Dado** que o usuário abre o app, **quando** a primeira tela carrega, **então** a tela Hoje
   é exibida e o item Hoje aparece marcado no menu.
2. **Dado** que o app está aberto, **quando** o usuário clica em qualquer item do menu, **então**
   a tela correspondente abre sem recarregar a página e o menu continua visível.
3. **Dado** que o usuário digita no navegador o endereço de uma tela, **quando** a página
   carrega, **então** essa tela abre diretamente.
4. **Dado** que o usuário digita um endereço que não existe, **quando** a página carrega,
   **então** o app informa que a página não existe e oferece voltar para Hoje.

---

### História 2: Encontrar os dados iniciais no primeiro uso (Prioridade: P2)

Na primeira vez que o app é aberto, as áreas, os grupos, os projetos e a rotina da seção 5 de
`docs/spec.md` já existem, sem que o usuário precise cadastrar nada. Nas aberturas seguintes,
esses dados não são criados de novo.

**Por que esta prioridade**: permite usar o app com a vida real do usuário desde o início, e é
a primeira prova de que a camada de dados funciona.

**Teste independente**: abrir o app em um navegador sem dados, conferir que os dados iniciais
existem, fechar e abrir de novo, e conferir que nada foi duplicado.

**Cenários de aceite**:

1. **Dado** um navegador sem dados do OnPath, **quando** o app é aberto, **então** existem as 6
   áreas, os 5 grupos com seus limites, os 10 projetos com grupo e status, e as atividades da
   rotina.
2. **Dado** que os dados iniciais já foram criados, **quando** o app é aberto de novo ou a página
   é recarregada, **então** a quantidade de áreas, grupos, projetos e rotinas não muda.
3. **Dado** que o usuário editou ou arquivou um dado inicial, **quando** o app é aberto de novo,
   **então** a edição é mantida e o item arquivado não volta.

---

### História 3: Guardar e restaurar uma cópia dos dados (Prioridade: P3)

O usuário exporta todos os dados locais para um arquivo e, depois, restaura esse arquivo em um
navegador limpo ou no mesmo navegador, recuperando tudo como estava.

**Por que esta prioridade**: o armazenamento do navegador pode ser apagado (risco do
`docs/plan.md`, seção 11). A cópia protege os dados reais até a chegada do back-end, e o mesmo
arquivo será levado ao banco na T047.

**Teste independente**: exportar os dados, abrir o app em um navegador limpo, importar o
arquivo e conferir que os dados são os mesmos.

**Cenários de aceite**:

1. **Dado** que existem dados locais, **quando** o usuário escolhe exportar, **então** o
   navegador baixa um arquivo com a data no nome e todos os dados, inclusive os arquivados.
2. **Dado** um navegador limpo, **quando** o usuário importa um arquivo exportado antes,
   **então** os dados ficam iguais aos do momento da exportação, e os dados iniciais não são
   criados por cima.
3. **Dado** que já existem dados locais, **quando** o usuário escolhe importar, **então** o app
   avisa que os dados atuais serão substituídos e só continua depois da confirmação.
4. **Dado** um arquivo inválido, corrompido ou de outro app, **quando** o usuário tenta
   importá-lo, **então** a importação é recusada com uma mensagem que diz o que aconteceu e o
   que fazer, e os dados atuais continuam intactos.

---

### Casos-limite

- O armazenamento do navegador é apagado: o app volta ao estado de primeiro uso e recria os
  dados iniciais. O usuário recupera seus dados importando a última cópia.
- O armazenamento do navegador está bloqueado ou cheio: o app informa que não consegue salvar e
  sugere exportar uma cópia.
- O app é aberto em duas abas ao mesmo tempo no primeiro uso: os dados iniciais são criados uma
  única vez.
- A importação falha no meio: nenhum dado é alterado.
- O arquivo foi exportado por uma versão anterior do formato: o app aceita a versão conhecida ou
  recusa com mensagem clara.

## Requisitos *(obrigatório)*

### Requisitos funcionais

**Repositório (T001)**

- **FR-001**: O repositório DEVE ter a pasta do app e os documentos `spec.md`, `plan.md` e
  `tasks.md` em `docs/`, seguindo a estrutura da seção 4 de `docs/plan.md`.

**App base (T002)**

- **FR-002**: O app DEVE rodar no navegador do computador.
- **FR-003**: O app DEVE ter um menu lateral fixo com, nesta ordem: Hoje, Caixa de entrada,
  Tarefas, Projetos, Áreas e metas, Agenda, Rotinas, Estudos e Ajustes.
- **FR-004**: Cada item do menu DEVE abrir uma tela própria, com endereço próprio, que mostra o
  título da tela.
- **FR-005**: A tela Hoje DEVE ser a tela inicial.
- **FR-006**: O menu DEVE indicar a tela atual.
- **FR-007**: Um endereço inexistente DEVE mostrar uma tela de página não encontrada com caminho
  de volta para Hoje.
- **FR-008**: Todo texto exibido DEVE estar em português e vir de arquivos de textos separados
  das telas (constituição, princípio I).
- **FR-009**: Cores, fontes e espaçamentos DEVEM vir de um tema central que segue a seção 7 de
  `docs/spec.md`: preto, branco e tons de cinza, com fonte Inter (constituição, princípio V).

**Camada de dados (T003)**

- **FR-010**: Toda leitura e escrita de dados DEVE passar por serviços com tipos definidos para
  as entidades do modelo de dados da seção 6 de `docs/plan.md`. As telas NÃO podem acessar o
  armazenamento diretamente (constituição, princípio IV).
- **FR-011**: Os serviços DEVEM ter uma implementação local que guarda os dados no navegador e
  os mantém depois de fechar e reabrir o app.
- **FR-012**: Trocar a implementação local por outra com o mesmo contrato NÃO pode exigir
  mudanças nas telas.
- **FR-013**: Os serviços DEVEM informar falhas com um código e uma mensagem em português, no
  mesmo formato de erro da seção 8 de `docs/plan.md`.
- **FR-014**: Excluir pelos serviços DEVE arquivar o item, e as listagens DEVEM ignorar itens
  arquivados por padrão (RN31).
- **FR-015**: Todo registro DEVE ter identificador, data de criação, data de atualização e data
  de arquivamento opcional. Datas DEVEM ser guardadas em UTC.

**Dados iniciais (T004)**

- **FR-016**: No primeiro uso, o app DEVE criar os dados da seção 5 de `docs/spec.md`: áreas,
  grupos com limites, projetos com grupo e status, e atividades da rotina.
- **FR-017**: Os dados iniciais DEVEM ser criados uma única vez, mesmo com recargas ou várias
  abas abertas.
- **FR-018**: Todo dado inicial DEVE poder ser editado e arquivado como qualquer outro dado.
- **FR-019**: Cada grupo inicial DEVE pertencer a uma área, e cada projeto inicial DEVE ficar
  na área do seu grupo (RN01).

**Exportação e importação (T005)**

- **FR-020**: O usuário DEVE conseguir exportar todos os dados locais, inclusive os arquivados,
  para um arquivo JSON com a data no nome e a versão do formato.
- **FR-021**: O usuário DEVE conseguir importar um arquivo exportado, substituindo todos os
  dados locais, depois de confirmar.
- **FR-022**: A importação DEVE validar o arquivo inteiro antes de alterar qualquer dado, e
  recusar arquivos inválidos com mensagem clara.
- **FR-023**: Depois de uma importação, os dados iniciais NÃO podem ser criados de novo.
- **FR-024**: As ações de exportar e importar DEVEM ficar na tela Ajustes.

### Entidades principais

As entidades e os campos seguem a seção 6 de `docs/plan.md`. Nesta etapa, os serviços cobrem
todas elas, e os dados iniciais preenchem estas:

- **Área**: parte da vida, com nome, cor e ordem.
- **Grupo**: conjunto de projetos de uma área, com nome e limite de ativos.
- **Projeto**: pertence a um grupo e fica na área dele, com nome, prioridade, status e posição na fila.
- **Rotina**: atividade recorrente, com área, tipo (horário ou meta de horas), dias da semana,
  horário de início e duração.
- **Cópia de dados**: arquivo com a versão do formato, a data da exportação e todos os registros
  de todas as entidades.

## Critérios de sucesso *(obrigatório)*

### Resultados mensuráveis

- **SC-001**: As 9 telas do menu abrem a partir do menu e pelo endereço direto, sem erro.
- **SC-002**: Nenhum texto visível nas telas está escrito direto no código delas.
- **SC-003**: Depois de 10 recargas e da abertura em duas abas, a quantidade de áreas (6),
  grupos (5) e projetos (10) continua a mesma.
- **SC-004**: Uma cópia exportada e importada em um navegador limpo reproduz 100% dos registros,
  inclusive os arquivados.
- **SC-005**: Um arquivo inválido é recusado em 100% das tentativas, sem alterar nenhum dado.
- **SC-006**: Nenhuma tela acessa o armazenamento sem passar pelos serviços.
- **SC-007**: Exportar ou importar leva no máximo 3 cliques a partir da tela Ajustes.

## Premissas

- **Fora desta etapa**: login, API e banco de dados ficam para a Parte 2 (constituição,
  princípio III). O conteúdo de cada tela fica para as etapas seguintes. As regras de negócio
  de cada módulo, como as RN06 a RN08 de projetos, entram nas tarefas próprias (T007 em diante).
- **Validação dos dados iniciais**: os dados iniciais são gravados como estão na seção 5. Por
  isso, projetos ativos podem começar sem próxima ação, já que a RN08 só passa a ser exigida na
  ativação, a partir da T015.
- **Áreas dos grupos e projetos iniciais**: cada grupo pertence a uma área, e seus projetos
  ficam na área do grupo (RN01), conforme a seção 5 de `docs/spec.md`:

  | Área | Grupos |
  |---|---|
  | Trabalho | Servioeste, Zona Sul e Coronel |
  | Faculdade | Faculdade |
  | Pessoal | Pessoal |

- **Prioridade dos projetos iniciais**: Zona Sul começa com prioridade alta, por estar marcado
  como urgente. Os demais começam com prioridade média.
- **Fila inicial**: os projetos em fila seguem a ordem da tabela da seção 5, dentro de cada
  grupo.
- **Rotina inicial**: cada linha da tabela da seção 5 vira uma rotina com horário, na área
  mais próxima (Trabalho para trabalho, Faculdade para aula, Saúde para academia, almoço e sono,
  Pessoal para acordar). "Acordar" fica às 7h30. "Estudo por conta própria" vira uma rotina de
  meta de horas, de segunda a quinta, na área Estudos, sem horário fixo e com a meta em branco
  até o usuário defini-la.
- **Horários de trabalho**: os dados iniciais usam os horários atuais da seção 5. A carga de 6
  horas por dia está nos pontos em aberto de `docs/spec.md`, e o usuário ajusta a rotina no app
  quando os novos horários forem definidos.
- **Áreas iniciais**: as 6 áreas recebem tons de cinza diferentes, já que a cor fica reservada a
  gráficos e ícones.
- **Fuso horário**: datas são exibidas no fuso `America/Sao_Paulo` até a tela Ajustes permitir
  mudar (T030).
- **Navegador**: uso em navegadores atuais de computador. Celular fica fora da V0.1.0.
- **Itens "Proposta" do `docs/plan.md`**: a escolha da linguagem, das rotas e da biblioteca de
  dados é feita em `/speckit-plan`. Se confirmar uma proposta, o `docs/plan.md` deve ser
  atualizado antes do código (constituição, princípio II).
