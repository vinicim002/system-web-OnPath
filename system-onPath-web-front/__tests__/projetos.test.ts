import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Servicos } from "@/dados/contratos";
import { ErroOnPath } from "@/dados/erros";
import { limparTudo } from "@/dados/local/armazenamento";
import { criarServicosLocais } from "@/dados/local/servicos";
import type { Projeto } from "@/dados/tipos";
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

interface Cenario {
  s: Servicos;
  trabalho: string;
  pessoal: string;
  clientes: string;
  outro: string;
  casa: string;
  projeto: (nome: string, grupoId?: string) => Promise<Projeto>;
  proximaAcao: (projetoId: string, titulo?: string) => Promise<string>;
  ativo: (nome: string, grupoId?: string) => Promise<Projeto>;
}

async function preparar(): Promise<Cenario> {
  const s = criarServicosLocais();
  const trabalho = (await s.areas.criar({ nome: "Trabalho", cor: TONS_AREA[0]! })).id;
  const pessoal = (await s.areas.criar({ nome: "Pessoal", cor: TONS_AREA[1]! })).id;
  const clientes = (await s.grupos.criar({ areaId: trabalho, nome: "Clientes", limiteAtivos: 1 })).id;
  const outro = (await s.grupos.criar({ areaId: trabalho, nome: "Outro", limiteAtivos: 2 })).id;
  const casa = (await s.grupos.criar({ areaId: pessoal, nome: "Casa", limiteAtivos: 1 })).id;
  const projeto = async (nome: string, grupoId = clientes) => {
    passarUmMinuto();
    return s.projetos.criar({ grupoId, nome, prioridade: "media" });
  };
  const proximaAcao = async (projetoId: string, titulo = "Próxima") =>
    (
      await s.tarefas.criar({
        titulo,
        areaId: trabalho,
        projetoId,
        prioridade: "media",
        tempoEstimadoMin: 30,
        status: "aberta",
      })
    ).id;
  const ativo = async (nome: string, grupoId = clientes) => {
    const p = await projeto(nome, grupoId);
    await proximaAcao(p.id);
    return s.projetos.mudarStatus(p.id, "ativo");
  };
  return { s, trabalho, pessoal, clientes, outro, casa, projeto, proximaAcao, ativo };
}

describe("projetos: criação e fila (RN01, RN05 e RN26)", () => {
  it("cria na fila, no fim do grupo, com a área do grupo", async () => {
    const c = await preparar();
    const a = await c.projeto("  A ");
    const b = await c.projeto("B");
    const outroGrupo = await c.projeto("X", c.outro);
    expect(a).toMatchObject({ nome: "A", status: "fila", posicaoFila: 0, areaId: c.trabalho });
    expect(b.posicaoFila).toBe(1);
    expect(outroGrupo.posicaoFila).toBe(0);
  });

  it("recusa nome vazio e repetido no grupo, mas aceita em outro grupo", async () => {
    const c = await preparar();
    await c.projeto("Site");
    expect((await capturarErro(c.projeto(" "))).detalhes.campos).toEqual(["nome"]);
    expect((await capturarErro(c.projeto("site"))).codigo).toBe("nome_repetido");
    expect((await c.projeto("Site", c.outro)).nome).toBe("Site");
  });

  it("reordena a fila e recusa lista diferente", async () => {
    const c = await preparar();
    const a = await c.projeto("A");
    const b = await c.projeto("B");
    const d = await c.projeto("D");
    await c.s.projetos.reordenarFila(c.clientes, [d.id, a.id, b.id]);
    const [area] = await c.s.projetos.visaoGeral({ areaId: c.trabalho });
    const grupo = area!.grupos.find((g) => g.id === c.clientes)!;
    expect(grupo.fila.map((p) => [p.nome, p.posicaoFila])).toEqual([
      ["D", 0],
      ["A", 1],
      ["B", 2],
    ]);
    expect((await capturarErro(c.s.projetos.reordenarFila(c.clientes, [a.id]))).codigo).toBe("dados_invalidos");
  });
});

describe("projetos: ativar (RN06, RN07 e RN08)", () => {
  it("ativa com vaga e próxima ação", async () => {
    const c = await preparar();
    const p = await c.ativo("A");
    expect(p.status).toBe("ativo");
  });

  it("grupo cheio recusa com os ocupantes, sem gravar", async () => {
    const c = await preparar();
    const ocupante = await c.ativo("A");
    const b = await c.projeto("B");
    await c.proximaAcao(b.id);
    const erro = await capturarErro(c.s.projetos.mudarStatus(b.id, "ativo"));
    expect(erro.codigo).toBe("grupo_cheio");
    expect(erro.detalhes.ocupantes).toEqual([{ id: ocupante.id, nome: "A" }]);
    expect((await c.s.projetos.obter(b.id)).status).toBe("fila");

    await c.s.projetos.mudarStatus(ocupante.id, "pausado");
    expect((await c.s.projetos.mudarStatus(b.id, "ativo")).status).toBe("ativo");
  });

  it("limite zero e grupo acima do limite recusam", async () => {
    const c = await preparar();
    await c.ativo("A", c.outro);
    await c.ativo("B", c.outro);
    await c.s.grupos.alterar(c.outro, { limiteAtivos: 1 });
    const d = await c.projeto("D", c.outro);
    await c.proximaAcao(d.id);
    expect((await capturarErro(c.s.projetos.mudarStatus(d.id, "ativo"))).codigo).toBe("grupo_cheio");

    await c.s.grupos.alterar(c.casa, { limiteAtivos: 0 });
    const e = await c.projeto("E", c.casa);
    await c.proximaAcao(e.id);
    expect((await capturarErro(c.s.projetos.mudarStatus(e.id, "ativo"))).codigo).toBe("grupo_cheio");
  });

  it("sem tarefa aberta recusa; subtarefa aberta conta; arquivada ou concluída não", async () => {
    const c = await preparar();
    const p = await c.projeto("A");
    expect((await capturarErro(c.s.projetos.mudarStatus(p.id, "ativo"))).codigo).toBe("sem_proxima_acao");

    const tarefa = await c.proximaAcao(p.id);
    await c.s.tarefas.concluir(tarefa);
    expect((await capturarErro(c.s.projetos.mudarStatus(p.id, "ativo"))).codigo).toBe("sem_proxima_acao");

    const outra = await c.proximaAcao(p.id, "Outra");
    await c.s.tarefas.excluir(outra);
    expect((await capturarErro(c.s.projetos.mudarStatus(p.id, "ativo"))).codigo).toBe("sem_proxima_acao");

    // Só a subtarefa fica aberta: a principal é cancelada, e a subtarefa herda o projeto.
    await c.s.tarefas.reabrir(tarefa);
    await c.s.tarefas.criarSubtarefa(tarefa, "Sub");
    await c.s.tarefas.cancelar(tarefa);
    expect((await c.s.projetos.mudarStatus(p.id, "ativo")).status).toBe("ativo");
  });

  it("semProximaAcao só para ativo sem tarefa aberta", async () => {
    const c = await preparar();
    const p = await c.ativo("A");
    expect(await c.s.projetos.semProximaAcao(p.id)).toBe(false);
    const [tarefa] = (await c.s.tarefas.listar()).filter((t) => t.projetoId === p.id);
    await c.s.tarefas.concluir(tarefa!.id);
    expect(await c.s.projetos.semProximaAcao(p.id)).toBe(true);
  });
});

describe("projetos: transições", () => {
  it("recusa transições fora da tabela", async () => {
    const c = await preparar();
    const p = await c.projeto("A");
    const erro = await capturarErro(c.s.projetos.mudarStatus(p.id, "pausado"));
    expect(erro.codigo).toBe("transicao_invalida");
    expect(erro.detalhes).toMatchObject({ de: "fila", para: "pausado" });
  });

  it("voltar à fila e reabrir põem no fim", async () => {
    const c = await preparar();
    const a = await c.ativo("A");
    await c.projeto("B");
    await c.projeto("D");
    await c.s.projetos.mudarStatus(a.id, "pausado");
    expect((await c.s.projetos.mudarStatus(a.id, "fila")).posicaoFila).toBe(2);

    const e = await c.projeto("E");
    await c.s.projetos.mudarStatus(e.id, "concluido");
    expect((await c.s.projetos.mudarStatus(e.id, "fila")).posicaoFila).toBe(3);
  });
});

describe("projetos: mudar de grupo (RN01)", () => {
  it("propaga a área para as tarefas e subtarefas e desliga a meta de outra área", async () => {
    const c = await preparar();
    const meta = await c.s.metas.criar({ areaId: c.trabalho, titulo: "Meta", status: "ativa" });
    const p = await c.s.projetos.criar({ grupoId: c.clientes, nome: "A", prioridade: "media", metaId: meta.id });
    const tarefa = await c.proximaAcao(p.id);
    const sub = await c.s.tarefas.criarSubtarefa(tarefa, "Sub");
    await c.projeto("Já na fila", c.casa);

    const movido = await c.s.projetos.alterar(p.id, { grupoId: c.casa });
    expect(movido).toMatchObject({ areaId: c.pessoal, metaId: null, posicaoFila: 1 });
    expect((await c.s.tarefas.obter(tarefa)).areaId).toBe(c.pessoal);
    expect((await c.s.tarefas.obter(sub.id)).areaId).toBe(c.pessoal);
  });

  it("meta de outra área é recusada", async () => {
    const c = await preparar();
    const meta = await c.s.metas.criar({ areaId: c.pessoal, titulo: "Meta", status: "ativa" });
    const erro = await capturarErro(c.s.projetos.criar({ grupoId: c.clientes, nome: "A", prioridade: "media", metaId: meta.id }));
    expect(erro.detalhes.campos).toEqual(["metaId"]);
  });

  it("ativo só muda para grupo com vaga", async () => {
    const c = await preparar();
    const a = await c.ativo("A");
    await c.ativo("B", c.casa);
    expect((await capturarErro(c.s.projetos.alterar(a.id, { grupoId: c.casa }))).codigo).toBe("grupo_cheio");
    expect((await c.s.projetos.alterar(a.id, { grupoId: c.outro })).status).toBe("ativo");
  });
});

describe("projetos: visão geral", () => {
  it("agrupa por área e grupo, separa os status, mostra vagas e aviso, e filtra", async () => {
    const c = await preparar();
    const a = await c.ativo("A");
    const [tarefa] = (await c.s.tarefas.listar()).filter((t) => t.projetoId === a.id);
    await c.s.tarefas.concluir(tarefa!.id);
    await c.projeto("Fila 1");
    const pausado = await c.ativo("P", c.outro);
    await c.s.projetos.mudarStatus(pausado.id, "pausado");
    const feito = await c.projeto("Feito", c.outro);
    await c.s.projetos.mudarStatus(feito.id, "concluido");

    const visao = await c.s.projetos.visaoGeral();
    expect(visao.map((v) => v.area.nome)).toEqual(["Trabalho", "Pessoal"]);
    const clientes = visao[0]!.grupos.find((g) => g.id === c.clientes)!;
    expect(clientes).toMatchObject({ ativos: 1, limiteAtivos: 1, acimaDoLimite: false });
    expect(clientes.projetosAtivos.map((p) => [p.nome, p.semProximaAcao])).toEqual([["A", true]]);
    expect(clientes.fila.map((p) => p.nome)).toEqual(["Fila 1"]);
    const outro = visao[0]!.grupos.find((g) => g.id === c.outro)!;
    expect(outro.pausados.map((p) => p.nome)).toEqual(["P"]);
    expect(outro.encerrados.map((p) => p.nome)).toEqual(["Feito"]);

    expect((await c.s.projetos.visaoGeral({ areaId: c.pessoal })).map((v) => v.area.nome)).toEqual(["Pessoal"]);
    const soFila = await c.s.projetos.visaoGeral({ status: "fila" });
    const todos = soFila.flatMap((v) => v.grupos.flatMap((g) => [...g.projetosAtivos, ...g.fila, ...g.pausados, ...g.encerrados]));
    expect(todos.map((p) => p.nome)).toEqual(["Fila 1"]);
  });
});
