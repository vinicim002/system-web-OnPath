import type { ItemAgenda } from "@/dados/contratos";
import { t } from "@/i18n";
import { duracao, horaLocal } from "@/i18n/datas";

import { tipoDoItem } from "./visoes";

/** Funções da tela para nome e cor da área, passadas às visões. */
export interface Areas {
  nome: (areaId: string | null) => string;
  cor: (areaId: string | null) => string | undefined;
}

export const horarioDoItem = (item: ItemAgenda) => `${horaLocal(item.inicio)}–${horaLocal(item.fim)}`;
export const duracaoDoItem = (item: ItemAgenda) => duracao(Math.round((Date.parse(item.fim) - Date.parse(item.inicio)) / 60_000));
export const tipoCurto = (item: ItemAgenda) => t(`agenda.tipoCurto.${tipoDoItem(item)}`);
export const statusDoItem = (item: ItemAgenda) => (item.status ? t(`agenda.filtro.situacao.${item.status}`) : "");
