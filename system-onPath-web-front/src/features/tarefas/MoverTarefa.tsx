import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMoverTarefa } from "@/dados/consultas";
import { ehErroOnPath } from "@/dados/erros";
import { idsDaArvore, ordenarTarefas } from "@/dados/regrasTarefas";
import type { Tarefa } from "@/dados/tipos";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";

const TOPO = "_topo";

interface Props {
  tarefa: Tarefa;
  todas: Tarefa[];
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
}

/** Escolher a nova tarefa principal, ou tornar esta uma tarefa principal (FR-012). */
export function MoverTarefa({ tarefa, todas, aberto, aoMudar }: Props) {
  const mover = useMoverTarefa();
  const [destino, setDestino] = useState<string>(tarefa.tarefaPaiId ? TOPO : "");
  const [tempo, setTempo] = useState(tarefa.tempoEstimadoMin ? String(tarefa.tempoEstimadoMin) : "");
  const [erroTempo, setErroTempo] = useState<string | null>(null);

  // A própria tarefa e as descendentes ficam de fora, para não formar ciclo.
  const candidatas = useMemo(() => {
    const proibidas = idsDaArvore(tarefa.id, todas);
    return ordenarTarefas(todas.filter((t) => !proibidas.has(t.id) && t.status === "aberta"));
  }, [tarefa.id, todas]);

  const precisaTempo = destino === TOPO;

  async function confirmar() {
    if (!destino) return;
    const tempoNumero = tempo.trim() === "" ? null : Number(tempo);
    if (precisaTempo && (tempoNumero === null || !Number.isInteger(tempoNumero) || tempoNumero < 1)) {
      setErroTempo(t("tarefas.erros.tempoEstimadoMin"));
      return;
    }
    try {
      await mover.mutateAsync({
        id: tarefa.id,
        tarefaPaiId: destino === TOPO ? null : destino,
        tempoEstimadoMin: tempoNumero,
      });
      toast(t("tarefas.avisos.movida"));
      aoMudar(false);
    } catch (erro) {
      if (ehErroOnPath(erro) && erro.codigo === "dados_invalidos") {
        setErroTempo(t("tarefas.erros.tempoEstimadoMin"));
        return;
      }
      avisarErro(erro);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={aoMudar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("tarefas.mover.titulo")}</DialogTitle>
          <DialogDescription>{t("tarefas.mover.descricao")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Select value={destino || undefined} onValueChange={setDestino}>
            <SelectTrigger className="w-full" aria-label={t("tarefas.mover.buscar")}>
              <SelectValue placeholder={t("tarefas.mover.buscar")} />
            </SelectTrigger>
            <SelectContent>
              {tarefa.tarefaPaiId && <SelectItem value={TOPO}>{t("tarefas.mover.paraTopo")}</SelectItem>}
              {candidatas
                .filter((c) => c.id !== tarefa.tarefaPaiId)
                .map((candidata) => (
                  <SelectItem key={candidata.id} value={candidata.id}>
                    {candidata.titulo}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {precisaTempo && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mover-tempo">{t("tarefas.campos.tempo")}</Label>
              <Input
                id="mover-tempo"
                type="number"
                min={1}
                step={1}
                value={tempo}
                onChange={(evento) => {
                  setTempo(evento.target.value);
                  setErroTempo(null);
                }}
                aria-invalid={erroTempo !== null}
              />
              <p className="text-pequeno text-cinza-600">{erroTempo ?? t("tarefas.mover.pedirTempo")}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => void confirmar()} disabled={!destino || mover.isPending}>
            {t("tarefas.mover.confirmar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
