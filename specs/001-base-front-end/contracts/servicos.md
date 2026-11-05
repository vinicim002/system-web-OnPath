# Contrato: serviços usados pelas telas

As telas só conhecem este contrato, definido em `system-onPath-web-front/src/dados/contratos.ts`. A implementação
local (Parte 1) e a implementação pela API (Parte 2, T046) cumprem a mesma interface. A troca
acontece só no `ServicosProvider` (FR-012).

## Regras gerais

- Todo método é assíncrono (`Promise`), inclusive na implementação local.
- Toda falha é um `ErroOnPath`, com o formato de erro da seção 8 de `docs/plan.md`:

  ```ts
  interface ErroOnPath {
    codigo: string;                     // ex.: "dados_invalidos"
    mensagem: string;                   // texto em português, vindo de src/i18n
    detalhes: Record<string, unknown>;
  }
  ```

- `excluir` arquiva o item (RN31). `listar` ignora arquivados, a menos que receba
  `{ incluirArquivados: true }`. `recuperar` limpa o `arquivadoEm`.
- Os campos comuns (`id`, `criadoEm`, `atualizadoEm` e `arquivadoEm`) são preenchidos pelo
  serviço, nunca pela tela.

## Serviço genérico de coleção

Cada entidade do `data-model.md` tem um serviço com esta forma:

```ts
interface ServicoColecao<T, Novo, Alteracao> {
  listar(opcoes?: { incluirArquivados?: boolean }): Promise<T[]>;
  obter(id: string): Promise<T>;                 // erro "nao_encontrado"
  criar(dados: Novo): Promise<T>;                // erro "dados_invalidos"
  alterar(id: string, dados: Alteracao): Promise<T>;
  excluir(id: string): Promise<void>;            // arquiva
  recuperar(id: string): Promise<T>;
}
```

O conjunto exposto às telas:

```ts
interface Servicos {
  areas: ServicoColecao<Area, NovaArea, AlteracaoArea>;
  metas: ServicoColecao<Meta, ...>;
  grupos: ServicoColecao<Grupo, ...>;
  projetos: ServicoColecao<Projeto, ...>;   // areaId vem do grupo (RN01)
  colunas: ServicoColecao<Coluna, ...>;
  tarefas: ServicoColecao<Tarefa, ...>;
  itensCaixa: ServicoColecao<ItemCaixa, ...>;
  itensDia: ServicoColecao<ItemDia, ...>;
  rotinas: ServicoColecao<Rotina, ...>;
  compromissos: ServicoColecao<Compromisso, ...>;
  blocosTempo: ServicoColecao<BlocoTempo, ...>;
  materias: ServicoColecao<Materia, ...>;
  topicos: ServicoColecao<Topico, ...>;
  materiais: ServicoColecao<Material, ...>;
  sessoesEstudo: ServicoColecao<SessaoEstudo, ...>;
  dados: ServicoDados;
}
```

As operações próprias de cada módulo, como `projetos.ativar` e `tarefas.concluir`, são
acrescentadas a este contrato nas tarefas de cada módulo (T007 em diante), sempre antes da tela
que as usa.

## Serviço de dados (`dados`)

```ts
interface ServicoDados {
  /** Cria os dados iniciais se ainda não existirem. Pode ser chamado várias vezes. */
  prepararPrimeiroUso(): Promise<{ criou: boolean }>;
  /** Devolve a cópia completa, inclusive arquivados (FR-020), e registra a data da exportação. */
  exportar(): Promise<CopiaDados>;
  /** Valida a cópia inteira e só então substitui todos os dados (FR-021 e FR-022). */
  importar(conteudo: unknown): Promise<{ registros: number }>;
}
```

### Erros do serviço de dados

| Código | Quando |
|---|---|
| `copia_invalida` | O arquivo não é JSON ou não segue o formato de `copia-dados.md` |
| `copia_versao_desconhecida` | A `versao` do arquivo é mais nova que a suportada |
| `copia_referencia_quebrada` | Um registro aponta para outro que não existe na cópia |
| `armazenamento_indisponivel` | O navegador bloqueia ou não tem espaço para gravar |

As mensagens de cada código ficam em `src/i18n/pt-BR.ts` e dizem o que aconteceu e o que fazer.

## Uso nas telas

As telas acessam os serviços por hooks em `src/dados/consultas.ts`, como `useAreas()` e
`useExportarDados()`. Esses hooks envolvem os métodos acima no TanStack Query. As telas nunca
importam nada de `src/dados/local/`.
