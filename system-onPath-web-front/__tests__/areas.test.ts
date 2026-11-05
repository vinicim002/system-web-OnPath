import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErroOnPath } from "@/dados/erros";
import { limparTudo } from "@/dados/local/armazenamento";
import { criarServicosLocais } from "@/dados/local/servicos";
import { TONS_AREA } from "@/theme";

async function capturarErro(promessa: Promise<unknown>): Promise<ErroOnPath> {
  try {
    await promessa;
  } catch (erro) {
    if (erro instanceof ErroOnPath) return erro;
    throw erro;
  }
  throw new Error("era esperado um ErroOnPath");
}

const TOM = TONS_AREA[0]!;
const OUTRO_TOM = TONS_AREA[3]!;
const HOJE = "2026-11-05";

let instante = Date.parse("2026-11-05T12:00:00.000Z");
function passarUmMinuto() {
  instante += 60_000;
  vi.setSystemTime(instante);
}

beforeEach(() => {
  limparTudo();
  vi.useFakeTimers({ toFake: ["Date"] });
  passarUmMinuto();
});

afterEach(() => vi.useRealTimers());

describe("áreas (T013)", () => {
  it("cria no fim, sem espaços nas pontas", async () => {
    const { areas } = criarServicosLocais();
    const a = await areas.criar({ nome: "  Trabalho ", cor: TOM });
    const b = await areas.criar({ nome: "Pessoal", cor: OUTRO_TOM });
    expect(a).toMatchObject({ nome: "Trabalho", ordem: 0 });
    expect(b.ordem).toBe(1);
  });

  it("recusa nome vazio, tom fora do tema e nome repetido", async () => {
    const { areas } = criarServicosLocais();
    expect((await capturarErro(areas.criar({ nome: " ", cor: TOM }))).detalhes.campos).toEqual(["nome"]);
    expect((await capturarErro(areas.criar({ nome: "X", cor: "#FF0000" }))).detalhes.campos).toEqual(["cor"]);

    const familia = await areas.criar({ nome: "Família", cor: TOM });
    const erro = await capturarErro(areas.criar({ nome: " familia ", cor: TOM }));
    expect(erro.codigo).toBe("nome_repetido");
    expect(erro.detalhes.campos).toEqual(["nome"]);

    const outra = await areas.criar({ nome: "Outra", cor: TOM });
    expect((await capturarErro(areas.alterar(outra.id, { nome: "FAMÍLIA" }))).codigo).toBe("nome_repetido");
    expect((await areas.alterar(familia.id, { nome: "Família", cor: OUTRO_TOM })).cor).toBe(OUTRO_TOM);

    await areas.excluir(familia.id);
    expect((await areas.criar({ nome: "Família", cor: TOM })).nome).toBe("Família");
  });

  it("resume as áreas ativas na ordem, com as contagens", async () => {
    const s = criarServicosLocais();
    const trabalho = await s.areas.criar({ nome: "Trabalho", cor: TOM });
    const vazia = await s.areas.criar({ nome: "Vazia", cor: TOM });
    await s.metas.criar({ areaId: trabalho.id, titulo: "Meta", status: "ativa" });
    await s.metas.criar({ areaId: trabalho.id, titulo: "Feita", status: "concluida" });
    const grupo = await s.grupos.criar({ areaId: trabalho.id, nome: "Clientes", limiteAtivos: 1 });
    await s.projetos.criar({ grupoId: grupo.id, nome: "Site", prioridade: "alta", status: "ativo", posicaoFila: 0 });
    const tarefa = await s.tarefas.criar({
      titulo: "T",
      areaId: trabalho.id,
      prioridade: "media",
      tempoEstimadoMin: 10,
      status: "aberta",
    });
    await s.tarefas.criar({ titulo: "T2", areaId: trabalho.id, prioridade: "media", tempoEstimadoMin: 10, status: "aberta" });
    await s.tarefas.concluir(tarefa.id);
    await s.materias.criar({ areaId: trabalho.id, nome: "Cálculo", status: "ativa" });

    const resumo = await s.areas.listarComResumo();
    expect(resumo.map((a) => a.nome)).toEqual(["Trabalho", "Vazia"]);
    expect(resumo[0]!.contagem).toEqual({ metasAtivas: 1, grupos: 1, projetos: 1, tarefasAbertas: 1, materias: 1 });
    expect(resumo[1]!.id).toBe(vazia.id);
    expect(resumo[1]!.contagem).toEqual({ metasAtivas: 0, grupos: 0, projetos: 0, tarefasAbertas: 0, materias: 0 });
  });

  it("reordena e recusa lista incompleta", async () => {
    const { areas } = criarServicosLocais();
    const a = await areas.criar({ nome: "A", cor: TOM });
    const b = await areas.criar({ nome: "B", cor: TOM });
    const c = await areas.criar({ nome: "C", cor: TOM });
    await areas.reordenar([c.id, a.id, b.id]);
    expect((await areas.listarComResumo()).map((x) => [x.nome, x.ordem])).toEqual([
      ["C", 0],
      ["A", 1],
      ["B", 2],
    ]);
    expect((await capturarErro(areas.reordenar([a.id, b.id]))).codigo).toBe("dados_invalidos");
  });

  it("arquivar pede confirmação com itens e nunca arquiva a última área", async () => {
    const s = criarServicosLocais();
    const trabalho = await s.areas.criar({ nome: "Trabalho", cor: TOM });
    const vazia = await s.areas.criar({ nome: "Vazia", cor: TOM });
    await s.metas.criar({ areaId: trabalho.id, titulo: "Meta", status: "ativa" });

    const erro = await capturarErro(s.areas.excluir(trabalho.id));
    expect(erro.codigo).toBe("area_com_itens");
    expect(erro.detalhes.contagem).toMatchObject({ metasAtivas: 1 });
    expect(await s.areas.listar()).toHaveLength(2);

    await s.areas.excluir(trabalho.id, { confirmado: true });
    expect((await s.areas.listar()).map((a) => a.id)).toEqual([vazia.id]);

    expect((await capturarErro(s.areas.excluir(vazia.id, { confirmado: true }))).codigo).toBe("ultima_area");
  });

  it("recupera no fim da ordem e lista as arquivadas", async () => {
    const { areas } = criarServicosLocais();
    const a = await areas.criar({ nome: "A", cor: TOM });
    await areas.criar({ nome: "B", cor: TOM });
    await areas.criar({ nome: "C", cor: TOM });
    await areas.excluir(a.id);
    expect((await areas.listarArquivadas()).map((x) => x.nome)).toEqual(["A"]);

    const recuperada = await areas.recuperar(a.id);
    expect(recuperada.arquivadoEm).toBeNull();
    expect((await areas.listarComResumo()).map((x) => x.nome)).toEqual(["B", "C", "A"]);
    expect(await areas.listarArquivadas()).toEqual([]);
  });
});

export { HOJE };
