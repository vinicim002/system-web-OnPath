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


describe("metas (T013)", () => {
  it("recusa título vazio e área arquivada; grava título sem espaços", async () => {
    const s = criarServicosLocais();
    const area = await s.areas.criar({ nome: "Faculdade", cor: TOM });
    const outra = await s.areas.criar({ nome: "Outra", cor: TOM });
    expect((await capturarErro(s.metas.criar({ areaId: area.id, titulo: "  ", status: "ativa" }))).detalhes.campos).toEqual([
      "titulo",
    ]);
    const meta = await s.metas.criar({ areaId: area.id, titulo: " Entregar o TCC ", descricao: " ", status: "ativa" });
    expect(meta).toMatchObject({ titulo: "Entregar o TCC", descricao: null, prazo: null });

    await s.areas.excluir(outra.id);
    expect((await capturarErro(s.metas.criar({ areaId: outra.id, titulo: "X", status: "ativa" }))).detalhes.campos).toEqual([
      "areaId",
    ]);
  });

  it("lista ativas primeiro, por prazo e criação, com atraso", async () => {
    const s = criarServicosLocais();
    const area = await s.areas.criar({ nome: "Faculdade", cor: TOM });
    const criar = async (titulo: string, status: "ativa" | "concluida" | "cancelada", prazo: string | null) => {
      passarUmMinuto();
      return s.metas.criar({ areaId: area.id, titulo, status, prazo });
    };
    await criar("sem prazo", "ativa", null);
    await criar("concluída", "concluida", "2026-11-01");
    await criar("prazo longe", "ativa", "2026-12-20");
    await criar("atrasada", "ativa", "2026-11-04");
    const excluida = await criar("excluída", "ativa", null);
    await s.metas.excluir(excluida.id);

    const metas = await s.metas.listarDaArea(area.id, HOJE);
    expect(metas.map((m) => [m.titulo, m.atrasada])).toEqual([
      ["atrasada", true],
      ["prazo longe", false],
      ["sem prazo", false],
      ["concluída", false],
    ]);
  });
});

describe("grupos (T014)", () => {
  async function comArea() {
    const s = criarServicosLocais();
    const trabalho = await s.areas.criar({ nome: "Trabalho", cor: TOM });
    const pessoal = await s.areas.criar({ nome: "Pessoal", cor: TOM });
    return { s, trabalho: trabalho.id, pessoal: pessoal.id };
  }

  it("recusa nome vazio, limite inválido e área arquivada", async () => {
    const { s, trabalho, pessoal } = await comArea();
    expect((await capturarErro(s.grupos.criar({ areaId: trabalho, nome: " ", limiteAtivos: 1 }))).detalhes.campos).toEqual(["nome"]);
    for (const limiteAtivos of [-1, 1.5]) {
      const erro = await capturarErro(s.grupos.criar({ areaId: trabalho, nome: "X", limiteAtivos }));
      expect(erro.detalhes.campos).toEqual(["limiteAtivos"]);
    }
    await s.areas.excluir(pessoal);
    expect((await capturarErro(s.grupos.criar({ areaId: pessoal, nome: "X", limiteAtivos: 1 }))).detalhes.campos).toEqual([
      "areaId",
    ]);
  });

  it("nome único na área, mas pode repetir em outra", async () => {
    const { s, trabalho, pessoal } = await comArea();
    const clientes = await s.grupos.criar({ areaId: trabalho, nome: " Clientes ", limiteAtivos: 1 });
    expect(clientes.nome).toBe("Clientes");
    expect((await capturarErro(s.grupos.criar({ areaId: trabalho, nome: "clientes", limiteAtivos: 1 }))).codigo).toBe(
      "nome_repetido",
    );
    expect((await s.grupos.criar({ areaId: pessoal, nome: "Clientes", limiteAtivos: 1 })).areaId).toBe(pessoal);
    const outro = await s.grupos.criar({ areaId: trabalho, nome: "Outro", limiteAtivos: 1 });
    expect((await capturarErro(s.grupos.alterar(outro.id, { nome: "CLIENTES" }))).codigo).toBe("nome_repetido");
  });

  it("mostra as vagas e aceita limite abaixo dos ativos sem mexer nos projetos", async () => {
    const { s, trabalho } = await comArea();
    const grupo = await s.grupos.criar({ areaId: trabalho, nome: "Clientes", limiteAtivos: 2 });
    await s.grupos.criar({ areaId: trabalho, nome: "Agência", limiteAtivos: 1 });
    const projeto = (nome: string, status: "ativo" | "fila" | "pausado") =>
      s.projetos.criar({ grupoId: grupo.id, nome, prioridade: "media", status, posicaoFila: 0 });
    await projeto("A", "ativo");
    await projeto("B", "ativo");
    await projeto("C", "fila");
    const arquivado = await projeto("D", "ativo");
    await s.projetos.excluir(arquivado.id);

    let grupos = await s.grupos.listarDaArea(trabalho);
    expect(grupos.map((g) => [g.nome, g.ativos, g.limiteAtivos, g.acimaDoLimite])).toEqual([
      ["Agência", 0, 1, false],
      ["Clientes", 2, 2, false],
    ]);

    await s.grupos.alterar(grupo.id, { limiteAtivos: 1 });
    grupos = await s.grupos.listarDaArea(trabalho);
    expect(grupos[1]).toMatchObject({ ativos: 2, limiteAtivos: 1, acimaDoLimite: true });
    expect((await s.projetos.listar()).filter((p) => p.status === "ativo")).toHaveLength(2);
  });

  it("arquivar só sem projetos", async () => {
    const { s, trabalho } = await comArea();
    const cheio = await s.grupos.criar({ areaId: trabalho, nome: "Cheio", limiteAtivos: 1 });
    const vazio = await s.grupos.criar({ areaId: trabalho, nome: "Vazio", limiteAtivos: 1 });
    await s.projetos.criar({ grupoId: cheio.id, nome: "P", prioridade: "media", status: "fila", posicaoFila: 0 });

    const erro = await capturarErro(s.grupos.excluir(cheio.id));
    expect(erro.codigo).toBe("grupo_com_projetos");
    expect(erro.detalhes.projetos).toBe(1);

    await s.grupos.excluir(vazio.id);
    expect((await s.grupos.listarDaArea(trabalho)).map((g) => g.nome)).toEqual(["Cheio"]);
  });
});
