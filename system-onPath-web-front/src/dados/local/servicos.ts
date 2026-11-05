import type { Servicos } from "../contratos";
import { criarErro } from "../erros";
import { esquemas, type NomeColecao } from "../tipos";
import { lerColecao } from "./armazenamento";
import { prepararPrimeiroUso } from "./carga";
import { criarServicoColecao, type OpcoesColecao } from "./colecao";

/** RN01: o projeto fica sempre na área do seu grupo. */
function areaDoGrupo(registro: Record<string, unknown>): Record<string, unknown> {
  const grupo = lerColecao("grupos").find((item) => item.id === registro.grupoId);
  if (!grupo) throw criarErro("dados_invalidos", { campos: ["grupoId"] });
  return { ...registro, areaId: grupo.areaId };
}

function colecao<N extends NomeColecao, Novo extends object, Alteracao extends object>(
  nome: N,
  opcoes?: OpcoesColecao,
) {
  return criarServicoColecao<N, Novo, Alteracao>(nome, esquemas[nome].completo, opcoes);
}

/** Só existe durante o desenvolvimento, até a etapa da cópia. */
function naoImplementado(): never {
  throw new Error("não implementado");
}

export function criarServicosLocais(): Servicos {
  return {
    areas: colecao("areas"),
    metas: colecao("metas"),
    grupos: colecao("grupos"),
    projetos: colecao("projetos", { completar: areaDoGrupo }),
    colunas: colecao("colunas"),
    tarefas: colecao("tarefas"),
    itensCaixa: colecao("itensCaixa"),
    itensDia: colecao("itensDia"),
    rotinas: colecao("rotinas"),
    compromissos: colecao("compromissos"),
    blocosTempo: colecao("blocosTempo"),
    materias: colecao("materias"),
    topicos: colecao("topicos"),
    materiais: colecao("materiais"),
    sessoesEstudo: colecao("sessoesEstudo"),
    dados: {
      prepararPrimeiroUso,
      exportar: async () => naoImplementado(),
      importar: async () => naoImplementado(),
    },
  };
}
