import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Servicos } from "@/dados/contratos";
import { ErroOnPath } from "@/dados/erros";
import { limparTudo } from "@/dados/local/armazenamento";
import { criarServicosLocais } from "@/dados/local/servicos";
import type { NovaTarefa } from "@/dados/tipos";
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

async function preparar() {
  const s: Servicos = criarServicosLocais();
  const area = (await s.areas.criar({ nome: "Trabalho", cor: TONS_AREA[0]! })).id;
  const grupo = (await s.grupos.criar({ areaId: area, nome: "Clientes", limiteAtivos: 3 })).id;
  const projeto = (await s.projetos.criar({ grupoId: grupo, nome: "Site", prioridade: "media" })).id;
  const outroProjeto = (await s.projetos.criar({ grupoId: grupo, nome: "App", prioridade: "media" })).id;
  const tarefa = async (titulo: string, campos: Partial<NovaTarefa> = {}) => {
    passarUmMinuto();
    return s.tarefas.criar({ titulo, areaId: area, projetoId: projeto, prioridade: "media", tempoEstimadoMin: 30, status: "aberta", ...campos });
  };
  const coluna = async (nome: string, id = projeto) => {
    passarUmMinuto();
    return s.colunas.criar({ projetoId: id, nome });
  };
  return { s, area, projeto, outroProjeto, tarefa, coluna };
}

describe("colunas (RN22)", () => {
  it("projeto novo não tem colunas; criar põe no fim, não final", async () => {
    const c = await preparar();
    expect(await c.s.colunas.listarDoProjeto(c.projeto)).toEqual([]);
    const a = await c.coluna(" A fazer ");
    const b = await c.coluna("Feito");
    expect(a).toMatchObject({ nome: "A fazer", ordem: 0, final: false });
    expect(b.ordem).toBe(1);
  });

  it("recusa nome vazio ou repetido no projeto, mas aceita em outro projeto", async () => {
    const c = await preparar();
    await c.coluna("Feito");
    expect((await capturarErro(c.coluna(" "))).detalhes.campos).toEqual(["nome"]);
    expect((await capturarErro(c.coluna("feito"))).codigo).toBe("nome_repetido");
    expect((await c.coluna("Feito", c.outroProjeto)).nome).toBe("Feito");
  });

  it("reordena e mantém uma só coluna final", async () => {
    const c = await preparar();
    const a = await c.coluna("A");
    const b = await c.coluna("B");
    const d = await c.coluna("D");
    await c.s.colunas.reordenar(c.projeto, [d.id, a.id, b.id]);
    expect((await c.s.colunas.listarDoProjeto(c.projeto)).map((x) => x.nome)).toEqual(["D", "A", "B"]);
    await c.s.colunas.marcarFinal(a.id, true);
    await c.s.colunas.marcarFinal(b.id, true);
    expect((await c.s.colunas.listarDoProjeto(c.projeto)).filter((x) => x.final).map((x) => x.nome)).toEqual(["B"]);
    await c.s.colunas.marcarFinal(b.id, false);
    expect((await c.s.colunas.listarDoProjeto(c.projeto)).some((x) => x.final)).toBe(false);
  });

  it("arquivar tira a coluna das tarefas e recuperar devolve", async () => {
    const c = await preparar();
    const fazendo = await c.coluna("Fazendo");
    const t1 = await c.tarefa("T1");
    const t2 = await c.tarefa("T2");
    await c.s.tarefas.moverParaColuna(t1.id, fazendo.id);
    await c.s.tarefas.moverParaColuna(t2.id, fazendo.id);
    passarUmMinuto();
    await c.s.colunas.excluir(fazendo.id);
    expect((await c.s.tarefas.obter(t1.id)).colunaId).toBeNull();
    expect(await c.s.colunas.listarDoProjeto(c.projeto)).toEqual([]);
    passarUmMinuto();
    await c.s.colunas.recuperar(fazendo.id);
    expect((await c.s.tarefas.obter(t1.id)).colunaId).toBe(fazendo.id);
    expect((await c.s.tarefas.obter(t2.id)).colunaId).toBe(fazendo.id);
  });
});

describe("conclusão e coluna final (RN32)", () => {
  async function quadro() {
    const c = await preparar();
    const aFazer = await c.coluna("A fazer");
    const fazendo = await c.coluna("Fazendo");
    const feito = await c.coluna("Feito");
    await c.s.colunas.marcarFinal(feito.id, true);
    return { ...c, aFazer, fazendo, feito };
  }

  it("concluir por qualquer caminho leva à coluna final; reabrir leva à primeira não final", async () => {
    const c = await quadro();
    const t = await c.tarefa("T");
    await c.s.tarefas.moverParaColuna(t.id, c.fazendo.id);
    expect((await c.s.tarefas.concluir(t.id)).colunaId).toBe(c.feito.id);
    expect((await c.s.tarefas.reabrir(t.id)).colunaId).toBe(c.aFazer.id);
  });

  it("sem coluna final, concluir não muda a coluna", async () => {
    const c = await preparar();
    const fazendo = await c.coluna("Fazendo");
    const t = await c.tarefa("T");
    await c.s.tarefas.moverParaColuna(t.id, fazendo.id);
    expect((await c.s.tarefas.concluir(t.id)).colunaId).toBe(fazendo.id);
  });

  it("mover para a final conclui; com subtarefas abertas pede confirmação sem gravar", async () => {
    const c = await quadro();
    const t = await c.tarefa("T");
    expect(await c.s.tarefas.moverParaColuna(t.id, c.feito.id)).toMatchObject({ status: "concluida", colunaId: c.feito.id });

    const comSub = await c.tarefa("Com sub");
    const sub = await c.s.tarefas.criarSubtarefa(comSub.id, "Sub");
    const erro = await capturarErro(c.s.tarefas.moverParaColuna(comSub.id, c.feito.id));
    expect(erro.codigo).toBe("subtarefas_abertas");
    expect(await c.s.tarefas.obter(comSub.id)).toMatchObject({ status: "aberta", colunaId: null });

    await c.s.tarefas.moverParaColuna(comSub.id, c.feito.id, { incluirSubtarefas: true });
    expect((await c.s.tarefas.obter(sub.id)).status).toBe("concluida");
    expect((await c.s.tarefas.obter(sub.id)).colunaId).toBeNull();
  });

  it("tirar uma concluída da final reabre", async () => {
    const c = await quadro();
    const t = await c.tarefa("T");
    await c.s.tarefas.moverParaColuna(t.id, c.feito.id);
    expect(await c.s.tarefas.moverParaColuna(t.id, c.fazendo.id)).toMatchObject({ status: "aberta", colunaId: c.fazendo.id, concluidaEm: null });
  });

  it("recusa coluna de outro projeto, tarefa avulsa e subtarefa", async () => {
    const c = await quadro();
    const deOutro = await c.coluna("Outra", c.outroProjeto);
    const t = await c.tarefa("T");
    expect((await capturarErro(c.s.tarefas.moverParaColuna(t.id, deOutro.id))).detalhes.campos).toEqual(["colunaId"]);
    const avulsa = await c.tarefa("Avulsa", { projetoId: null });
    expect((await capturarErro(c.s.tarefas.moverParaColuna(avulsa.id, c.fazendo.id))).detalhes.campos).toEqual(["colunaId"]);
    const sub = await c.s.tarefas.criarSubtarefa(t.id, "Sub");
    expect((await capturarErro(c.s.tarefas.moverParaColuna(sub.id, c.fazendo.id))).detalhes.campos).toEqual(["colunaId"]);
  });

  it("mudar o projeto da tarefa ou torná-la avulsa zera a coluna", async () => {
    const c = await quadro();
    const t = await c.tarefa("T");
    await c.s.tarefas.moverParaColuna(t.id, c.fazendo.id);
    expect((await c.s.tarefas.alterar(t.id, { projetoId: c.outroProjeto })).colunaId).toBeNull();
    await c.s.tarefas.alterar(t.id, { projetoId: c.projeto });
    await c.s.tarefas.moverParaColuna(t.id, c.fazendo.id);
    expect((await c.s.tarefas.alterar(t.id, { projetoId: null })).colunaId).toBeNull();
  });
});
