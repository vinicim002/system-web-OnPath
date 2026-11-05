import type { z } from "zod";

import { gerarId } from "@/plataforma/id";

import type { ServicoColecao } from "../contratos";
import { criarErro } from "../erros";
import { CAMPOS_COMUNS, type NomeColecao, type Registros } from "../tipos";
import { gravar, lerColecao } from "./armazenamento";

type Objeto = Record<string, unknown>;

export interface OpcoesColecao {
  /**
   * Ajusta o registro já mesclado antes da validação. Usado para campos derivados, como o
   * `areaId` dos projetos, que vem do grupo (RN01).
   */
  completar?: (registro: Objeto) => Objeto;
}

function semCamposComuns(dados: object): Objeto {
  const copia: Objeto = { ...dados };
  for (const campo of CAMPOS_COMUNS) delete copia[campo];
  return copia;
}

/** Converte o erro do Zod em `dados_invalidos`, só com os nomes dos campos. */
function validar<R>(esquema: z.ZodType, registro: Objeto): R {
  const resultado = esquema.safeParse(registro);
  if (resultado.success) return resultado.data as R;
  const campos = [
    ...new Set(resultado.error.issues.map((problema) => problema.path.join(".") || "(registro)")),
  ];
  throw criarErro("dados_invalidos", { campos });
}

export function criarServicoColecao<N extends NomeColecao, Novo extends object, Alteracao extends object>(
  nome: N,
  esquema: z.ZodType,
  opcoes: OpcoesColecao = {},
): ServicoColecao<Registros[N], Novo, Alteracao> {
  type Registro = Registros[N];
  const completar = opcoes.completar ?? ((registro: Objeto) => registro);

  function buscar(registros: Registro[], id: string): number {
    const indice = registros.findIndex((registro) => registro.id === id);
    if (indice === -1) throw criarErro("nao_encontrado", { colecao: nome, id });
    return indice;
  }

  function substituir(id: string, mudar: (atual: Registro, agora: string) => Objeto): Registro {
    const registros = lerColecao(nome);
    const indice = buscar(registros, id);
    const agora = new Date().toISOString();
    const novo = validar<Registro>(esquema, mudar(registros[indice], agora));
    const atualizados = [...registros];
    atualizados[indice] = novo;
    gravar({ colecoes: { [nome]: atualizados } });
    return novo;
  }

  return {
    async listar(opcoesListar = {}) {
      const registros = lerColecao(nome);
      return opcoesListar.incluirArquivados
        ? registros
        : registros.filter((registro) => registro.arquivadoEm === null);
    },

    async obter(id) {
      const registros = lerColecao(nome);
      return registros[buscar(registros, id)];
    },

    async criar(dados) {
      const agora = new Date().toISOString();
      const registro = validar<Registro>(
        esquema,
        completar({
          ...semCamposComuns(dados),
          id: gerarId(),
          criadoEm: agora,
          atualizadoEm: agora,
          arquivadoEm: null,
        }),
      );
      gravar({ colecoes: { [nome]: [...lerColecao(nome), registro] } });
      return registro;
    },

    async alterar(id, dados) {
      return substituir(id, (atual, agora) =>
        completar({ ...atual, ...semCamposComuns(dados), atualizadoEm: agora }),
      );
    },

    async excluir(id) {
      substituir(id, (atual, agora) => ({ ...atual, arquivadoEm: agora, atualizadoEm: agora }));
    },

    async recuperar(id) {
      return substituir(id, (atual, agora) => ({ ...atual, arquivadoEm: null, atualizadoEm: agora }));
    },
  };
}
