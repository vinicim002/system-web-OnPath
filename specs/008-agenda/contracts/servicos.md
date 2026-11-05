# Contrato: agenda e rotinas

```ts
type Ocupante = { tipo: "bloco" | "compromisso"; id: string; titulo: string; inicio: string; fim: string };

interface ItemAgenda {
  tipo: "bloco" | "compromisso";
  id: string;
  titulo: string;          // título da tarefa, nome da rotina ou título do compromisso
  areaId: string | null;
  inicio: string;          // ISO UTC
  fim: string;
  status?: StatusBlocoTempo;
  rotinaId?: string | null;
  tarefaId?: string | null;
  local?: string | null;
}

interface ServicoAgenda {
  listarNoIntervalo(inicio: string, fim: string): Promise<ItemAgenda[]>;
  criarBloco(dados: NovoBlocoTempo, opcoes?: { confirmarConflito?: boolean }): Promise<BlocoTempo>;
  alterarBloco(id: string, dados: AlteracaoBlocoTempo, opcoes?: { confirmarConflito?: boolean }): Promise<BlocoTempo>;
  marcarRealizado(id: string): Promise<BlocoTempo>;
  excluirBloco(id: string): Promise<void>;
  criarCompromisso(dados: NovoCompromisso, opcoes?: { confirmarConflito?: boolean }): Promise<Compromisso>;
  alterarCompromisso(id: string, dados: AlteracaoCompromisso, opcoes?: { confirmarConflito?: boolean }): Promise<Compromisso>;
  arquivarCompromisso(id: string): Promise<void>;
  recuperarCompromisso(id: string): Promise<Compromisso>;
}

interface ServicoRotinas extends ServicoColecao<Rotina, NovaRotina, AlteracaoRotina> {
  /** Ativas: com horário (por hora de início) e com meta (por nome). */
  listarOrdenadas(): Promise<Rotina[]>;
  /** Gera os blocos dos próximos 14 dias, sem duplicar. */
  renovarBlocos(hoje: string): Promise<{ criados: number }>;
  /** Minutos planejados e realizados da rotina no dia (RN28). */
  totalDoDia(rotinaId: string, data: string): Promise<number>;
}
```

`servicos.agenda` é novo em `Servicos`; `blocosTempo` e `compromissos` continuam como coleções
genéricas para a cópia de dados.

## Erros

| Código | Quando | Detalhes |
|---|---|---|
| `dados_invalidos` | Campos faltando, fim antes do início, dias diferentes, alvo ausente ou duplo, tarefa não aberta, tipo de rotina sem hora ou meta | `campos` |
| `horario_ocupado` **(novo)** | Sobreposição sem confirmação | `ocupantes` |

## Hooks

`useAgendaSemana(inicioSemana)`, `useRotinas()`, `useTotalRotina(rotinaId, data)` e as escritas
(`useCriarBloco`, `useAlterarBloco`, `useMarcarRealizado`, `useExcluirBloco`, `useCriarCompromisso`,
`useAlterarCompromisso`, `useArquivarCompromisso`, `useRecuperarCompromisso`, `useCriarRotina`,
`useAlterarRotina`, `useArquivarRotina`, `useRecuperarRotina`). Invalidam `["agenda"]` e
`["rotinas"]`.
