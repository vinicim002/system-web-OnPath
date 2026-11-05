import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Servicos } from "@/dados/contratos";
import { ErroOnPath } from "@/dados/erros";
import { criarServicosLocais } from "@/dados/local/servicos";
import { avisarUmaVez } from "@/features/lembretes/avisados";
import { instanteLocal } from "@/i18n/datas";
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
const AMANHA = "2026-11-06";
const ONTEM = "2026-11-04";
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(Date.parse("2026-11-05T12:00:00.000Z"));
});
afterEach(() => vi.useRealTimers());

const em = (data: string, hora: string) => instanteLocal(data, hora);

/** Área, tarefa e a rotina do almoço (12:00, 1 h, de segunda a sexta), já com os blocos. */
async function preparar() {
  const s: Servicos = criarServicosLocais();
  const area = (await s.areas.criar({ nome: "Saúde", cor: TONS_AREA[0]! })).id;
  const tarefa = (await s.tarefas.criar({ titulo: "Relatório", areaId: area, prioridade: "media", tempoEstimadoMin: 60, status: "aberta" })).id;
  const almoco = await s.rotinas.criar({
    areaId: area,
    nome: "Almoço",
    tipo: "horario",
    diasSemana: [1, 2, 3, 4, 5],
    horaInicio: "12:00",
    duracaoMin: 60,
  });
  const blocos = await s.blocosTempo.listar();
  const deHoje = blocos.find((b) => b.rotinaId === almoco.id && b.inicio === em(HOJE, "12:00"))!;
  return { s, area, tarefa, almoco: almoco.id, deHoje };
}

describe("rotina perdida (RN18)", () => {
  it("lista só os blocos de rotina de hoje, planejados e terminados, com a proposta seguinte livre", async () => {
    const c = await preparar();
    expect(await c.s.agenda.rotinasPerdidas(em(HOJE, "12:30"))).toEqual([]);

    const perdidas = await c.s.agenda.rotinasPerdidas(em(HOJE, "13:10"));
    expect(perdidas).toEqual([
      { bloco: expect.objectContaining({ id: c.deHoje.id }), titulo: "Almoço", proposta: { inicio: em(HOJE, "13:30"), fim: em(HOJE, "14:30") } },
    ]);

    // A proposta pula o que já ocupa o horário.
    await c.s.agenda.criarCompromisso({ titulo: "Médico", areaId: c.area, inicio: em(HOJE, "13:30"), fim: em(HOJE, "14:00") });
    await c.s.agenda.criarBloco({ tarefaId: c.tarefa, inicio: em(HOJE, "14:00"), fim: em(HOJE, "15:00"), status: "planejado" });
    const [primeira] = await c.s.agenda.rotinasPerdidas(em(HOJE, "13:10"));
    expect(primeira!.proposta).toEqual({ inicio: em(HOJE, "15:00"), fim: em(HOJE, "16:00") });
  });

  it("ignora blocos de outros dias, realizados e de tarefas", async () => {
    const c = await preparar();
    await c.s.agenda.criarBloco({ rotinaId: c.almoco, inicio: em(ONTEM, "12:00"), fim: em(ONTEM, "13:00"), status: "planejado" }, { confirmarConflito: true });
    await c.s.agenda.criarBloco({ tarefaId: c.tarefa, inicio: em(HOJE, "10:00"), fim: em(HOJE, "11:00"), status: "planejado" });
    await c.s.agenda.marcarRealizado(c.deHoje.id);
    expect(await c.s.agenda.rotinasPerdidas(em(HOJE, "13:10"))).toEqual([]);
  });

  it("respeita a janela do dia: vai para amanhã ou fica sem proposta", async () => {
    const c = await preparar();
    await c.s.preferencias.alterar({ horaInicioDia: "07:00", horaFimDia: "14:00" });
    const [amanha] = await c.s.agenda.rotinasPerdidas(em(HOJE, "13:10"));
    expect(amanha!.proposta).toEqual({ inicio: em(AMANHA, "07:00"), fim: em(AMANHA, "08:00") });

    await c.s.preferencias.alterar({ horaInicioDia: "12:00", horaFimDia: "13:00" });
    const [semProposta] = await c.s.agenda.rotinasPerdidas(em(HOJE, "13:10"));
    expect(semProposta!.proposta).toBeNull();
  });

  it("aceitar remarca o antigo e cria o novo; recusar marca como perdido", async () => {
    const c = await preparar();
    const [perdida] = await c.s.agenda.rotinasPerdidas(em(HOJE, "13:10"));
    const novo = await c.s.agenda.aceitarProposta(c.deHoje.id, perdida!.proposta!);
    expect(novo).toEqual(expect.objectContaining({ rotinaId: c.almoco, status: "planejado", inicio: em(HOJE, "13:30"), fim: em(HOJE, "14:30") }));
    expect((await c.s.blocosTempo.obter(c.deHoje.id)).status).toBe("remarcado");
    const doDia = await c.s.agenda.listarNoIntervalo(em(HOJE, "00:00"), em(AMANHA, "00:00"));
    expect(doDia.map((item) => item.id)).toEqual([novo.id]);
    expect(await c.s.agenda.rotinasPerdidas(em(HOJE, "13:10"))).toEqual([]);

    const outra = await c.s.agenda.criarBloco({ rotinaId: c.almoco, inicio: em(HOJE, "08:00"), fim: em(HOJE, "08:30"), status: "planejado" });
    expect((await c.s.agenda.recusarProposta(outra.id)).status).toBe("perdido");
    expect(await c.s.agenda.rotinasPerdidas(em(HOJE, "13:10"))).toEqual([]);
  });

  it("aceitar num horário que ficou ocupado pede outro", async () => {
    const c = await preparar();
    const [perdida] = await c.s.agenda.rotinasPerdidas(em(HOJE, "13:10"));
    await c.s.agenda.criarCompromisso({ titulo: "Médico", areaId: c.area, inicio: em(HOJE, "13:30"), fim: em(HOJE, "14:00") });
    const erro = await capturarErro(c.s.agenda.aceitarProposta(c.deHoje.id, perdida!.proposta!));
    expect(erro.codigo).toBe("horario_ocupado");
    expect((await c.s.blocosTempo.obter(c.deHoje.id)).status).toBe("planejado");
  });
});

describe("tempo livre (RN10)", () => {
  it("desconta rotinas e compromissos uma vez só e só dentro da janela", async () => {
    const c = await preparar();
    expect(await c.s.agenda.tempoLivre(HOJE)).toEqual({ janelaMin: 960, ocupadoMin: 60, livreMin: 900 });

    await c.s.agenda.criarCompromisso({ titulo: "Médico", areaId: c.area, inicio: em(HOJE, "12:30"), fim: em(HOJE, "13:30") }, { confirmarConflito: true });
    await c.s.agenda.criarCompromisso({ titulo: "Show", areaId: c.area, inicio: em(HOJE, "22:30"), fim: em(HOJE, "23:30") });
    await c.s.agenda.criarBloco({ tarefaId: c.tarefa, inicio: em(HOJE, "15:00"), fim: em(HOJE, "16:00"), status: "planejado" });
    expect(await c.s.agenda.tempoLivre(HOJE)).toEqual({ janelaMin: 960, ocupadoMin: 120, livreMin: 840 });

    await c.s.preferencias.alterar({ horaInicioDia: "08:00", horaFimDia: "18:00" });
    expect(await c.s.agenda.tempoLivre(HOJE)).toEqual({ janelaMin: 600, ocupadoMin: 90, livreMin: 510 });
  });
});

describe("lembretes", () => {
  it("devolve compromissos e blocos planejados que começam dentro da antecedência", async () => {
    const c = await preparar();
    const logo = await c.s.agenda.criarCompromisso({ titulo: "Ligação", areaId: c.area, inicio: em(HOJE, "09:05"), fim: em(HOJE, "09:10") });
    const bloco = await c.s.agenda.criarBloco({ tarefaId: c.tarefa, inicio: em(HOJE, "09:10"), fim: em(HOJE, "09:40"), status: "planejado" });
    await c.s.agenda.criarCompromisso({ titulo: "Depois", areaId: c.area, inicio: em(HOJE, "09:40"), fim: em(HOJE, "10:00") });
    await c.s.agenda.criarCompromisso({ titulo: "Começou", areaId: c.area, inicio: em(HOJE, "08:30"), fim: em(HOJE, "09:05") }, { confirmarConflito: true });
    const feito = await c.s.agenda.criarBloco({ tarefaId: c.tarefa, inicio: em(HOJE, "09:08"), fim: em(HOJE, "09:09"), status: "planejado" }, { confirmarConflito: true });
    await c.s.agenda.marcarRealizado(feito.id);

    const devidos = await c.s.agenda.lembretesDevidos(em(HOJE, "09:00"), 10);
    expect(devidos.map((item) => item.id)).toEqual([logo.id, bloco.id]);
  });

  it("avisa cada item uma vez e esquece os avisos com mais de um dia", () => {
    const agora = Date.parse("2026-11-05T12:00:00.000Z");
    expect(avisarUmaVez("a", "2026-11-05T12:05:00.000Z", agora)).toBe(true);
    expect(avisarUmaVez("a", "2026-11-05T12:05:00.000Z", agora)).toBe(false);
    // O mesmo item em outro horário (compromisso movido) avisa de novo.
    expect(avisarUmaVez("a", "2026-11-05T13:00:00.000Z", agora)).toBe(true);
    const depois = agora + 25 * 60 * 60 * 1000;
    avisarUmaVez("b", "2026-11-06T13:00:00.000Z", depois);
    expect(Object.keys(JSON.parse(localStorage.getItem("onpath:lembretes-avisados")!) as object)).toEqual(["b@2026-11-06T13:00:00.000Z"]);
  });
});

describe("preferências", () => {
  it("tem padrão, altera e recusa janela inválida", async () => {
    const s = criarServicosLocais();
    expect(await s.preferencias.obter()).toEqual({ horaInicioDia: "07:00", horaFimDia: "23:00", lembretesAtivos: false });
    expect(await s.preferencias.alterar({ lembretesAtivos: true })).toEqual({ horaInicioDia: "07:00", horaFimDia: "23:00", lembretesAtivos: true });
    expect((await capturarErro(s.preferencias.alterar({ horaFimDia: "06:00" }))).detalhes.campos).toEqual(["horaFimDia"]);
    expect((await capturarErro(s.preferencias.alterar({ horaInicioDia: "25:00" }))).detalhes.campos).toEqual(["horaInicioDia"]);
    expect((await s.preferencias.obter()).horaFimDia).toBe("23:00");
  });
});
