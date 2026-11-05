import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRotinas, useTarefas } from "@/dados/consultas";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";

import { CamposHorario, type Horario } from "./CamposHorario";

export interface ValoresBloco extends Horario {
  alvo: "tarefa" | "rotina";
  tarefaId: string;
  rotinaId: string;
}

interface Props {
  valoresIniciais: ValoresBloco;
  aoSalvar: (valores: ValoresBloco) => Promise<string[]>;
  aoCancelar: () => void;
}

/** O que o bloco reserva (tarefa aberta ou rotina com meta) e o horário (FR-001). */
export function FormularioBloco({ valoresIniciais, aoSalvar, aoCancelar }: Props) {
  const { data: tarefas = [] } = useTarefas();
  const { data: rotinas = [] } = useRotinas();
  const comMeta = rotinas.filter((r) => r.tipo === "meta_horas");
  const [valores, setValores] = useState(valoresIniciais);
  const [invalidos, setInvalidos] = useState<string[]>([]);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const campos: string[] = [];
    if (valores.alvo === "tarefa" && !valores.tarefaId) campos.push("tarefaId");
    if (valores.alvo === "rotina" && !valores.rotinaId) campos.push("rotinaId");
    if (!valores.fim || valores.fim <= valores.inicio) campos.push("fim");
    if (campos.length > 0) {
      setInvalidos(campos);
      return;
    }
    setInvalidos(await aoSalvar(valores));
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => void enviar(e)} noValidate>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">{t("agenda.reservarPara")}</legend>
        <div role="radiogroup" className="flex gap-1 rounded-md bg-cinza-100 p-1">
          {(["tarefa", "rotina", "sessao"] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              role="radio"
              aria-checked={valores.alvo === opcao}
              disabled={opcao === "sessao"}
              onClick={() => opcao !== "sessao" && setValores({ ...valores, alvo: opcao })}
              className={cn(
                "flex-1 rounded-sm px-3 py-1.5 text-sm text-cinza-600 disabled:opacity-50",
                valores.alvo === opcao && "bg-branco font-medium text-preto shadow-xs",
              )}
            >
              {t(`agenda.${opcao}`)}
            </button>
          ))}
        </div>
        <p className="text-pequeno text-cinza-500">{t("agenda.sessaoEmBreve")}</p>
      </fieldset>

      {valores.alvo === "tarefa" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bloco-tarefa">{t("agenda.tarefa")}</Label>
          <Select value={valores.tarefaId || undefined} onValueChange={(tarefaId) => setValores({ ...valores, tarefaId })}>
            <SelectTrigger id="bloco-tarefa" className="w-full" aria-invalid={invalidos.includes("tarefaId")}>
              <SelectValue placeholder={t("agenda.escolherTarefa")} />
            </SelectTrigger>
            <SelectContent>
              {tarefas.map((tarefa) => (
                <SelectItem key={tarefa.id} value={tarefa.id}>
                  {tarefa.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {invalidos.includes("tarefaId") && <p className="text-pequeno text-cinza-700">{t("agenda.erros.tarefaId")}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bloco-rotina">{t("agenda.rotina")}</Label>
          <Select value={valores.rotinaId || undefined} onValueChange={(rotinaId) => setValores({ ...valores, rotinaId })}>
            <SelectTrigger id="bloco-rotina" className="w-full" aria-invalid={invalidos.includes("rotinaId")}>
              <SelectValue placeholder={t("agenda.escolherRotina")} />
            </SelectTrigger>
            <SelectContent>
              {comMeta.map((rotina) => (
                <SelectItem key={rotina.id} value={rotina.id}>
                  {rotina.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {comMeta.length === 0 && <p className="text-pequeno text-cinza-500">{t("agenda.semRotinasMeta")}</p>}
          {invalidos.includes("rotinaId") && <p className="text-pequeno text-cinza-700">{t("agenda.erros.rotinaId")}</p>}
        </div>
      )}

      <CamposHorario valor={valores} aoMudar={(h) => setValores({ ...valores, ...h })} erroFim={invalidos.includes("fim")} />
      <div className="flex gap-2">
        <Button type="submit">{t("agenda.criar")}</Button>
        <Button type="button" variant="outline" onClick={aoCancelar}>
          {t("agenda.cancelar")}
        </Button>
      </div>
    </form>
  );
}
