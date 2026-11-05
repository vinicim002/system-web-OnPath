import { z } from "zod";

// ---------------------------------------------------------------------------
// Formatos
// ---------------------------------------------------------------------------

const dataHoraIso = z.iso.datetime();
/** Data no formato AAAA-MM-DD. */
const dataSimples = z.iso.date();
/** Hora local no formato HH:mm. */
const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const id = z.uuid();
const texto = z.string().trim().min(1);
const inteiro = z.number().int();
const minutos = z.number().int().min(1);
/** Campo opcional: aceita ausência e guarda `null`. */
const opcional = <T extends z.ZodType>(esquema: T) => esquema.nullable().default(null);

export const esquemaCamposComuns = z.object({
  id,
  criadoEm: dataHoraIso,
  atualizadoEm: dataHoraIso,
  arquivadoEm: dataHoraIso.nullable(),
});

export type CamposComuns = z.infer<typeof esquemaCamposComuns>;
export const CAMPOS_COMUNS = ["id", "criadoEm", "atualizadoEm", "arquivadoEm"] as const;

// ---------------------------------------------------------------------------
// Valores permitidos (docs/plan.md, seção 6)
// ---------------------------------------------------------------------------

export const prioridade = z.enum(["alta", "media", "baixa"]);
export const statusProjeto = z.enum(["fila", "ativo", "pausado", "concluido", "cancelado"]);
export const statusTarefa = z.enum(["aberta", "concluida", "cancelada"]);
export const statusItemCaixa = z.enum(["novo", "processado", "descartado"]);
export const statusMeta = z.enum(["ativa", "concluida", "cancelada"]);
export const statusMateria = z.enum(["ativa", "pausada", "concluida"]);
export const resultadoItemDia = z.enum(["pendente", "feita", "remarcada", "devolvida", "cancelada"]);
export const tipoRotina = z.enum(["horario", "meta_horas"]);
export const statusBlocoTempo = z.enum(["planejado", "realizado", "perdido", "remarcado"]);
export const tipoMaterial = z.enum(["resumo", "link"]);
export const statusSessaoEstudo = z.enum(["planejada", "realizada", "cancelada"]);

// ---------------------------------------------------------------------------
// Entidades
// ---------------------------------------------------------------------------

function entidade<C extends z.ZodRawShape>(campos: C) {
  return {
    novo: z.object(campos),
    completo: esquemaCamposComuns.extend(campos),
  };
}

export const esquemas = {
  areas: entidade({
    nome: texto,
    cor: z.string().min(1),
    ordem: inteiro.min(0),
  }),
  metas: entidade({
    areaId: id,
    titulo: texto,
    descricao: opcional(z.string()),
    prazo: opcional(dataSimples),
    status: statusMeta,
  }),
  grupos: entidade({
    areaId: id,
    nome: texto,
    limiteAtivos: inteiro.min(0),
  }),
  projetos: entidade({
    areaId: id,
    grupoId: id,
    metaId: opcional(id),
    nome: texto,
    descricao: opcional(z.string()),
    prazo: opcional(dataSimples),
    prioridade,
    status: statusProjeto,
    posicaoFila: inteiro.min(0),
  }),
  colunas: entidade({
    projetoId: id,
    nome: texto,
    ordem: inteiro.min(0),
    final: z.boolean(),
  }),
  tarefas: entidade({
    areaId: id,
    projetoId: opcional(id),
    materiaId: opcional(id),
    colunaId: opcional(id),
    tarefaPaiId: opcional(id),
    titulo: texto,
    prioridade,
    tempoEstimadoMin: opcional(minutos),
    prazo: opcional(dataSimples),
    status: statusTarefa,
    concluidaEm: opcional(dataHoraIso),
    anotacoes: opcional(z.string()),
  }),
  itensCaixa: entidade({
    conteudo: texto,
    status: statusItemCaixa,
  }),
  itensDia: entidade({
    tarefaId: id,
    data: dataSimples,
    ordem: inteiro.min(0),
    resultado: resultadoItemDia,
  }),
  rotinas: entidade({
    areaId: id,
    nome: texto,
    tipo: tipoRotina,
    diasSemana: z.array(inteiro.min(0).max(6)),
    horaInicio: opcional(hora),
    duracaoMin: opcional(minutos),
    metaMin: opcional(minutos),
  }),
  compromissos: entidade({
    areaId: id,
    titulo: texto,
    inicio: dataHoraIso,
    fim: dataHoraIso,
    local: opcional(z.string()),
  }),
  blocosTempo: entidade({
    tarefaId: opcional(id),
    rotinaId: opcional(id),
    sessaoEstudoId: opcional(id),
    inicio: dataHoraIso,
    fim: dataHoraIso,
    status: statusBlocoTempo,
  }),
  materias: entidade({
    areaId: id,
    nome: texto,
    descricao: opcional(z.string()),
    status: statusMateria,
  }),
  topicos: entidade({
    materiaId: id,
    nome: texto,
    ordem: inteiro.min(0),
  }),
  materiais: entidade({
    materiaId: id,
    topicoId: opcional(id),
    tipo: tipoMaterial,
    titulo: texto,
    conteudo: opcional(z.string()),
    url: opcional(z.url()),
  }),
  sessoesEstudo: entidade({
    materiaId: id,
    topicoId: opcional(id),
    duracaoPlanejadaMin: minutos,
    duracaoRealMin: opcional(inteiro.min(0)),
    anotacoes: opcional(z.string()),
    status: statusSessaoEstudo,
  }),
};

export type NomeColecao = keyof typeof esquemas;

export type Prioridade = z.infer<typeof prioridade>;
export type StatusTarefa = z.infer<typeof statusTarefa>;
export type StatusProjeto = z.infer<typeof statusProjeto>;
export type StatusBlocoTempo = z.infer<typeof statusBlocoTempo>;

export const NOMES_COLECOES = [
  "areas",
  "metas",
  "grupos",
  "projetos",
  "colunas",
  "tarefas",
  "itensCaixa",
  "itensDia",
  "rotinas",
  "compromissos",
  "blocosTempo",
  "materias",
  "topicos",
  "materiais",
  "sessoesEstudo",
] as const satisfies readonly NomeColecao[];

type Completo<N extends NomeColecao> = z.output<(typeof esquemas)[N]["completo"]>;
type Novo<N extends NomeColecao> = z.input<(typeof esquemas)[N]["novo"]>;

export type Area = Completo<"areas">;
export type NovaArea = Novo<"areas">;
export type AlteracaoArea = Partial<NovaArea>;

export type Meta = Completo<"metas">;
export type NovaMeta = Novo<"metas">;
export type AlteracaoMeta = Partial<NovaMeta>;

export type Grupo = Completo<"grupos">;
export type NovoGrupo = Novo<"grupos">;
export type AlteracaoGrupo = Partial<NovoGrupo>;

export type Projeto = Completo<"projetos">;
/** O `areaId` do projeto vem sempre do grupo (RN01), por isso a tela não o informa. */
export type NovoProjeto = Omit<Novo<"projetos">, "areaId">;
export type AlteracaoProjeto = Partial<NovoProjeto>;

export type Coluna = Completo<"colunas">;
export type NovaColuna = Novo<"colunas">;
export type AlteracaoColuna = Partial<NovaColuna>;

export type Tarefa = Completo<"tarefas">;
export type NovaTarefa = Novo<"tarefas">;
export type AlteracaoTarefa = Partial<NovaTarefa>;

export type ItemCaixa = Completo<"itensCaixa">;
export type NovoItemCaixa = Novo<"itensCaixa">;
export type AlteracaoItemCaixa = Partial<NovoItemCaixa>;

export type ItemDia = Completo<"itensDia">;
export type NovoItemDia = Novo<"itensDia">;
export type AlteracaoItemDia = Partial<NovoItemDia>;

export type Rotina = Completo<"rotinas">;
export type NovaRotina = Novo<"rotinas">;
export type AlteracaoRotina = Partial<NovaRotina>;

export type Compromisso = Completo<"compromissos">;
export type NovoCompromisso = Novo<"compromissos">;
export type AlteracaoCompromisso = Partial<NovoCompromisso>;

export type BlocoTempo = Completo<"blocosTempo">;
export type NovoBlocoTempo = Novo<"blocosTempo">;
export type AlteracaoBlocoTempo = Partial<NovoBlocoTempo>;

export type Materia = Completo<"materias">;
export type NovaMateria = Novo<"materias">;
export type AlteracaoMateria = Partial<NovaMateria>;

export type Topico = Completo<"topicos">;
export type NovoTopico = Novo<"topicos">;
export type AlteracaoTopico = Partial<NovoTopico>;

export type Material = Completo<"materiais">;
export type NovoMaterial = Novo<"materiais">;
export type AlteracaoMaterial = Partial<NovoMaterial>;

export type SessaoEstudo = Completo<"sessoesEstudo">;
export type NovaSessaoEstudo = Novo<"sessoesEstudo">;
export type AlteracaoSessaoEstudo = Partial<NovaSessaoEstudo>;

/** Mapa de cada coleção para o tipo dos seus registros. */
export interface Registros {
  areas: Area;
  metas: Meta;
  grupos: Grupo;
  projetos: Projeto;
  colunas: Coluna;
  tarefas: Tarefa;
  itensCaixa: ItemCaixa;
  itensDia: ItemDia;
  rotinas: Rotina;
  compromissos: Compromisso;
  blocosTempo: BlocoTempo;
  materias: Materia;
  topicos: Topico;
  materiais: Material;
  sessoesEstudo: SessaoEstudo;
}

export type Colecoes = { [N in NomeColecao]: Registros[N][] };

/** Chave de controle guardada junto com as coleções. */
export const esquemaMeta = z.object({
  versaoEsquema: z.number().int().min(1),
  dadosIniciaisEm: dataHoraIso.nullable(),
  ultimaExportacaoEm: dataHoraIso.nullable(),
});

export type MetaArmazenamento = z.infer<typeof esquemaMeta>;
