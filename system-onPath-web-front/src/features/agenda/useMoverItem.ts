import { toast } from "sonner";

import { useAlterarBloco, useAlterarCompromisso } from "@/dados/consultas";
import type { ItemAgenda } from "@/dados/contratos";
import { t } from "@/i18n";
import { dataLocal, dataPrazo, horaLocal, instanteLocal } from "@/i18n/datas";

import { useSalvarComConflito } from "./useSalvarComConflito";

/** Move um item para outro dia mantendo o horário, com a confirmação de conflito (FR-003). */
export function useMoverItem() {
  const alterarBloco = useAlterarBloco();
  const alterarCompromisso = useAlterarCompromisso();
  const conflito = useSalvarComConflito();

  function mover(item: ItemAgenda, data: string) {
    if (dataLocal(item.inicio) === data) return;
    const dados = { inicio: instanteLocal(data, horaLocal(item.inicio)), fim: instanteLocal(data, horaLocal(item.fim)) };
    void conflito.salvar(async (confirmarConflito) => {
      const opcoes = { confirmarConflito };
      if (item.tipo === "compromisso") await alterarCompromisso.mutateAsync({ id: item.id, dados, opcoes });
      else await alterarBloco.mutateAsync({ id: item.id, dados, opcoes });
      toast(t("agenda.movido", { dia: dataPrazo(data) }));
    });
  }

  return { mover, conflito };
}
