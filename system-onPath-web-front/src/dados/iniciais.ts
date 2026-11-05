import { gerarId } from "@/plataforma/id";
import { cores } from "@/theme";

import type { Area, Grupo, Projeto, Rotina } from "./tipos";

// Os nomes abaixo são dados do usuário (docs/spec.md, seção 5), não textos de tela.

const SEG_A_SEX = [1, 2, 3, 4, 5];
const SEG_E_QUA = [1, 3];
const TER_E_QUI = [2, 4];
const SEX = [5];
const SEG_A_QUI = [1, 2, 3, 4];

export interface DadosIniciais {
  areas: Area[];
  grupos: Grupo[];
  projetos: Projeto[];
  rotinas: Rotina[];
}

/** Monta os registros completos dos dados iniciais, todos com a mesma data de criação. */
export function montarDadosIniciais(agora: string): DadosIniciais {
  const comuns = () => ({ id: gerarId(), criadoEm: agora, atualizadoEm: agora, arquivadoEm: null });

  const nomesAreas = ["Faculdade", "Trabalho", "Estudos", "Saúde", "Pessoal", "Finanças"] as const;
  const coresAreas = [
    cores.cinza[900],
    cores.cinza[800],
    cores.cinza[700],
    cores.cinza[600],
    cores.cinza[500],
    cores.cinza[400],
  ];
  const areas: Area[] = nomesAreas.map((nome, ordem) => ({
    ...comuns(),
    nome,
    cor: coresAreas[ordem],
    ordem,
  }));
  const area = (nome: (typeof nomesAreas)[number]) => areas.find((item) => item.nome === nome)!.id;

  const grupos: Grupo[] = (
    [
      ["Servioeste", "Trabalho", 1],
      ["Faculdade", "Faculdade", 1],
      ["Zona Sul", "Trabalho", 1],
      ["Coronel", "Trabalho", 1],
      ["Pessoal", "Pessoal", 2],
    ] as const
  ).map(([nome, nomeArea, limiteAtivos]) => ({
    ...comuns(),
    areaId: area(nomeArea),
    nome,
    limiteAtivos,
  }));
  const grupo = (nome: string) => grupos.find((item) => item.nome === nome)!;

  const projetos: Projeto[] = (
    [
      ["TCC / RookHub", "Faculdade", "ativo", "media", 0],
      ["Zona Sul", "Zona Sul", "ativo", "alta", 0],
      ["RookMTR", "Servioeste", "ativo", "media", 0],
      ["OnPath", "Pessoal", "ativo", "media", 0],
      ["Portfólio", "Pessoal", "ativo", "media", 0],
      ["App do Edu", "Servioeste", "fila", "media", 1],
      ["App do Matheus", "Servioeste", "fila", "media", 2],
      ["App do RH", "Servioeste", "fila", "media", 3],
      ["CRO", "Coronel", "fila", "media", 1],
      ["App de seminário", "Coronel", "fila", "media", 2],
    ] as const
  ).map(([nome, nomeGrupo, status, prioridade, posicaoFila]) => ({
    ...comuns(),
    areaId: grupo(nomeGrupo).areaId,
    grupoId: grupo(nomeGrupo).id,
    metaId: null,
    nome,
    descricao: null,
    prazo: null,
    prioridade,
    status,
    posicaoFila,
  }));

  const horario = (
    nome: string,
    nomeArea: (typeof nomesAreas)[number],
    diasSemana: number[],
    horaInicio: string,
    duracaoMin: number | null,
  ): Rotina => ({
    ...comuns(),
    areaId: area(nomeArea),
    nome,
    tipo: "horario",
    diasSemana,
    horaInicio,
    duracaoMin,
    metaMin: null,
  });

  const rotinas: Rotina[] = [
    horario("Acordar", "Pessoal", SEG_A_SEX, "07:30", null),
    horario("Trabalho (manhã)", "Trabalho", SEG_E_QUA, "08:00", 240),
    horario("Trabalho (manhã)", "Trabalho", TER_E_QUI, "09:00", 180),
    horario("Aula", "Faculdade", SEX, "08:00", 240),
    horario("Almoço", "Saúde", SEG_A_SEX, "12:00", 60),
    horario("Trabalho (tarde)", "Trabalho", SEG_A_SEX, "13:00", 120),
    horario("Academia", "Saúde", SEG_A_SEX, "15:00", 90),
    horario("Trabalho (fim do dia)", "Trabalho", SEG_E_QUA, "16:30", 150),
    horario("Trabalho (fim do dia)", "Trabalho", TER_E_QUI, "16:30", 210),
    horario("Trabalho (fim do dia)", "Trabalho", SEX, "16:30", 240),
    horario("Sono", "Saúde", SEG_A_SEX, "23:00", null),
    {
      ...comuns(),
      areaId: area("Estudos"),
      nome: "Estudo por conta própria",
      tipo: "meta_horas",
      diasSemana: SEG_A_QUI,
      horaInicio: null,
      duracaoMin: null,
      metaMin: null,
    },
  ];

  return { areas, grupos, projetos, rotinas };
}
