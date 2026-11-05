import type { NovaTarefa, Prioridade } from "@/dados/tipos";

/** Valores do formulário de tarefa e a conversão para o serviço. */

export const PRIORIDADES: Prioridade[] = ["alta", "media", "baixa"];
export const VINCULOS = ["avulsa", "projeto", "materia"] as const;
export type Vinculo = (typeof VINCULOS)[number];

export interface ValoresFormulario {
  titulo: string;
  vinculo: Vinculo;
  projetoId: string;
  materiaId: string;
  areaId: string;
  prioridade: Prioridade | "";
  tempoEstimadoMin: string;
  prazo: string;
  anotacoes: string;
}

export const VALORES_VAZIOS: ValoresFormulario = {
  titulo: "",
  vinculo: "avulsa",
  projetoId: "",
  materiaId: "",
  areaId: "",
  prioridade: "",
  tempoEstimadoMin: "",
  prazo: "",
  anotacoes: "",
};

/** Valores do formulário a partir de uma tarefa existente. */
export function valoresDaTarefa(tarefa: {
  titulo: string;
  projetoId: string | null;
  materiaId: string | null;
  areaId: string;
  prioridade: Prioridade;
  tempoEstimadoMin: number | null;
  prazo: string | null;
  anotacoes: string | null;
}): ValoresFormulario {
  return {
    titulo: tarefa.titulo,
    vinculo: tarefa.projetoId ? "projeto" : tarefa.materiaId ? "materia" : "avulsa",
    projetoId: tarefa.projetoId ?? "",
    materiaId: tarefa.materiaId ?? "",
    areaId: tarefa.areaId,
    prioridade: tarefa.prioridade,
    tempoEstimadoMin: tarefa.tempoEstimadoMin === null ? "" : String(tarefa.tempoEstimadoMin),
    prazo: tarefa.prazo ?? "",
    anotacoes: tarefa.anotacoes ?? "",
  };
}

/** Dados para o serviço. A área de projeto ou matéria é confirmada pelo serviço (RN01). */
export function paraNovaTarefa(valores: ValoresFormulario): NovaTarefa {
  const tempo = valores.tempoEstimadoMin.trim();
  return {
    titulo: valores.titulo,
    areaId: valores.areaId,
    projetoId: valores.vinculo === "projeto" ? valores.projetoId : null,
    materiaId: valores.vinculo === "materia" ? valores.materiaId : null,
    prioridade: valores.prioridade as Prioridade,
    tempoEstimadoMin: tempo === "" ? null : Number(tempo),
    prazo: valores.prazo || null,
    anotacoes: valores.anotacoes,
    status: "aberta",
  };
}
