import { describe, expect, it } from "vitest";

import type { ItemAgenda } from "@/dados/contratos";
import type { Tarefa } from "@/dados/tipos";
import {
  agruparPorPrazo,
  escreverFiltro,
  filtrarItens,
  FILTRO_VAZIO,
  horaDoSoltar,
  intervaloDaTarefa,
  lerFiltro,
  ordenarItens,
} from "@/features/agenda/visoes";

const item = (campos: Partial<ItemAgenda> & Pick<ItemAgenda, "id">): ItemAgenda => ({
  tipo: "bloco",
  titulo: campos.id,
  areaId: "a1",
  inicio: "2026-11-05T12:00:00.000Z",
  fim: "2026-11-05T13:00:00.000Z",
  ...campos,
});

const reuniao = item({ id: "Reunião", tipo: "compromisso", areaId: "a2", inicio: "2026-11-05T15:00:00.000Z", fim: "2026-11-05T15:30:00.000Z" });
const relatorio = item({ id: "Relatório", tarefaId: "t1", status: "planejado", inicio: "2026-11-04T12:00:00.000Z", fim: "2026-11-04T14:00:00.000Z" });
const almoco = item({ id: "Almoço", rotinaId: "r1", status: "realizado" });
const itens = [reuniao, relatorio, almoco];

describe("filtro da agenda", () => {
  it("vazio mostra tudo; combina tipo, área e status", () => {
    expect(filtrarItens(itens, FILTRO_VAZIO)).toEqual(itens);
    expect(filtrarItens(itens, { ...FILTRO_VAZIO, tipos: ["compromisso"] })).toEqual([reuniao]);
    expect(filtrarItens(itens, { ...FILTRO_VAZIO, tipos: ["tarefa", "rotina"] })).toEqual([relatorio, almoco]);
    expect(filtrarItens(itens, { ...FILTRO_VAZIO, areas: ["a1"] })).toEqual([relatorio, almoco]);
    // O status só vale para blocos; compromissos passam.
    expect(filtrarItens(itens, { ...FILTRO_VAZIO, status: ["realizado"] })).toEqual([reuniao, almoco]);
  });

  it("vai e volta pelo endereço", () => {
    const filtro = { tipos: ["tarefa" as const], areas: ["a1", "a2"], status: [] };
    const parametros = escreverFiltro(new URLSearchParams("semana=2026-11-02"), filtro);
    expect(parametros.toString()).toBe("semana=2026-11-02&tipos=tarefa&areas=a1%2Ca2");
    expect(lerFiltro(parametros)).toEqual(filtro);
    expect(lerFiltro(new URLSearchParams("tipos=x,tarefa&status=perdido"))).toEqual({ tipos: ["tarefa"], areas: [], status: ["perdido"] });
    expect(escreverFiltro(parametros, FILTRO_VAZIO).toString()).toBe("semana=2026-11-02");
  });
});

describe("tabela", () => {
  it("ordena por coluna nos dois sentidos", () => {
    expect(ordenarItens(itens, "inicio", "asc").map((i) => i.id)).toEqual(["Relatório", "Almoço", "Reunião"]);
    expect(ordenarItens(itens, "duracao", "desc").map((i) => i.id)).toEqual(["Relatório", "Almoço", "Reunião"]);
    expect(ordenarItens(itens, "titulo", "asc").map((i) => i.id)).toEqual(["Almoço", "Relatório", "Reunião"]);
    expect(ordenarItens(itens, "tipo", "asc").map((i) => i.id)).toEqual(["Reunião", "Relatório", "Almoço"]);
  });
});

describe("painel de tarefas", () => {
  const tarefa = (titulo: string, prazo: string | null, prioridade: Tarefa["prioridade"] = "media") =>
    ({ id: titulo, titulo, prazo, prioridade }) as Tarefa;

  it("agrupa pelo prazo a partir de hoje (quinta, 5 de novembro)", () => {
    const grupos = agruparPorPrazo(
      [
        tarefa("sem", null),
        tarefa("ontem", "2026-11-04"),
        tarefa("domingo", "2026-11-08"),
        tarefa("hoje baixa", "2026-11-05", "baixa"),
        tarefa("hoje alta", "2026-11-05", "alta"),
        tarefa("fim do mês", "2026-11-30"),
        tarefa("dezembro", "2026-12-01"),
      ],
      "2026-11-05",
    );
    const titulos = Object.fromEntries(Object.entries(grupos).map(([g, lista]) => [g, lista.map((t) => t.titulo)]));
    expect(titulos).toEqual({
      atrasadas: ["ontem"],
      semana: ["hoje alta", "hoje baixa", "domingo"],
      mes: ["fim do mês"],
      depois: ["dezembro"],
      semPrazo: ["sem"],
    });
  });
});

describe("soltar na grade", () => {
  it("arredonda para 15 minutos dentro da grade", () => {
    expect(horaDoSoltar(0)).toBe("06:00");
    expect(horaDoSoltar(48 * 8 + 20)).toBe("14:15");
    expect(horaDoSoltar(-30)).toBe("06:00");
    expect(horaDoSoltar(48 * 30)).toBe("23:45");
  });

  it("usa o tempo estimado e não passa da meia-noite", () => {
    expect(intervaloDaTarefa("14:00", 120)).toEqual({ inicio: "14:00", fim: "16:00" });
    expect(intervaloDaTarefa("14:00", null)).toEqual({ inicio: "14:00", fim: "15:00" });
    expect(intervaloDaTarefa("23:00", 90)).toEqual({ inicio: "23:00", fim: "23:45" });
    expect(intervaloDaTarefa("23:45", 30)).toEqual({ inicio: "23:30", fim: "23:45" });
  });
});
