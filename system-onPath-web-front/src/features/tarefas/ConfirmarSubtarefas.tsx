import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { t } from "@/i18n";

import type { PedidoConfirmacao } from "./acoes";

/** Confirmação ao concluir uma tarefa com subtarefas abertas (FR-013). */
export function ConfirmarSubtarefas({ pedido }: { pedido: PedidoConfirmacao | null }) {
  return (
    <AlertDialog open={pedido !== null} onOpenChange={(aberto) => !aberto && pedido?.cancelar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("tarefas.confirmarSubtarefas.titulo")}</AlertDialogTitle>
          <AlertDialogDescription>
            {pedido?.quantidade === 1
              ? t("tarefas.confirmarSubtarefas.descricaoUma")
              : t("tarefas.confirmarSubtarefas.descricao", { quantidade: pedido?.quantidade ?? 0 })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("tarefas.confirmarSubtarefas.cancelar")}</AlertDialogCancel>
          <AlertDialogAction onClick={() => pedido?.confirmar()}>
            {t("tarefas.confirmarSubtarefas.confirmar")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
