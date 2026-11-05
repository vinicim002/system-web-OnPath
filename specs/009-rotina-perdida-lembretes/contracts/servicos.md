# Contrato: rotina perdida, tempo livre, lembretes e preferências

```ts
interface Preferencias { horaInicioDia: string; horaFimDia: string; lembretesAtivos: boolean }

interface ServicoPreferencias {
  obter(): Promise<Preferencias>;
  alterar(dados: Partial<Preferencias>): Promise<Preferencias>;   // dados_invalidos: fim <= início
}

interface Intervalo { inicio: string; fim: string }

interface RotinaPerdida {
  bloco: BlocoTempo;
  titulo: string;
  proposta: Intervalo | null;
}

interface TempoLivre { janelaMin: number; ocupadoMin: number; livreMin: number }

// Acrescentado a ServicoAgenda
rotinasPerdidas(agora: string): Promise<RotinaPerdida[]>;
aceitarProposta(id: string, proposta: Intervalo): Promise<BlocoTempo>;   // horario_ocupado
recusarProposta(id: string): Promise<BlocoTempo>;
tempoLivre(data: string): Promise<TempoLivre>;
lembretesDevidos(agora: string, antecedenciaMin: number): Promise<ItemAgenda[]>;
```

## Hooks

`usePreferencias`, `useAlterarPreferencias`, `useRotinasPerdidas(hoje)`, `useAceitarProposta`,
`useRecusarProposta`, `useTempoLivre(data)`. As escritas invalidam `["agenda"]`, `["perdidas"]`,
`["tempoLivre"]` e `["preferencias"]` conforme o caso.
