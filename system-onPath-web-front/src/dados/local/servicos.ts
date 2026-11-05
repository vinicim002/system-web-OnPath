import type { Servicos } from "../contratos";
import { esquemas, type NomeColecao } from "../tipos";
import { criarServicoAreas } from "./areas";
import { criarServicoItensCaixa } from "./caixa";
import { criarServicoColunas } from "./colunas";
import { criarServicoGrupos } from "./grupos";
import { criarServicoMetas } from "./metas";
import { criarServicoItensDia } from "./itensDia";
import { prepararPrimeiroUso } from "./carga";
import { exportarCopia, importarCopia } from "./copia";
import { criarServicoColecao, type OpcoesColecao } from "./colecao";
import { criarServicoProjetos } from "./projetos";
import { criarServicoTarefas } from "./tarefas";

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
    projetos: criarServicoProjetos(),
    colunas: criarServicoColunas(),
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
