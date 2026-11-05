import { comTrava } from "@/plataforma/trava";

import { montarDadosIniciais } from "../iniciais";
import type { Colecoes } from "../tipos";
import { gravar, lerColecao, lerMeta, VERSAO_ESQUEMA } from "./armazenamento";

/**
 * Cria os dados iniciais uma única vez. A marca `dadosIniciaisEm` impede que itens arquivados ou
 * editados voltem, e a trava entre abas impede que duas abas criem os dados ao mesmo tempo.
 */
export function prepararPrimeiroUso(): Promise<{ criou: boolean }> {
  return comTrava("onpath-carga", () => {
    // Daqui até o gravar não há nenhum await: ler e gravar acontecem de uma vez.
    const meta = lerMeta();
    if (meta.dadosIniciaisEm !== null) return { criou: false };

    const agora = new Date().toISOString();
    const iniciais = montarDadosIniciais(agora);
    // Só as coleções vazias recebem os dados iniciais.
    const colecoes: Partial<Colecoes> = {};
    if (lerColecao("areas").length === 0) colecoes.areas = iniciais.areas;
    if (lerColecao("grupos").length === 0) colecoes.grupos = iniciais.grupos;
    if (lerColecao("projetos").length === 0) colecoes.projetos = iniciais.projetos;
    if (lerColecao("rotinas").length === 0) colecoes.rotinas = iniciais.rotinas;

    gravar({
      colecoes,
      meta: { ...meta, versaoEsquema: VERSAO_ESQUEMA, dadosIniciaisEm: agora },
    });
    return { criou: true };
  });
}
