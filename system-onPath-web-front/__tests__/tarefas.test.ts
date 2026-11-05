import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Servicos } from "@/dados/contratos";
import { ErroOnPath } from "@/dados/erros";
import { limparTudo } from "@/dados/local/armazenamento";
import { criarServicosLocais } from "@/dados/local/servicos";
import type { NovaTarefa } from "@/dados/tipos";

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

interface Cenario {
  s: Servicos;
  trabalho: string;
  pessoal: string;
  projeto: string;
  materia: string;
}

/** Duas áreas, um projeto em Trabalho e uma matéria em Pessoal. */
async function preparar(): Promise<Cenario> {
  const s = criarServicosLocais();
  const trabalho = await s.areas.criar({ nome: "Trabalho", cor: "#525252", ordem: 0 });
  const pessoal = await s.areas.criar({ nome: "Pessoal", cor: "#737373", ordem: 1 });
  const grupo = await s.grupos.criar({ areaId: trabalho.id, nome: "Clientes", limiteAtivos: 2 });
  const projeto = await s.projetos.criar({
    grupoId: grupo.id,
    nome: "Site",
    prioridade: "alta",
    status: "ativo",
    posicaoFila: 0,
  });
  const materia = await s.materias.criar({ areaId: pessoal.id, nome: "Cálculo", status: "ativa" });
  return { s, trabalho: trabalho.id, pessoal: pessoal.id, projeto: projeto.id, materia: materia.id };
}

function nova(c: Cenario, campos: Partial<NovaTarefa> = {}): NovaTarefa {
  return {
    titulo: "Escrever relatório",
    areaId: c.pessoal,
    prioridade: "media",
    tempoEstimadoMin: 30,
    status: "aberta",
    ...campos,
  };
}

beforeEach(() => {
  limparTudo();
  vi.useFakeTimers({ toFake: ["Date"] });
  passarUmMinuto();
});

afterEach(() => vi.useRealTimers());

describe("tarefas: criação (RN02, RN21, RN24)", () => {
  it("cria uma tarefa avulsa completa", async () => {
    const c = await preparar();
    const tarefa = await c.s.tarefas.criar(nova(c, { titulo: "  Pagar boleto  ", anotacoes: "" }));

    expect(tarefa).toMatchObject({
      titulo: "Pagar boleto",
      areaId: c.pessoal,
      projetoId: null,
      materiaId: null,
      tarefaPaiId: null,
      status: "aberta",
      concluidaEm: null,
      anotacoes: null,
    });
    expect(await c.s.tarefas.listarFiltradas()).toEqual([tarefa]);
  });

  it("recusa a falta de título, área, prioridade ou tempo, listando cada campo", async () => {
    const c = await preparar();
    const erro = await capturarErro(
      c.s.tarefas.criar({ titulo: " ", status: "aberta" } as unknown as NovaTarefa),
    );
    expect(erro.codigo).toBe("dados_invalidos");
    expect([...(erro.detalhes.campos as string[])].sort()).toEqual(
      ["areaId", "prioridade", "tempoEstimadoMin", "titulo"].sort(),
    );
    expect(await c.s.tarefas.listar({ incluirArquivados: true })).toEqual([]);
  });

  it("recusa tempo estimado zero ou quebrado", async () => {
    const c = await preparar();
    for (const tempoEstimadoMin of [0, -5, 1.5]) {
      const erro = await capturarErro(c.s.tarefas.criar(nova(c, { tempoEstimadoMin })));
      expect(erro.detalhes.campos).toContain("tempoEstimadoMin");
    }
  });

  it("aceita só alta, média ou baixa (RN21)", async () => {
    const c = await preparar();
    const erro = await capturarErro(
      c.s.tarefas.criar(nova(c, { prioridade: "urgente" as NovaTarefa["prioridade"] })),
    );
    expect(erro.detalhes.campos).toEqual(["prioridade"]);
  });

  it("recusa projeto e matéria juntos (RN02)", async () => {
    const c = await preparar();
    const erro = await capturarErro(
      c.s.tarefas.criar(nova(c, { projetoId: c.projeto, materiaId: c.materia })),
    );
    expect(erro.codigo).toBe("dados_invalidos");
    expect(erro.detalhes.campos).toEqual(expect.arrayContaining(["projetoId", "materiaId"]));
  });

  it("com projeto, a área é a do projeto", async () => {
    const c = await preparar();
    const tarefa = await c.s.tarefas.criar(nova(c, { projetoId: c.projeto, areaId: c.pessoal }));
    expect(tarefa.areaId).toBe(c.trabalho);
  });

  it("com matéria, a área é a da matéria, mesmo sem área informada", async () => {
    const c = await preparar();
    const { areaId: _, ...semArea } = nova(c, { materiaId: c.materia });
    const tarefa = await c.s.tarefas.criar(semArea as NovaTarefa);
    expect(tarefa.areaId).toBe(c.pessoal);
  });

  it("recusa projeto inexistente ou arquivado", async () => {
    const c = await preparar();
    const inexistente = "00000000-0000-4000-8000-000000000000";
    expect((await capturarErro(c.s.tarefas.criar(nova(c, { projetoId: inexistente })))).detalhes.campos).toEqual([
      "projetoId",
    ]);
    await c.s.projetos.excluir(c.projeto);
    expect((await capturarErro(c.s.tarefas.criar(nova(c, { projetoId: c.projeto })))).detalhes.campos).toEqual([
      "projetoId",
    ]);
  });

  it("recusa área arquivada", async () => {
    const c = await preparar();
    await c.s.areas.excluir(c.pessoal);
    const erro = await capturarErro(c.s.tarefas.criar(nova(c)));
    expect(erro.detalhes.campos).toEqual(["areaId"]);
  });
});
