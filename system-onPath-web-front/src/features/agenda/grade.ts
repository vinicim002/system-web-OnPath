import type { ItemAgenda } from "@/dados/contratos";
import { minutosNoDia } from "@/i18n/datas";

/** Janela visível da grade: das 6h às 24h (spec, premissas). */
export const HORA_INICIO = 6;
export const HORA_FIM = 24;
export const PX_POR_HORA = 48;

export interface ItemPosicionado {
  item: ItemAgenda;
  topo: number;
  altura: number;
  faixa: number;
  faixas: number;
}

/** Posição em pixels de cada item do dia e divisão da largura entre os que se sobrepõem. */
export function posicionar(itens: ItemAgenda[]): ItemPosicionado[] {
  const minimo = HORA_INICIO * 60;
  const maximo = HORA_FIM * 60;
  const ordenados = [...itens].sort((a, b) => a.inicio.localeCompare(b.inicio) || b.fim.localeCompare(a.fim));
  const resultado: ItemPosicionado[] = [];
  let grupo: ItemPosicionado[] = [];
  let fimDoGrupo = "";
  const fecharGrupo = () => {
    const faixas = Math.max(1, ...grupo.map((p) => p.faixa + 1));
    for (const p of grupo) p.faixas = faixas;
    resultado.push(...grupo);
    grupo = [];
  };
  for (const item of ordenados) {
    if (grupo.length > 0 && item.inicio >= fimDoGrupo) fecharGrupo();
    const ocupadas = new Set(grupo.filter((p) => p.item.fim > item.inicio).map((p) => p.faixa));
    let faixa = 0;
    while (ocupadas.has(faixa)) faixa++;
    const inicio = Math.max(minutosNoDia(item.inicio), minimo);
    const fimMin = minutosNoDia(item.fim) || maximo;
    const fim = Math.min(Math.max(fimMin, inicio + 15), maximo);
    grupo.push({
      item,
      topo: ((inicio - minimo) * PX_POR_HORA) / 60,
      altura: Math.max(((fim - inicio) * PX_POR_HORA) / 60, 18),
      faixa,
      faixas: 1,
    });
    fimDoGrupo = fimDoGrupo > item.fim ? fimDoGrupo : item.fim;
  }
  if (grupo.length > 0) fecharGrupo();
  return resultado;
}

/** Hora HH:mm a partir de um clique na coluna, arredondada para a meia hora. */
export function horaDoClique(deslocamentoY: number): string {
  const minutos = HORA_INICIO * 60 + Math.floor(((deslocamentoY / PX_POR_HORA) * 60) / 30) * 30;
  const limitado = Math.min(Math.max(minutos, HORA_INICIO * 60), HORA_FIM * 60 - 30);
  return `${String(Math.floor(limitado / 60)).padStart(2, "0")}:${String(limitado % 60).padStart(2, "0")}`;
}
