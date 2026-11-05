import type { Projeto } from "@/dados/tipos";

import type { ValoresProjeto } from "./FormularioProjeto";

export function valoresDoProjeto(projeto: Projeto): ValoresProjeto {
  return {
    nome: projeto.nome,
    grupoId: projeto.grupoId,
    prioridade: projeto.prioridade,
    prazo: projeto.prazo ?? "",
    metaId: projeto.metaId ?? "",
    descricao: projeto.descricao ?? "",
  };
}

export function paraDadosProjeto(valores: ValoresProjeto) {
  return {
    nome: valores.nome,
    grupoId: valores.grupoId,
    prioridade: valores.prioridade as Projeto["prioridade"],
    prazo: valores.prazo || null,
    metaId: valores.metaId || null,
    descricao: valores.descricao.trim() || null,
  };
}

export const PROJETO_VAZIO: ValoresProjeto = {
  nome: "",
  grupoId: "",
  prioridade: "media",
  prazo: "",
  metaId: "",
  descricao: "",
};
