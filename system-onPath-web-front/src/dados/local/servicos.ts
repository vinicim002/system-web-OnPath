import type { Servicos } from "../contratos";
import { criarErro } from "../erros";
import { esquemas, type NomeColecao } from "../tipos";
import { lerColecao } from "./armazenamento";
import { criarServicoAreas } from "./areas";
import { criarServicoItensCaixa } from "./caixa";
import { criarServicoGrupos } from "./grupos";
import { criarServicoMetas } from "./metas";
import { criarServicoItensDia } from "./itensDia";
import { prepararPrimeiroUso } from "./carga";
import { exportarCopia, importarCopia } from "./copia";
import { criarServicoColecao, type OpcoesColecao } from "./colecao";
import { criarServicoTarefas } from "./tarefas";

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

export function criarServicosLocais(): Servicos {
  return {
    areas: criarServicoAreas(),
    metas: criarServicoMetas(),
    grupos: criarServicoGrupos(),
    projetos: colecao("projetos", { completar: areaDoGrupo }),
    colunas: colecao("colunas"),
    tarefas: criarServicoTarefas(),
    itensCaixa: criarServicoItensCaixa(),
    itensDia: criarServicoItensDia(),
    rotinas: colecao("rotinas"),
    compromissos: colecao("compromissos"),
    blocosTempo: colecao("blocosTempo"),
    materias: colecao("materias"),
    topicos: colecao("topicos"),
    materiais: colecao("materiais"),
    sessoesEstudo: colecao("sessoesEstudo"),
    dados: {
      prepararPrimeiroUso,
      exportar: exportarCopia,
      importar: importarCopia,
    },
  };
}
