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

describe("tarefas: edição, situação e filtros", () => {
  it("alterar aplica as mesmas regras da criação", async () => {
    const c = await preparar();
    const tarefa = await c.s.tarefas.criar(nova(c));
    const erro = await capturarErro(c.s.tarefas.alterar(tarefa.id, { titulo: "  ", tempoEstimadoMin: null }));
    expect([...(erro.detalhes.campos as string[])].sort()).toEqual(["tempoEstimadoMin", "titulo"]);
    const alterada = await c.s.tarefas.alterar(tarefa.id, { projetoId: c.projeto });
    expect(alterada.areaId).toBe(c.trabalho);
  });

  it("alterar não mexe na situação nem no pai", async () => {
    const c = await preparar();
    const tarefa = await c.s.tarefas.criar(nova(c));
    const alterada = await c.s.tarefas.alterar(tarefa.id, {
      status: "concluida",
      tarefaPaiId: tarefa.id,
    } as Partial<NovaTarefa>);
    expect(alterada.status).toBe("aberta");
    expect(alterada.tarefaPaiId).toBeNull();
  });

  it("concluir, reabrir e cancelar", async () => {
    const c = await preparar();
    const tarefa = await c.s.tarefas.criar(nova(c));
    passarUmMinuto();
    const concluida = await c.s.tarefas.concluir(tarefa.id);
    expect(concluida.status).toBe("concluida");
    expect(concluida.concluidaEm).toBe(new Date(instante).toISOString());

    const reaberta = await c.s.tarefas.reabrir(tarefa.id);
    expect(reaberta).toMatchObject({ status: "aberta", concluidaEm: null });

    const cancelada = await c.s.tarefas.cancelar(tarefa.id);
    expect(cancelada).toMatchObject({ status: "cancelada", concluidaEm: null });
  });

  it("excluir arquiva e recuperar desarquiva (RN31)", async () => {
    const c = await preparar();
    const tarefa = await c.s.tarefas.criar(nova(c));
    await c.s.tarefas.excluir(tarefa.id);
    expect(await c.s.tarefas.listarFiltradas({ status: "todas" })).toEqual([]);
    const recuperada = await c.s.tarefas.recuperar(tarefa.id);
    expect(recuperada.arquivadoEm).toBeNull();
    expect(await c.s.tarefas.listarFiltradas()).toHaveLength(1);
  });

  it("filtra por cada campo, combina filtros e usa abertas como padrão", async () => {
    const c = await preparar();
    const avulsa = await c.s.tarefas.criar(nova(c, { titulo: "avulsa", prioridade: "baixa" }));
    const deProjeto = await c.s.tarefas.criar(nova(c, { titulo: "projeto", projetoId: c.projeto }));
    const deMateria = await c.s.tarefas.criar(nova(c, { titulo: "matéria", materiaId: c.materia, prioridade: "alta" }));
    const concluida = await c.s.tarefas.criar(nova(c, { titulo: "feita" }));
    await c.s.tarefas.concluir(concluida.id);

    const titulos = async (filtros: Parameters<Servicos["tarefas"]["listarFiltradas"]>[0]) =>
      (await c.s.tarefas.listarFiltradas(filtros)).map((t) => t.titulo).sort();

    expect(await titulos({})).toEqual(["avulsa", "matéria", "projeto"].sort());
    expect(await titulos({ status: "concluida" })).toEqual(["feita"]);
    expect(await titulos({ status: "todas" })).toHaveLength(4);
    expect(await titulos({ areaId: c.trabalho })).toEqual(["projeto"]);
    expect(await titulos({ projetoId: c.projeto })).toEqual(["projeto"]);
    expect(await titulos({ projetoId: "avulsa" })).toEqual(["avulsa"]);
    expect(await titulos({ materiaId: c.materia })).toEqual(["matéria"]);
    expect(await titulos({ prioridade: "baixa" })).toEqual(["avulsa"]);
    expect(await titulos({ areaId: c.pessoal, prioridade: "alta" })).toEqual(["matéria"]);
    expect([avulsa, deProjeto, deMateria].every((t) => t.status === "aberta")).toBe(true);
  });

  it("ordena por prioridade, prazo e criação", async () => {
    const c = await preparar();
    const criar = async (titulo: string, campos: Partial<NovaTarefa>) => {
      passarUmMinuto();
      return c.s.tarefas.criar(nova(c, { titulo, ...campos }));
    };
    await criar("média sem prazo", { prioridade: "media" });
    await criar("alta sem prazo", { prioridade: "alta" });
    await criar("média prazo longe", { prioridade: "media", prazo: "2026-12-20" });
    await criar("média prazo perto", { prioridade: "media", prazo: "2026-11-10" });
    await criar("baixa", { prioridade: "baixa", prazo: "2026-11-06" });

    expect((await c.s.tarefas.listarFiltradas()).map((t) => t.titulo)).toEqual([
      "alta sem prazo",
      "média prazo perto",
      "média prazo longe",
      "média sem prazo",
      "baixa",
    ]);
  });
});
