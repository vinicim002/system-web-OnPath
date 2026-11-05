import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/i18n";

export interface Horario {
  data: string;
  inicio: string;
  fim: string;
}

/** Data, início e fim, usados por compromissos e blocos. */
export function CamposHorario({ valor, aoMudar, erroFim }: { valor: Horario; aoMudar: (v: Horario) => void; erroFim: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="agenda-data">{t("agenda.data")}</Label>
        <Input id="agenda-data" type="date" value={valor.data} onChange={(e) => aoMudar({ ...valor, data: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="agenda-inicio">{t("agenda.inicio")}</Label>
        <Input id="agenda-inicio" type="time" value={valor.inicio} onChange={(e) => aoMudar({ ...valor, inicio: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="agenda-fim">{t("agenda.fim")}</Label>
        <Input
          id="agenda-fim"
          type="time"
          value={valor.fim}
          aria-invalid={erroFim}
          onChange={(e) => aoMudar({ ...valor, fim: e.target.value })}
        />
      </div>
      {erroFim && <p className="col-span-3 text-pequeno text-cinza-700">{t("agenda.erros.fim")}</p>}
    </div>
  );
}
