import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Servicos } from "@/dados/contratos";
import { ErroOnPath } from "@/dados/erros";
import { limparTudo } from "@/dados/local/armazenamento";
import { criarServicosLocais } from "@/dados/local/servicos";
import { dataLocal, horaLocal, inicioDaSemana, instanteLocal } from "@/i18n/datas";
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

// Quinta-feira, 5 de novembro de 2026, 09:00 em São Paulo (12:00 UTC).
const HOJE = "2026-11-05";
beforeEach(() => {
  limparTudo();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(Date.parse("2026-11-05T12:00:00.000Z"));
});
afterEach(() => vi.useRealTimers());

const em = (data: string, hora: string) => instanteLocal(data, hora);

async function preparar() {
  const s: Servicos = criarServicosLocais();
  const area = (await s.areas.criar({ nome: "Trabalho", cor: TONS_AREA[0]! })).id;
  const tarefa = await s.tarefas.criar({ titulo: "Relatório", areaId: area, prioridade: "media", tempoEstimadoMin: 60, status: "aberta" });
  return { s, area, tarefa: tarefa.id };
}

describe("datas no fuso do usuário", () => {
  it("converte hora local para UTC e volta", () => {
    expect(em(HOJE, "09:00")).toBe("2026-11-05T12:00:00.000Z");
    expect(horaLocal("2026-11-05T12:00:00.000Z")).toBe("09:00");
    expect(dataLocal("2026-11-06T02:30:00.000Z")).toBe("2026-11-05");
    expect(inicioDaSemana(HOJE)).toBe("2026-11-02");
    expect(inicioDaSemana("2026-11-08")).toBe("2026-11-02");
  });
});

describe("blocos e conflitos (RN09)", () => {
  it("cria, lista no intervalo e marca realizado", async () => {
    const c = await preparar();
    const bloco = await c.s.agenda.criarBloco({ tarefaId: c.tarefa, inicio: em(HOJE, "14:00"), fim: em(HOJE, "15:00"), status: "planejado" });
    const itens = await c.s.agenda.listarNoIntervalo(em(HOJE, "00:00"), em("2026-11-06", "00:00"));
    expect(itens).toEqual([
      expect.objectContaining({ tipo: "bloco", id: bloco.id, titulo: "Relatório", areaId: c.area, status: "planejado" }),
    ]);
    expect((await c.s.agenda.marcarRealizado(bloco.id)).status).toBe("realizado");
  });

  it("sobreposição pede confirmação e lista os ocupantes; encostar não conflita", async () => {
    const c = await preparar();
    const reuniao = await c.s.agenda.criarCompromisso({ titulo: "Reunião", areaId: c.area, inicio: em(HOJE, "14:00"), fim: em(HOJE, "15:00") });
    const erro = await capturarErro(
      c.s.agenda.criarBloco({ tarefaId: c.tarefa, inicio: em(HOJE, "14:30"), fim: em(HOJE, "15:30"), status: "planejado" }),
    );
    expect(erro.codigo).toBe("horario_ocupado");
    expect(erro.detalhes.ocupantes).toEqual([expect.objectContaining({ tipo: "compromisso", id: reuniao.id, titulo: "Reunião" })]);
    expect(await c.s.agenda.listarNoIntervalo(em(HOJE, "00:00"), em(HOJE, "23:59"))).toHaveLength(1);

    await c.s.agenda.criarBloco(
      { tarefaId: c.tarefa, inicio: em(HOJE, "14:30"), fim: em(HOJE, "15:30"), status: "planejado" },
      { confirmarConflito: true },
    );
    await c.s.agenda.criarBloco({ tarefaId: c.tarefa, inicio: em(HOJE, "15:30"), fim: em(HOJE, "16:00"), status: "planejado" });
    expect(await c.s.agenda.listarNoIntervalo(em(HOJE, "00:00"), em(HOJE, "23:59"))).toHaveLength(3);
  });

  it("compromisso também respeita o conflito; mover para horário ocupado pede confirmação", async () => {
    const c = await preparar();
    const bloco = await c.s.agenda.criarBloco({ tarefaId: c.tarefa, inicio: em(HOJE, "10:00"), fim: em(HOJE, "11:00"), status: "planejado" });
    const outro = await c.s.agenda.criarCompromisso({ titulo: "Médico", areaId: c.area, inicio: em(HOJE, "16:00"), fim: em(HOJE, "17:00") });
    expect((await capturarErro(c.s.agenda.alterarCompromisso(outro.id, { inicio: em(HOJE, "10:30"), fim: em(HOJE, "11:30") }))).codigo).toBe(
      "horario_ocupado",
    );
    expect((await capturarErro(c.s.agenda.alterarBloco(bloco.id, { inicio: em(HOJE, "16:30"), fim: em(HOJE, "17:30") }))).codigo).toBe(
      "horario_ocupado",
    );
    // O próprio item não conflita com ele mesmo.
    expect((await c.s.agenda.alterarBloco(bloco.id, { fim: em(HOJE, "11:30") })).fim).toBe(em(HOJE, "11:30"));
  });

  it("valida intervalo, alvo e campos", async () => {
    const c = await preparar();
    const base = { status: "planejado" as const };
    expect((await capturarErro(c.s.agenda.criarBloco({ ...base, tarefaId: c.tarefa, inicio: em(HOJE, "15:00"), fim: em(HOJE, "14:00") }))).detalhes.campos).toEqual(["fim"]);
    expect((await capturarErro(c.s.agenda.criarBloco({ ...base, tarefaId: c.tarefa, inicio: em(HOJE, "23:00"), fim: em("2026-11-06", "01:00") }))).detalhes.campos).toEqual(["fim"]);
    expect((await capturarErro(c.s.agenda.criarBloco({ ...base, inicio: em(HOJE, "14:00"), fim: em(HOJE, "15:00") }))).detalhes.campos).toEqual(["alvo"]);
    await c.s.tarefas.concluir(c.tarefa);
    expect((await capturarErro(c.s.agenda.criarBloco({ ...base, tarefaId: c.tarefa, inicio: em(HOJE, "14:00"), fim: em(HOJE, "15:00") }))).detalhes.campos).toEqual(["tarefaId"]);
    expect((await capturarErro(c.s.agenda.criarCompromisso({ titulo: " ", areaId: c.area, inicio: em(HOJE, "14:00"), fim: em(HOJE, "15:00") }))).detalhes.campos).toEqual(["titulo"]);
  });

  it("arquivar compromisso libera o horário e recuperar devolve", async () => {
    const c = await preparar();
    const reuniao = await c.s.agenda.criarCompromisso({ titulo: "Reunião", areaId: c.area, inicio: em(HOJE, "14:00"), fim: em(HOJE, "15:00") });
    await c.s.agenda.arquivarCompromisso(reuniao.id);
    expect(await c.s.agenda.listarNoIntervalo(em(HOJE, "00:00"), em(HOJE, "23:59"))).toEqual([]);
    await c.s.agenda.recuperarCompromisso(reuniao.id);
    expect(await c.s.agenda.listarNoIntervalo(em(HOJE, "00:00"), em(HOJE, "23:59"))).toHaveLength(1);
  });
});

describe("rotinas (RN28)", () => {
  const rotinaAlmoco = (area: string) => ({
    areaId: area,
    nome: "Almoço",
    tipo: "horario" as const,
    diasSemana: [1, 2, 3, 4, 5],
    horaInicio: "12:00",
    duracaoMin: 60,
  });

  it("valida por tipo", async () => {
    const c = await preparar();
    expect((await capturarErro(c.s.rotinas.criar({ ...rotinaAlmoco(c.area), horaInicio: null }))).detalhes.campos).toEqual(["horaInicio"]);
    expect((await capturarErro(c.s.rotinas.criar({ ...rotinaAlmoco(c.area), diasSemana: [] }))).detalhes.campos).toEqual(["diasSemana"]);
    expect((await capturarErro(c.s.rotinas.criar({ areaId: c.area, nome: "Estudo", tipo: "meta_horas", diasSemana: [1] }))).detalhes.campos).toEqual(["metaMin"]);
  });

  it("gera os blocos dos 14 dias nos dias escolhidos, sem duplicar", async () => {
    const c = await preparar();
    const almoco = await c.s.rotinas.criar(rotinaAlmoco(c.area));
    expect((await c.s.rotinas.renovarBlocos(HOJE)).criados).toBe(0);
    const blocos = (await c.s.blocosTempo.listar()).filter((b) => b.rotinaId === almoco.id);
    // De qui 05/11 a qua 18/11: 10 dias úteis.
    expect(blocos).toHaveLength(10);
    expect(blocos.every((b) => horaLocal(b.inicio) === "12:00" && horaLocal(b.fim) === "13:00")).toBe(true);
    expect(blocos.map((b) => dataLocal(b.inicio))).not.toContain("2026-11-07");
  });

  it("rotina sem duração não gera blocos", async () => {
    const c = await preparar();
    await c.s.rotinas.criar({ ...rotinaAlmoco(c.area), nome: "Acordar", duracaoMin: null });
    expect(await c.s.blocosTempo.listar()).toEqual([]);
  });

  it("alterar refaz só os blocos futuros planejados", async () => {
    const c = await preparar();
    vi.setSystemTime(Date.parse("2026-11-05T13:00:00.000Z")); // 10:00 local
    const almoco = await c.s.rotinas.criar({ ...rotinaAlmoco(c.area), horaInicio: "08:00" });
    // Criar gera a partir de agora; ao abrir o app, a janela inteira de hoje é completada.
    await c.s.rotinas.renovarBlocos(HOJE);
    const deHoje = (await c.s.blocosTempo.listar()).find((b) => b.rotinaId === almoco.id && dataLocal(b.inicio) === HOJE)!;
    const deAmanha = (await c.s.blocosTempo.listar()).find((b) => b.rotinaId === almoco.id && dataLocal(b.inicio) === "2026-11-06")!;
    await c.s.agenda.marcarRealizado(deAmanha.id);

    await c.s.rotinas.alterar(almoco.id, { horaInicio: "12:30" });
    const blocos = (await c.s.blocosTempo.listar()).filter((b) => b.rotinaId === almoco.id);
    expect(blocos.find((b) => b.id === deHoje.id)).toBeDefined(); // passado: fica
    expect(blocos.find((b) => b.id === deAmanha.id)?.status).toBe("realizado"); // realizado: fica
    expect(blocos.filter((b) => horaLocal(b.inicio) === "12:30").map((b) => dataLocal(b.inicio))).toContain(HOJE);
    expect(blocos.filter((b) => dataLocal(b.inicio) === "2026-11-09")).toHaveLength(1);
  });

  it("arquivar remove os futuros planejados e recuperar gera de novo", async () => {
    const c = await preparar();
    const almoco = await c.s.rotinas.criar(rotinaAlmoco(c.area));
    await c.s.rotinas.excluir(almoco.id);
    expect((await c.s.blocosTempo.listar()).filter((b) => b.rotinaId === almoco.id)).toEqual([]);
    await c.s.rotinas.recuperar(almoco.id);
    expect((await c.s.blocosTempo.listar()).filter((b) => b.rotinaId === almoco.id)).toHaveLength(10);
  });

  it("soma o dia da rotina com meta", async () => {
    const c = await preparar();
    const estudo = await c.s.rotinas.criar({ areaId: c.area, nome: "Estudo", tipo: "meta_horas", diasSemana: [1, 2, 3, 4], metaMin: 180 });
    await c.s.agenda.criarBloco({ rotinaId: estudo.id, inicio: em(HOJE, "19:00"), fim: em(HOJE, "20:30"), status: "planejado" });
    const outro = await c.s.agenda.criarBloco({ rotinaId: estudo.id, inicio: em(HOJE, "21:00"), fim: em(HOJE, "21:30"), status: "planejado" });
    await c.s.agenda.criarBloco({ rotinaId: estudo.id, inicio: em("2026-11-06", "19:00"), fim: em("2026-11-06", "20:00"), status: "planejado" });
    expect(await c.s.rotinas.totalDoDia(estudo.id, HOJE)).toBe(120);
    await c.s.agenda.excluirBloco(outro.id);
    expect(await c.s.rotinas.totalDoDia(estudo.id, HOJE)).toBe(90);
  });
});
