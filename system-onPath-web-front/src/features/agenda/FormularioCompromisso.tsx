import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOpcoesTarefa } from "@/dados/consultas";
import { t } from "@/i18n";

import { CamposHorario, type Horario } from "./CamposHorario";

export interface ValoresCompromisso extends Horario {
  titulo: string;
  areaId: string;
  local: string;
}

interface Props {
  valoresIniciais: ValoresCompromisso;
  rotuloSalvar: string;
  /** Devolve os campos inválidos (vazio se gravou ou se foi para a confirmação de conflito). */
  aoSalvar: (valores: ValoresCompromisso) => Promise<string[]>;
  aoCancelar: () => void;
}

/** Título, área, horário e local do compromisso. */
export function FormularioCompromisso({ valoresIniciais, rotuloSalvar, aoSalvar, aoCancelar }: Props) {
  const { data: opcoes } = useOpcoesTarefa();
  const [valores, setValores] = useState(valoresIniciais);
  const [invalidos, setInvalidos] = useState<string[]>([]);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const campos: string[] = [];
    if (valores.titulo.trim() === "") campos.push("titulo");
    if (!valores.areaId) campos.push("areaId");
    if (!valores.fim || valores.fim <= valores.inicio) campos.push("fim");
    if (campos.length > 0) {
      setInvalidos(campos);
      return;
    }
    setInvalidos(await aoSalvar(valores));
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => void enviar(e)} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="compromisso-titulo">{t("agenda.titulo")}</Label>
        <Input
          id="compromisso-titulo"
          autoFocus
          autoComplete="off"
          value={valores.titulo}
          aria-invalid={invalidos.includes("titulo")}
          onChange={(e) => setValores({ ...valores, titulo: e.target.value })}
        />
        {invalidos.includes("titulo") && <p className="text-pequeno text-cinza-700">{t("agenda.erros.titulo")}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="compromisso-area">{t("agenda.area")}</Label>
          <Select value={valores.areaId || undefined} onValueChange={(areaId) => setValores({ ...valores, areaId })}>
            <SelectTrigger id="compromisso-area" className="w-full" aria-invalid={invalidos.includes("areaId")}>
              <SelectValue placeholder={t("agenda.escolherArea")} />
            </SelectTrigger>
            <SelectContent>
              {opcoes?.areas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {invalidos.includes("areaId") && <p className="text-pequeno text-cinza-700">{t("agenda.erros.areaId")}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="compromisso-local">{t("agenda.local")}</Label>
          <Input id="compromisso-local" value={valores.local} onChange={(e) => setValores({ ...valores, local: e.target.value })} />
        </div>
      </div>
      <CamposHorario valor={valores} aoMudar={(h) => setValores({ ...valores, ...h })} erroFim={invalidos.includes("fim")} />
      <div className="flex gap-2">
        <Button type="submit">{rotuloSalvar}</Button>
        <Button type="button" variant="outline" onClick={aoCancelar}>
          {t("agenda.cancelar")}
        </Button>
      </div>
    </form>
  );
}
