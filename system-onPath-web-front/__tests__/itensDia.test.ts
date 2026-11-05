import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Servicos } from "@/dados/contratos";
import { ErroOnPath } from "@/dados/erros";
import { limparTudo } from "@/dados/local/armazenamento";
import { criarServicosLocais } from "@/dados/local/servicos";
import type { NovaTarefa, Tarefa } from "@/dados/tipos";

async function capturarErro(promessa: Promise<unknown>): Promise<ErroOnPath> {
  try {
    await promessa;
  } catch (erro) {
    if (erro instanceof ErroOnPath) return erro;
    throw erro;
  }
  throw new Error("era esperado um ErroOnPath");
}

const ONTEM = "2026-11-04";
const HOJE = "2026-11-05";
const AMANHA = "2026-11-06";

let instante = Date.parse("2026-11-05T12:00:00.000Z");
function passarUmMinuto() {
  instante += 60_000;
  vi.setSystemTime(instante);
}

interface Cenario {
  s: Servicos;
  tarefa: (titulo: string, campos?: Partial<NovaTarefa>) => Promise<Tarefa>;
}

async function preparar(): Promise<Cenario> {
  const s = criarServicosLocais();
  const area = await s.areas.criar({ nome: "Pessoal", cor: "#737373", ordem: 0 });
  return {
    s,
    tarefa: async (titulo, campos = {}) => {
      passarUmMinuto();
      return s.tarefas.criar({
        titulo,
        areaId: area.id,
        prioridade: "media",
        tempoEstimadoMin: 30,
        status: "aberta",
        ...campos,
      });
    },
  };
}

const titulos = (plano: Awaited<ReturnType<Servicos["itensDia"]["planoDoDia"]>>) =>
  plano.itens.map((i) => i.tarefa.titulo);

beforeEach(() => {
  limparTudo();
  vi.useFakeTimers({ toFake: ["Date"] });
  passarUmMinuto();
});

afterEach(() => vi.useRealTimers());

describe("itens do dia: montar o plano (T011)", () => {
  it("adiciona no fim, sem repetir, com a próxima na primeira", async () => {
    const c = await preparar();
    const a = await c.tarefa("A");
    const b = await c.tarefa("B");
    const novos = await c.s.itensDia.adicionar(HOJE, [a.id, b.id]);
    expect(novos.map((i) => [i.ordem, i.resultado, i.data])).toEqual([
      [0, "pendente", HOJE],
      [1, "pendente", HOJE],
    ]);

    const c1 = await c.tarefa("C");
    const repetidos = await c.s.itensDia.adicionar(HOJE, [a.id, c1.id, c1.id]);
    expect(repetidos).toHaveLength(1);

    const plano = await c.s.itensDia.planoDoDia(HOJE);
    expect(titulos(plano)).toEqual(["A", "B", "C"]);
    expect(plano.proximaId).toBe(plano.itens[0]!.item.id);
    expect(plano.data).toBe(HOJE);
  });

  it("recusa tarefa inexistente, arquivada ou não aberta, sem gravar nada", async () => {
    const c = await preparar();
    const a = await c.tarefa("A");
    const arquivada = await c.tarefa("Arquivada");
    await c.s.tarefas.excluir(arquivada.id);
    const concluida = await c.tarefa("Concluída");
    await c.s.tarefas.concluir(concluida.id);
    const inexistente = "00000000-0000-4000-8000-000000000000";

    for (const id of [arquivada.id, concluida.id, inexistente]) {
      const erro = await capturarErro(c.s.itensDia.adicionar(HOJE, [a.id, id]));
      expect(erro.codigo).toBe("dados_invalidos");
      expect(erro.detalhes.campos).toEqual(["tarefaId"]);
    }
    expect((await c.s.itensDia.planoDoDia(HOJE)).itens).toEqual([]);
  });

  it("subtarefa traz o título da principal", async () => {
    const c = await preparar();
    const principal = await c.tarefa("Principal");
    const sub = await c.s.tarefas.criarSubtarefa(principal.id, "Sub");
    await c.s.itensDia.adicionar(HOJE, [sub.id]);
    const [linha] = (await c.s.itensDia.planoDoDia(HOJE)).itens;
    expect(linha).toMatchObject({ tituloPrincipal: "Principal" });
    expect(linha!.tarefa.id).toBe(sub.id);
  });

  it("tirar do dia arquiva o item e não muda a tarefa; adicionar de novo cria outro", async () => {
    const c = await preparar();
    const a = await c.tarefa("A");
    const [item] = await c.s.itensDia.adicionar(HOJE, [a.id]);
    await c.s.itensDia.excluir(item!.id);

    expect((await c.s.itensDia.planoDoDia(HOJE)).itens).toEqual([]);
    expect((await c.s.tarefas.obter(a.id)).status).toBe("aberta");

    const [outro] = await c.s.itensDia.adicionar(HOJE, [a.id]);
    expect(outro!.id).not.toBe(item!.id);
  });

  it("reordena e recusa uma lista diferente dos itens do dia", async () => {
    const c = await preparar();
    const ids = [];
    for (const titulo of ["A", "B", "C"]) ids.push((await c.tarefa(titulo)).id);
    const itens = await c.s.itensDia.adicionar(HOJE, ids);
    const [a, b, c1] = itens.map((i) => i.id) as [string, string, string];

    await c.s.itensDia.reordenar(HOJE, [c1, a, b]);
    const plano = await c.s.itensDia.planoDoDia(HOJE);
    expect(titulos(plano)).toEqual(["C", "A", "B"]);
    expect(plano.itens.map((i) => i.item.ordem)).toEqual([0, 1, 2]);

    const erro = await capturarErro(c.s.itensDia.reordenar(HOJE, [a, b]));
    expect(erro.codigo).toBe("dados_invalidos");
    expect(titulos(await c.s.itensDia.planoDoDia(HOJE))).toEqual(["C", "A", "B"]);
  });

  it("itens de outras datas não aparecem", async () => {
    const c = await preparar();
    const a = await c.tarefa("A");
    const b = await c.tarefa("B");
    await c.s.itensDia.adicionar(AMANHA, [a.id]);
    await c.s.itensDia.adicionar(HOJE, [b.id]);
    expect(titulos(await c.s.itensDia.planoDoDia(HOJE))).toEqual(["B"]);
    expect(titulos(await c.s.itensDia.planoDoDia(AMANHA))).toEqual(["A"]);
    expect(ONTEM < HOJE).toBe(true);
  });
});

describe("itens do dia: fazer as tarefas", () => {
  it("concluída continua no dia e passa a próxima adiante; tempos somam", async () => {
    const c = await preparar();
    const a = await c.tarefa("A", { tempoEstimadoMin: 60 });
    const b = await c.tarefa("B", { tempoEstimadoMin: 30 });
    const sub = await c.s.tarefas.criarSubtarefa(a.id, "Sub sem tempo");
    await c.s.itensDia.adicionar(HOJE, [a.id, b.id, sub.id]);

    let plano = await c.s.itensDia.planoDoDia(HOJE);
    expect(plano.planejadoMin).toBe(90);
    expect(plano.feitoMin).toBe(0);

    await c.s.tarefas.concluir(a.id, { incluirSubtarefas: true });
    plano = await c.s.itensDia.planoDoDia(HOJE);
    expect(titulos(plano)).toEqual(["A", "B", "Sub sem tempo"]);
    expect(plano.proximaId).toBe(plano.itens[1]!.item.id);
    expect(plano.feitoMin).toBe(60);
  });

  it("tarefa cancelada ou arquivada sai do plano", async () => {
    const c = await preparar();
    const a = await c.tarefa("A");
    const b = await c.tarefa("B");
    const d = await c.tarefa("D");
    await c.s.itensDia.adicionar(HOJE, [a.id, b.id, d.id]);
    await c.s.tarefas.cancelar(a.id);
    await c.s.tarefas.excluir(b.id);
    expect(titulos(await c.s.itensDia.planoDoDia(HOJE))).toEqual(["D"]);
    await c.s.tarefas.recuperar(b.id);
    expect(titulos(await c.s.itensDia.planoDoDia(HOJE))).toEqual(["B", "D"]);
  });

  it("com tudo feito, não há próxima", async () => {
    const c = await preparar();
    const a = await c.tarefa("A");
    await c.s.itensDia.adicionar(HOJE, [a.id]);
    await c.s.tarefas.concluir(a.id);
    expect((await c.s.itensDia.planoDoDia(HOJE)).proximaId).toBeNull();
  });
});
