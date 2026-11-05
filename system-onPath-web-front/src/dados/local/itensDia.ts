import { gerarId } from "@/plataforma/id";

import type { Destino, ItemDoPlano, Pendencia, ServicoItensDia } from "../contratos";
import { criarErro } from "../erros";
import { tarefaDoTopo } from "../regrasTarefas";
import {
  esquemas,
  type AlteracaoItemDia,
  type ItemDia,
  type NovoItemDia,
  type Tarefa,
} from "../tipos";
import { gravar, lerColecao } from "./armazenamento";
import { criarServicoColecao } from "./colecao";

const DATA = /^\d{4}-\d{2}-\d{2}$/;

function validarData(data: string, campo = "data"): void {
  if (!DATA.test(data)) throw criarErro("dados_invalidos", { campos: [campo] });
}

function porOrdem(a: ItemDia, b: ItemDia): number {
  return a.ordem - b.ordem || a.criadoEm.localeCompare(b.criadoEm);
}

/** Item ativo e ainda pendente: o que conta no plano de uma data (data-model.md, regra 1). */
function emAberto(item: ItemDia): boolean {
  return item.arquivadoEm === null && item.resultado === "pendente";
}

function novoItem(tarefaId: string, data: string, ordem: number): ItemDia {
  const agora = new Date().toISOString();
  return esquemas.itensDia.completo.parse({
    id: gerarId(),
    criadoEm: agora,
    atualizadoEm: agora,
    arquivadoEm: null,
    tarefaId,
    data,
    ordem,
    resultado: "pendente",
  }) as ItemDia;
}

/** Serviço local de itens do dia (specs/004-hoje/contracts/servico-itens-dia.md). */
export function criarServicoItensDia(): ServicoItensDia {
  const { prepararVarios, gravarVarios, gravarCampos: _g, ...base } = criarServicoColecao<
    "itensDia",
    NovoItemDia,
    AlteracaoItemDia
  >("itensDia", esquemas.itensDia.completo);

  function mapaTarefas(): Map<string, Tarefa> {
    return new Map(lerColecao("tarefas").map((tarefa) => [tarefa.id, tarefa]));
  }

  function tituloPrincipal(tarefa: Tarefa, tarefas: Map<string, Tarefa>): string | null {
    return tarefa.tarefaPaiId ? tarefaDoTopo(tarefa, tarefas).titulo : null;
  }

  /** Tarefa que pode aparecer num plano: ativa e não cancelada. */
  function visivel(tarefa: Tarefa | undefined): tarefa is Tarefa {
    return tarefa !== undefined && tarefa.arquivadoEm === null && tarefa.status !== "cancelada";
  }

  function itensEmAberto(data: string): ItemDia[] {
    return lerColecao("itensDia")
      .filter((item) => item.data === data && emAberto(item))
      .sort(porOrdem);
  }

  function proximaOrdem(data: string, extras: ItemDia[] = []): number {
    const ordens = [...itensEmAberto(data), ...extras.filter((i) => i.data === data)].map((i) => i.ordem);
    return ordens.length === 0 ? 0 : Math.max(...ordens) + 1;
  }

  /** Itens de dias anteriores a `hoje`, ainda pendentes, de tarefas ativas e abertas. */
  function itensPendentes(hoje: string, tarefas: Map<string, Tarefa>): ItemDia[] {
    return lerColecao("itensDia").filter((item) => {
      if (item.data >= hoje || !emAberto(item)) return false;
      const tarefa = tarefas.get(item.tarefaId);
      return tarefa !== undefined && tarefa.arquivadoEm === null && tarefa.status === "aberta";
    });
  }

  function pendencias(hoje: string): Pendencia[] {
    const tarefas = mapaTarefas();
    const maisRecente = new Map<string, ItemDia>();
    for (const item of itensPendentes(hoje, tarefas)) {
      const atual = maisRecente.get(item.tarefaId);
      if (!atual || item.data > atual.data) maisRecente.set(item.tarefaId, item);
    }
    return [...maisRecente.values()]
      .sort((a, b) => a.data.localeCompare(b.data) || porOrdem(a, b))
      .map((item) => {
        const tarefa = tarefas.get(item.tarefaId)!;
        return { tarefa, tituloPrincipal: tituloPrincipal(tarefa, tarefas), data: item.data };
      });
  }

  /**
   * Mudanças para dar destino às pendências de várias tarefas, sem gravar: os itens antigos
   * recebem o resultado, e, ao remarcar, entra um item novo na data de destino.
   */
  function prepararDestinos(tarefaIds: string[], destino: Destino, hoje: string) {
    const tarefas = mapaTarefas();
    const pendentes = itensPendentes(hoje, tarefas);
    const resultado =
      destino.tipo === "remarcar" ? "remarcada" : destino.tipo === "devolver" ? "devolvida" : "cancelada";

    const mudancas: { id: string; campos: Record<string, unknown> }[] = [];
    const novos: ItemDia[] = [];
    for (const tarefaId of tarefaIds) {
      const antigos = pendentes.filter((item) => item.tarefaId === tarefaId);
      if (antigos.length === 0) throw criarErro("nao_e_pendencia", { tarefaId });
      for (const item of antigos) mudancas.push({ id: item.id, campos: { resultado } });
      if (destino.tipo === "remarcar") {
        const jaEsta =
          itensEmAberto(destino.data).some((item) => item.tarefaId === tarefaId) ||
          novos.some((item) => item.tarefaId === tarefaId);
        if (!jaEsta) novos.push(novoItem(tarefaId, destino.data, proximaOrdem(destino.data, novos)));
      }
    }
    const { registros } = prepararVarios(mudancas);
    return { itensDia: [...registros, ...novos], tarefas };
  }

  return {
    ...base,

    async planoDoDia(data) {
      validarData(data);
      const tarefas = mapaTarefas();
      const itens: ItemDoPlano[] = [];
      for (const item of itensEmAberto(data)) {
        const tarefa = tarefas.get(item.tarefaId);
        if (!visivel(tarefa)) continue;
        itens.push({ item, tarefa, tituloPrincipal: tituloPrincipal(tarefa, tarefas) });
      }
      const proxima = itens.find((linha) => linha.tarefa.status === "aberta");
      const tempo = (linhas: ItemDoPlano[]) =>
        linhas.reduce((total, linha) => total + (linha.tarefa.tempoEstimadoMin ?? 0), 0);
      return {
        data,
        itens,
        proximaId: proxima?.item.id ?? null,
        planejadoMin: tempo(itens),
        feitoMin: tempo(itens.filter((linha) => linha.tarefa.status === "concluida")),
      };
    },

    async adicionar(data, tarefaIds) {
      validarData(data);
      const tarefas = mapaTarefas();
      const noDia = new Set(itensEmAberto(data).map((item) => item.tarefaId));
      const novos: ItemDia[] = [];
      let ordem = proximaOrdem(data);
      for (const tarefaId of new Set(tarefaIds)) {
        const tarefa = tarefas.get(tarefaId);
        if (!tarefa || tarefa.arquivadoEm !== null || tarefa.status !== "aberta") {
          throw criarErro("dados_invalidos", { campos: ["tarefaId"] });
        }
        if (noDia.has(tarefaId)) continue;
        novos.push(novoItem(tarefaId, data, ordem++));
      }
      if (novos.length > 0) gravar({ colecoes: { itensDia: [...lerColecao("itensDia"), ...novos] } });
      return novos;
    },

    async reordenar(data, itemIds) {
      validarData(data);
      const tarefas = mapaTarefas();
      const emAbertoNoDia = itensEmAberto(data);
      const visiveis = emAbertoNoDia.filter((item) => visivel(tarefas.get(item.tarefaId)));
      const esperados = new Set(visiveis.map((item) => item.id));
      if (itemIds.length !== esperados.size || itemIds.some((id) => !esperados.has(id))) {
        throw criarErro("dados_invalidos", { campos: ["itemIds"] });
      }
      // Os itens escondidos (tarefa cancelada) vão para o fim, mantendo a ordem entre eles.
      const escondidos = emAbertoNoDia.filter((item) => !esperados.has(item.id)).map((item) => item.id);
      await gravarVarios([...itemIds, ...escondidos].map((id, ordem) => ({ id, campos: { ordem } })));
    },

    async listarPendencias(hoje) {
      validarData(hoje, "hoje");
      return pendencias(hoje);
    },

    async decidirPendencia(tarefaId, destino, hoje) {
      validarData(hoje, "hoje");
      if (destino.tipo === "remarcar") {
        validarData(destino.data);
        if (destino.data < hoje) throw criarErro("data_passada");
      }
      const { itensDia, tarefas } = prepararDestinos([tarefaId], destino, hoje);
      if (destino.tipo !== "cancelar") {
        gravar({ colecoes: { itensDia } });
        return;
      }
      // Cancelar a pendência cancela a tarefa (RN11), na mesma escrita.
      const agora = new Date().toISOString();
      const listaTarefas = [...tarefas.values()].map((tarefa) =>
        tarefa.id === tarefaId
          ? (esquemas.tarefas.completo.parse({
              ...tarefa,
              status: "cancelada",
              concluidaEm: null,
              atualizadoEm: agora,
            }) as Tarefa)
          : tarefa,
      );
      gravar({ colecoes: { itensDia, tarefas: listaTarefas } });
    },

    async remarcarTodasPara(hoje) {
      validarData(hoje, "hoje");
      const ids = pendencias(hoje).map((pendencia) => pendencia.tarefa.id);
      if (ids.length === 0) return;
      const { itensDia } = prepararDestinos(ids, { tipo: "remarcar", data: hoje }, hoje);
      gravar({ colecoes: { itensDia } });
    },
  };
}
