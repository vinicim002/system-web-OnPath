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
import type { Ocupante } from "@/dados/contratos";
import { t } from "@/i18n";
import { horaLocal } from "@/i18n/datas";

interface Props {
  ocupantes: Ocupante[] | null;
  aoConfirmar: () => void;
  aoVoltar: () => void;
}

/** Horário ocupado: mostra o que ocupa e grava só com confirmação (RN09). */
export function ConfirmarConflito({ ocupantes, aoConfirmar, aoVoltar }: Props) {
  return (
    <AlertDialog open={ocupantes !== null} onOpenChange={(aberto) => !aberto && aoVoltar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("agenda.conflito.titulo")}</AlertDialogTitle>
          <AlertDialogDescription>{t("agenda.conflito.descricao")}</AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="flex flex-col gap-1 text-sm">
          {ocupantes?.map((o) => (
            <li key={o.id} className="flex justify-between gap-3 rounded-md bg-cinza-50 px-3 py-2">
              <span className="truncate">{o.titulo}</span>
              <span className="shrink-0 text-cinza-500 tabular-nums">
                {horaLocal(o.inicio)}–{horaLocal(o.fim)}
              </span>
            </li>
          ))}
        </ul>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("agenda.conflito.voltar")}</AlertDialogCancel>
          <AlertDialogAction onClick={aoConfirmar}>{t("agenda.conflito.confirmar")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
