import type { ValoresRotina } from "./FormularioRotina";

/** Dados para o serviço: os campos do outro tipo ficam vazios. */
export function paraDadosRotina(v: ValoresRotina) {
  return {
    nome: v.nome,
    areaId: v.areaId,
    tipo: v.tipo,
    diasSemana: v.diasSemana,
    horaInicio: v.tipo === "horario" ? v.horaInicio : null,
    duracaoMin: v.tipo === "horario" && v.duracaoMin ? Number(v.duracaoMin) : null,
    metaMin: v.tipo === "meta_horas" ? Number(v.metaMin) : null,
  };
}
