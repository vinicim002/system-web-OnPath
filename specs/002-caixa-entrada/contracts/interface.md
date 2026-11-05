# Contrato: interface da caixa

## Tela Caixa (`/caixa`)

```text
┌──────────────────────────────────────────────────────────┐
│ Caixa de entrada                                         │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Anote uma ideia…                     Enter para salvar│ │  ← foco ao abrir (FR-001)
│ └──────────────────────────────────────────────────────┘ │
│  [ Caixa 3 ]  [ Descartados 1 ]                          │  ← abas (FR-013)
│ ──────────────────────────────────────────────────────── │
│  Ligar para o banco                       há 2 min  ✎ ✕  │
│  Ideia de projeto: app de receitas        há 1 h    ✎ ✕  │
│  Comprar livro de cálculo                 ontem     ✎ ✕  │
└──────────────────────────────────────────────────────────┘
```

| Elemento | Comportamento |
|---|---|
| Campo de anotação | Área de texto que cresce com o conteúdo. Enter salva, Shift+Enter quebra linha. Depois de salvar, fica vazio e com o foco. Em erro, mantém o texto e mostra aviso |
| Aba Caixa | Itens novos (`useItensNovos`), com o texto inteiro, o tempo relativo e as ações de editar e descartar. Vazia: mensagem sobre o uso da caixa |
| Editar (✎) | Troca o texto por uma área de edição. Enter salva, Esc cancela. Texto vazio mantém o anterior |
| Descartar (✕) | Descarta sem confirmar e mostra o aviso "Item descartado" com "Desfazer" por 5 s |
| Aba Descartados | Itens descartados, com o texto, a data do descarte e o botão "Recuperar". Vazia: mensagem curta |

As ações de editar e descartar são botões com rótulo acessível, e aparecem ao passar o mouse ou
ao focar o item pelo teclado.

## Menu lateral

| Elemento | Comportamento |
|---|---|
| Botão "Anotar" | Abaixo do logo. Mostra o atalho (`Ctrl K`, ou `⌘K` no Mac) e abre o campo rápido |
| Contador na Caixa | Número de itens novos ao lado de "Caixa de entrada". Some quando é zero |

## Campo rápido

| Aspecto | Comportamento |
|---|---|
| Abrir | Ctrl+K (⌘K no Mac) em qualquer tela, mesmo com o foco em um campo, ou o botão "Anotar". Com o campo já aberto, o atalho não abre outro |
| Conteúdo | Título "Anotar na caixa", área de texto com o foco, dica "Enter para salvar · Esc para fechar" |
| Confirmar | Salva, fecha, mostra o aviso "Anotado na caixa" e mantém a tela atual |
| Fechar | Esc, clique fora ou o botão de fechar. Nada é criado |
| Erro | Mantém o campo aberto com o texto e mostra o aviso de erro |

## Textos (`src/i18n/pt-BR.ts`)

Chaves novas em `caixa.*`: título das abas, dica do campo, mensagens de lista vazia, rótulos
das ações, textos dos avisos (descartado, desfazer, recuperado, anotado) e do campo rápido
(`caixa.rapida.*`), além de `menu.anotar`. Os erros usam as chaves de `erros.*` que já existem.
