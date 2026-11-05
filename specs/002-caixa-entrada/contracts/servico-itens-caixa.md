# Contrato: serviço da caixa

O serviço `itensCaixa` passa de `ServicoColecao` para `ServicoItensCaixa`, em
`src/dados/contratos.ts`. A tela só usa este contrato, pelos hooks de `src/dados/consultas.ts`
(princípio IV). A implementação local fica em `src/dados/local/caixa.ts`. Na Parte 2, a API
cumpre o mesmo contrato.

```ts
interface ServicoItensCaixa
  extends ServicoColecao<ItemCaixa, NovoItemCaixa, AlteracaoItemCaixa> {
  /** Itens novos e não arquivados, do mais novo para o mais antigo. */
  listarNovos(): Promise<ItemCaixa[]>;
  /** Itens descartados, do descarte mais recente para o mais antigo. */
  listarDescartados(): Promise<ItemCaixa[]>;
  /** Cria um item novo só com o texto (RN03). Remove os espaços das pontas. */
  capturar(conteudo: string): Promise<ItemCaixa>;
  /** Situação `descartado` e `arquivadoEm` com a data atual, na mesma escrita (RN31). */
  descartar(id: string): Promise<ItemCaixa>;
  /** Situação `novo` e `arquivadoEm` vazio, na mesma escrita. */
  recuperar(id: string): Promise<ItemCaixa>;
}
```

## Comportamento

| Chamada | Resultado | Erros |
|---|---|---|
| `capturar("  ideia  ")` | Item com `conteudo = "ideia"`, `status = novo` | `dados_invalidos` (campo `conteudo`) se o texto for vazio ou só espaços. `armazenamento_indisponivel` se não for possível gravar |
| `descartar(id)` | Item com `status = descartado` e `arquivadoEm` preenchido. Em item já descartado, devolve o item sem mudar | `nao_encontrado`, `armazenamento_indisponivel` |
| `recuperar(id)` | Item com `status = novo` e `arquivadoEm` vazio. Em item já novo, devolve o item sem mudar | `nao_encontrado`, `armazenamento_indisponivel` |
| `excluir(id)` | O mesmo que `descartar` | Os mesmos |
| `alterar(id, { conteudo })` | Item com o texto novo, sem os espaços das pontas | `dados_invalidos` se vazio; `nao_encontrado` |
| `listar()` | Itens não arquivados, como nas outras coleções | — |

Quando uma chamada falha, nada é gravado.

## Hooks de consulta (`src/dados/consultas.ts`)

| Hook | Uso |
|---|---|
| `useItensNovos()` | Lista principal e contador do menu. Chave `["itensCaixa", "novos"]` |
| `useItensDescartados()` | Aba de descartados. Chave `["itensCaixa", "descartados"]` |
| `useCapturarItem()` | Campo da tela e campo rápido |
| `useDescartarItem()` | Botão de descartar |
| `useRecuperarItem()` | "Desfazer" no aviso e "Recuperar" nos descartados |
| `useEditarItem()` | Edição do texto na lista |

Toda escrita invalida a chave `["itensCaixa"]`, o que recarrega as duas listas e o contador.
