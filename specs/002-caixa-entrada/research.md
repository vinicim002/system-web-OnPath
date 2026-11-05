# Pesquisa: Caixa de entrada

Decisões da Fase 0. A base técnica (stack, camada de dados, tema e textos) vem da feature 001
(`specs/001-base-front-end/research.md`) e não muda aqui.

## 1. Descarte e arquivamento

- **Decisão**: descartar grava, de uma vez, a situação `descartado` e a data em `arquivadoEm`.
  Recuperar faz o inverso: situação `novo` e `arquivadoEm` vazio. As duas coisas andam sempre
  juntas, e a data do descarte mostrada na tela é o `arquivadoEm`.
- **Motivo**: o modelo de dados já tem a situação do item (`novo`, `processado`, `descartado`) e
  o arquivamento comum a todas as entidades (RN31). Manter os dois alinhados faz o descarte
  aparecer certo tanto para quem olha a situação quanto para quem olha o arquivamento, como a
  futura API e a cópia de dados. Não é preciso criar campo novo.
- **Alternativas**: só arquivar, sem mudar a situação, o que deixaria `descartado` sem uso e
  confuso. Só mudar a situação, sem arquivar, o que faria o item descartado aparecer nas
  listagens comuns, contrariando a RN31.

## 2. Onde ficam as regras

- **Decisão**: um serviço próprio da caixa, `ServicoItensCaixa`, que estende o serviço comum de
  coleção com `listarNovos`, `listarDescartados`, `capturar`, `descartar` e `recuperar`. No serviço
  da caixa, `excluir` é o mesmo que `descartar`, e `recuperar` também volta a situação para
  `novo`.
- **Motivo**: o princípio IV pede regras nos serviços. Assim, a tela não sabe que descartar
  mexe em dois campos, e a troca pela API (Parte 2) não muda a tela.
- **Alternativas**: filtrar e combinar os campos na tela, o que viola o princípio IV.

## 3. Atualização da tela

- **Decisão**: consultas do TanStack Query com as chaves `["itensCaixa", "novos"]` e
  `["itensCaixa", "descartados"]`. Toda escrita invalida `["itensCaixa"]`, o que atualiza a
  lista, os descartados e o contador do menu ao mesmo tempo. Não há atualização otimista.
- **Motivo**: o armazenamento local responde na hora, então recarregar a consulta fica bem
  abaixo dos 100 ms do SC-004. A atualização otimista só complicaria o código agora e pode
  entrar com a API, sem mudar a tela.

## 4. Campo rápido e atalho

- **Decisão**: o campo rápido é um diálogo do shadcn/ui (`Dialog`) com uma área de texto. O
  atalho é **Ctrl+K** (**⌘K** no Mac), que funciona em qualquer tela, mesmo com o foco em outro
  campo. O botão "Anotar" fica no menu lateral, abaixo do logo, e mostra o atalho.
- **Motivo**: Ctrl+K é o atalho que apps como Slack, Linear e GitHub usam para ações rápidas, e
  não é copiar, colar, recarregar nem desfazer. O navegador usa Ctrl+K para buscar na barra de
  endereço, mas a página pode tomar o atalho para si, como esses apps fazem.
- **Alternativas**: `cmdk`, previsto no `docs/plan.md` para esta etapa. Ele serve para paletas
  de comandos com busca em listas, e aqui só existe um campo de texto. Fica para quando houver
  uma paleta de comandos (navegar, criar tarefa). Uma tecla solta, como `N`, foi descartada
  porque não funciona com o foco em um campo de texto, e o caso-limite da especificação pede
  isso.

## 5. Avisos e desfazer

- **Decisão**: `sonner`, pelo componente do shadcn/ui, com o `Toaster` na moldura do app. O
  aviso de descarte dura 5 segundos e tem a ação "Desfazer", que chama `recuperar`. O aviso do
  campo rápido confirma que o item foi para a caixa. Erros ao salvar também usam aviso, com o
  que aconteceu e o que fazer.
- **Motivo**: avisos com ação e fila são o caso de uso do sonner, que já tem integração pronta
  no shadcn/ui.
- **Alternativas**: um aviso feito à mão, que exigiria tratar fila, tempo e acessibilidade.

## 6. Datas na lista

- **Decisão**: `Intl.RelativeTimeFormat` em português para "há 5 minutos", e
  `Intl.DateTimeFormat` no fuso `America/Sao_Paulo` para a data do descarte. As funções ficam em
  `src/i18n/datas.ts`.
- **Motivo**: o navegador já faz isso em português, sem dependência. O `date-fns` continua
  previsto para as telas de agenda (T011 e T012), onde há cálculos de datas.

## 7. Teclado no campo de anotação

- **Decisão**: Enter confirma e Shift+Enter quebra a linha, nos dois campos (o da tela e o
  rápido). Enquanto um teclado de acentos ou IME está compondo (`isComposing`), Enter não
  confirma. Na edição de um item, Enter salva e Esc cancela.
- **Motivo**: é o padrão de apps de mensagem e captura, e cumpre o FR-003 e o SC-002.

## 8. Descartados na tela

- **Decisão**: abas do shadcn/ui (`Tabs`) no topo da lista: "Caixa" e "Descartados", cada uma
  com a contagem.
- **Motivo**: o FR-013 pede acesso sem sair da Caixa. As abas mostram que os descartados
  existem sem ocupar espaço.
- **Alternativas**: uma rota própria (`/caixa/descartados`), que sairia da tela, ou uma seção
  recolhida no fim da lista, fácil de não ver.

## 9. Testes

- **Decisão**: testes Vitest do serviço da caixa (captura, espaços, texto vazio, ordem,
  descarte, recuperação, edição e cópia com descartados). A tela é verificada pelo
  `quickstart.md` no navegador, como na feature 001.
- **Motivo**: as regras estão no serviço, que é onde está o risco de perder dados.

## 10. Muitos itens

- **Decisão**: lista simples, sem virtualização.
- **Motivo**: 500 itens de texto curto são leves para o navegador (SC-005). A virtualização
  pode entrar depois, se a medição mostrar necessidade.
