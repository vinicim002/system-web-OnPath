import { toast } from "sonner";

import { useCriarBloco } from "@/dados/consultas";
import { t } from "@/i18n";
import { instanteLocal } from "@/i18n/datas";

import { useSalvarComConflito } from "./useSalvarComConflito";
import { intervaloDaTarefa } from "./visoes";

/** Cria o bloco de uma tarefa solta na grade, com o tempo estimado e a confirmação de conflito (FR-005). */
export function useReservarTarefa() {
  const criarBloco = useCriarBloco();
  const conflito = useSalvarComConflito();

  function reservar(tarefa: { tarefaId: string; titulo: string; estimadoMin: number | null }, data: string, hora: string) {
    const { inicio, fim } = intervaloDaTarefa(hora, tarefa.estimadoMin);
    void conflito.salvar(async (confirmarConflito) => {
      await criarBloco.mutateAsync({
        dados: { tarefaId: tarefa.tarefaId, inicio: instanteLocal(data, inicio), fim: instanteLocal(data, fim), status: "planejado" },
        opcoes: { confirmarConflito },
      });
      toast(t("agenda.painel.reservado", { titulo: tarefa.titulo }));
    });
  }

  return { reservar, conflito };
}
