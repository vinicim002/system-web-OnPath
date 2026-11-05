import type { AreaNaVisao, GrupoNaVisao, ProjetoNaVisao, ServicoProjetos } from "../contratos";
import { criarErro } from "../erros";
import { vagasDoGrupo } from "../regrasGrupos";
import { podeMudar, semProximaAcao, tarefasAbertasDoProjeto } from "../regrasProjetos";
import {
  esquemas,
  type AlteracaoProjeto,
  type Grupo,
  type NovoProjeto,
  type Prioridade,
  type Projeto,
  type Tarefa,
} from "../tipos";
import { gravar, lerColecao } from "./armazenamento";
import { criarServicoColecao } from "./colecao";
import { chaveDeNome } from "./nomes";

type Objeto = Record<string, unknown>;

const PESO_PRIORIDADE: Record<Prioridade, number> = { alta: 0, media: 1, baixa: 2 };

/** RN01: o projeto fica sempre na área do seu grupo; o nome não tem espaços nas pontas. */
function completar(registro: Objeto): Objeto {
  const grupo = lerColecao("grupos").find((item) => item.id === registro.grupoId && item.arquivadoEm === null);
  if (!grupo) throw criarErro("dados_invalidos", { campos: ["grupoId"] });
  const nome = typeof registro.nome === "string" ? registro.nome.trim() : registro.nome;
  return { ...registro, nome, areaId: grupo.areaId };
}

function grupoAtivo(grupoId: string): Grupo {
  const grupo = lerColecao("grupos").find((item) => item.id === grupoId && item.arquivadoEm === null);
  if (!grupo) throw criarErro("dados_invalidos", { campos: ["grupoId"] });
  return grupo;
}

/** Serviço local de projetos (specs/006-projetos/contracts/servico-projetos.md). */
export function criarServicoProjetos(): ServicoProjetos {
  const { gravarVarios, gravarCampos, prepararVarios: _p, ...base } = criarServicoColecao<
    "projetos",
    NovoProjeto,
    AlteracaoProjeto
  >("projetos", esquemas.projetos.completo, { completar });

  function naoArquivados(): Projeto[] {
    return lerColecao("projetos").filter((projeto) => projeto.arquivadoEm === null);
  }

  /** Fim da fila do grupo (RN26). */
  function fimDaFila(grupoId: string, ignorar?: string): number {
    const posicoes = naoArquivados()
      .filter((p) => p.grupoId === grupoId && p.status === "fila" && p.id !== ignorar)
      .map((p) => p.posicaoFila);
    return posicoes.length === 0 ? 0 : Math.max(...posicoes) + 1;
  }

  function conferirNome(nome: unknown, grupoId: string, ignorar?: string) {
    if (typeof nome !== "string" || nome.trim() === "") throw criarErro("dados_invalidos", { campos: ["nome"] });
    const chave = chaveDeNome(nome);
    const repetido = naoArquivados().some(
      (p) => p.id !== ignorar && p.grupoId === grupoId && chaveDeNome(p.nome) === chave,
    );
    if (repetido) throw criarErro("nome_repetido", { campos: ["nome"] });
  }

  function conferirMeta(metaId: unknown, areaId: string) {
    if (metaId === null || metaId === undefined) return;
    const meta = lerColecao("metas").find((m) => m.id === metaId && m.arquivadoEm === null);
    if (!meta || meta.areaId !== areaId) throw criarErro("dados_invalidos", { campos: ["metaId"] });
  }

  /** Vaga no grupo (RN06 e RN07), sem contar o próprio projeto. */
  function conferirVaga(grupo: Grupo, projetoId: string) {
    const outros = naoArquivados().filter((p) => p.id !== projetoId);
    const { ativos } = vagasDoGrupo(grupo, outros);
    if (ativos < grupo.limiteAtivos) return;
    const ocupantes = outros
      .filter((p) => p.grupoId === grupo.id && p.status === "ativo")
      .map((p) => ({ id: p.id, nome: p.nome }));
    throw criarErro("grupo_cheio", { ocupantes, limite: grupo.limiteAtivos });
  }

  function naVisao(projeto: Projeto, tarefas: Tarefa[]): ProjetoNaVisao {
    return {
      ...projeto,
      tarefasAbertas: tarefasAbertasDoProjeto(projeto.id, tarefas).length,
      semProximaAcao: semProximaAcao(projeto, tarefas),
    };
  }

  return {
    ...base,

    async visaoGeral(filtros = {}) {
      const tarefas = lerColecao("tarefas");
      const projetos = naoArquivados();
      const areas = lerColecao("areas")
        .filter((a) => a.arquivadoEm === null && (!filtros.areaId || a.id === filtros.areaId))
        .sort((a, b) => a.ordem - b.ordem);
      const grupos = lerColecao("grupos").filter((g) => g.arquivadoEm === null);

      const resultado: AreaNaVisao[] = [];
      for (const area of areas) {
        const gruposDaArea: GrupoNaVisao[] = [];
        for (const grupo of grupos.filter((g) => g.areaId === area.id).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))) {
          const doGrupo = projetos
            .filter((p) => p.grupoId === grupo.id && (!filtros.status || p.status === filtros.status))
            .map((p) => naVisao(p, tarefas));
          if (filtros.status && doGrupo.length === 0) continue;
          gruposDaArea.push({
            ...grupo,
            ...vagasDoGrupo(grupo, projetos),
            projetosAtivos: doGrupo
              .filter((p) => p.status === "ativo")
              .sort((a, b) => PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade] || a.nome.localeCompare(b.nome, "pt-BR")),
            fila: doGrupo
              .filter((p) => p.status === "fila")
              .sort((a, b) => a.posicaoFila - b.posicaoFila || a.criadoEm.localeCompare(b.criadoEm)),
            pausados: doGrupo.filter((p) => p.status === "pausado").sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
            encerrados: doGrupo
              .filter((p) => p.status === "concluido" || p.status === "cancelado")
              .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm)),
          });
        }
        if (filtros.status && gruposDaArea.length === 0) continue;
        resultado.push({ area, grupos: gruposDaArea });
      }
      return resultado;
    },

    async criar(dados) {
      const grupo = grupoAtivo(dados.grupoId);
      conferirNome(dados.nome, grupo.id);
      conferirMeta(dados.metaId, grupo.areaId);
      return base.criar({ ...dados, status: "fila", posicaoFila: fimDaFila(grupo.id) });
    },

    async alterar(id, dados) {
      const atual = await base.obter(id);
      const { status: _s, posicaoFila: _f, ...permitidos } = dados as Objeto;
      const grupoId = (permitidos.grupoId as string | undefined) ?? atual.grupoId;
      const grupo = grupoAtivo(grupoId);
      const mudouDeGrupo = grupoId !== atual.grupoId;
      conferirNome(permitidos.nome ?? atual.nome, grupoId, id);

      const campos: Objeto = { ...permitidos };
      if (mudouDeGrupo) {
        if (atual.status === "ativo") conferirVaga(grupo, id);
        if (atual.status === "fila") campos.posicaoFila = fimDaFila(grupoId, id);
        // A meta antiga é de outra área: é desligada, a não ser que outra tenha sido escolhida.
        if (!("metaId" in permitidos) && grupo.areaId !== atual.areaId) campos.metaId = null;
      }
      conferirMeta("metaId" in campos ? campos.metaId : atual.metaId, grupo.areaId);

      if (!mudouDeGrupo || grupo.areaId === atual.areaId) {
        const [alterado] = await gravarVarios([{ id, campos }]);
        return alterado!;
      }

      // A área nova vale para o projeto e para todas as tarefas dele, na mesma escrita (RN01).
      const agora = new Date().toISOString();
      const projetos = lerColecao("projetos").map((p) =>
        p.id === id
          ? (esquemas.projetos.completo.parse(completar({ ...p, ...campos, grupoId, atualizadoEm: agora })) as Projeto)
          : p,
      );
      const tarefas = lerColecao("tarefas").map((t) =>
        t.projetoId === id ? { ...t, areaId: grupo.areaId, atualizadoEm: agora } : t,
      );
      gravar({ colecoes: { projetos, tarefas } });
      return projetos.find((p) => p.id === id)!;
    },

    async mudarStatus(id, status) {
      const atual = await base.obter(id);
      if (atual.status === status) return atual;
      if (!podeMudar(atual.status, status)) {
        throw criarErro("transicao_invalida", { de: atual.status, para: status });
      }
      if (status === "ativo") {
        conferirVaga(grupoAtivo(atual.grupoId), id);
        if (tarefasAbertasDoProjeto(id, lerColecao("tarefas")).length === 0) throw criarErro("sem_proxima_acao");
      }
      const campos: Objeto = { status };
      if (status === "fila") campos.posicaoFila = fimDaFila(atual.grupoId, id);
      return gravarCampos(id, campos);
    },

    async reordenarFila(grupoId, ids) {
      const fila = new Set(naoArquivados().filter((p) => p.grupoId === grupoId && p.status === "fila").map((p) => p.id));
      if (ids.length !== fila.size || ids.some((id) => !fila.has(id))) {
        throw criarErro("dados_invalidos", { campos: ["ids"] });
      }
      await gravarVarios(ids.map((id, posicaoFila) => ({ id, campos: { posicaoFila } })));
    },

    async semProximaAcao(id) {
      return semProximaAcao(await base.obter(id), lerColecao("tarefas"));
    },
  };
}
