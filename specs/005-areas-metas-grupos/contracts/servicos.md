# Contrato: serviços de áreas, metas e grupos

Em `src/dados/contratos.ts`. Implementações locais em `src/dados/local/areas.ts`,
`src/dados/local/metas.ts` e `src/dados/local/grupos.ts`.

```ts
interface ContagemArea {
  metasAtivas: number;
  grupos: number;
  projetos: number;
  tarefasAbertas: number;
  materias: number;
}

interface AreaComResumo extends Area {
  contagem: ContagemArea;
}

interface ServicoAreas extends ServicoColecao<Area, NovaArea, AlteracaoArea> {
  /** Áreas ativas na ordem, com as contagens. */
  listarComResumo(): Promise<AreaComResumo[]>;
  /** Áreas arquivadas, da mais recente para a mais antiga. */
  listarArquivadas(): Promise<Area[]>;
  /** Cria no fim. Nome único e tom do tema. */
  criar(dados: { nome: string; cor: string }): Promise<Area>;
  alterar(id: string, dados: { nome?: string; cor?: string }): Promise<Area>;
  /** Regrava a ordem das áreas ativas. A lista precisa ter todas elas. */
  reordenar(ids: string[]): Promise<void>;
  /** Com itens ativos, exige `confirmado: true`. Nunca arquiva a última área ativa. */
  excluir(id: string, opcoes?: { confirmado?: boolean }): Promise<void>;
  /** Recupera no fim da ordem. */
  recuperar(id: string): Promise<Area>;
}

interface MetaNaLista extends Meta {
  atrasada: boolean;
}

interface ServicoMetas extends ServicoColecao<Meta, NovaMeta, AlteracaoMeta> {
  /** Metas ativas da área (não arquivadas), na ordem da tela; `hoje` define o atraso. */
  listarDaArea(areaId: string, hoje: string): Promise<MetaNaLista[]>;
}

interface GrupoComVagas extends Grupo {
  ativos: number;
  acimaDoLimite: boolean;
}

interface ServicoGrupos extends ServicoColecao<Grupo, NovoGrupo, AlteracaoGrupo> {
  /** Grupos ativos da área, por nome, com as vagas (RN06). */
  listarDaArea(areaId: string): Promise<GrupoComVagas[]>;
  /** Recusa enquanto houver projetos não arquivados no grupo. */
  excluir(id: string): Promise<void>;
}
```

## Erros

| Código | Quando | Detalhes |
|---|---|---|
| `dados_invalidos` | Nome ou título vazio, tom fora do tema, limite negativo ou não inteiro, área inexistente ou arquivada, lista de `reordenar` incompleta | `campos` |
| `nome_repetido` **(novo)** | Nome de área ou de grupo repetido | `campos: ["nome"]` |
| `area_com_itens` **(novo)** | Arquivar área com itens ativos, sem confirmar | `contagem` |
| `ultima_area` **(novo)** | Arquivar a última área ativa | — |
| `grupo_com_projetos` **(novo)** | Arquivar grupo com projetos | `projetos` |

Em qualquer erro, nada é gravado.

## Hooks (`src/dados/consultas.ts`)

| Hook | Uso |
|---|---|
| `useAreasComResumo()`, `useAreasArquivadas()` | Lista de áreas. Chave `["areas", …]` |
| `useMetasDaArea(areaId, hoje)` | Metas. Chave `["metas", areaId, hoje]` |
| `useGruposDaArea(areaId)` | Grupos com vagas. Chave `["grupos", areaId]` |
| `useCriarArea`, `useAlterarArea`, `useReordenarAreas`, `useArquivarArea`, `useRecuperarArea`, `useCriarMeta`, `useAlterarMeta`, `useExcluirMeta`, `useRecuperarMeta`, `useCriarGrupo`, `useAlterarGrupo`, `useExcluirGrupo`, `useRecuperarGrupo` | Escritas |

As escritas de áreas invalidam `["areas"]` e `["opcoesTarefa"]` (formulários e filtros); as de
metas, `["metas"]` e `["areas"]` (contagens); as de grupos, `["grupos"]` e `["areas"]`.
