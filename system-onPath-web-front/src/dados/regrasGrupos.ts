/** Vagas de um grupo (RN06): usadas na tela de áreas e na regra de ativação de projetos (RN07). */
import type { Grupo, Projeto } from "./tipos";

export interface Vagas {
  ativos: number;
  acimaDoLimite: boolean;
}

export function vagasDoGrupo(grupo: Grupo, projetos: Projeto[]): Vagas {
  const ativos = projetos.filter(
    (projeto) => projeto.grupoId === grupo.id && projeto.arquivadoEm === null && projeto.status === "ativo",
  ).length;
  return { ativos, acimaDoLimite: ativos > grupo.limiteAtivos };
}
