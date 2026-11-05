import type { ServicoGrupos } from "../contratos";
import { criarErro } from "../erros";
import { vagasDoGrupo } from "../regrasGrupos";
import { esquemas, type AlteracaoGrupo, type NovoGrupo } from "../tipos";
import { lerColecao } from "./armazenamento";
import { criarServicoColecao } from "./colecao";
import { chaveDeNome } from "./nomes";

/** Serviço local de grupos (specs/005-areas-metas-grupos/contracts/servicos.md). */
export function criarServicoGrupos(): ServicoGrupos {
  const { gravarVarios: _v, gravarCampos: _g, prepararVarios: _p, ...base } = criarServicoColecao<
    "grupos",
    NovoGrupo,
    AlteracaoGrupo
  >("grupos", esquemas.grupos.completo, {
    completar: (registro) => {
      const nome = typeof registro.nome === "string" ? registro.nome.trim() : registro.nome;
      const area = lerColecao("areas").find((a) => a.id === registro.areaId && a.arquivadoEm === null);
      if (registro.areaId !== undefined && !area) throw criarErro("dados_invalidos", { campos: ["areaId"] });
      if (typeof nome === "string" && nome !== "") {
        const chave = chaveDeNome(nome);
        const repetido = lerColecao("grupos").some(
          (g) =>
            g.id !== registro.id &&
            g.arquivadoEm === null &&
            g.areaId === registro.areaId &&
            chaveDeNome(g.nome) === chave,
        );
        if (repetido) throw criarErro("nome_repetido", { campos: ["nome"] });
      }
      return { ...registro, nome };
    },
  });

  return {
    ...base,

    async listarDaArea(areaId) {
      const projetos = lerColecao("projetos");
      return (await base.listar())
        .filter((grupo) => grupo.areaId === areaId)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        .map((grupo) => ({ ...grupo, ...vagasDoGrupo(grupo, projetos) }));
    },

    async excluir(id) {
      await base.obter(id);
      const projetos = lerColecao("projetos").filter((p) => p.grupoId === id && p.arquivadoEm === null).length;
      if (projetos > 0) throw criarErro("grupo_com_projetos", { projetos });
      await base.excluir(id);
    },
  };
}
