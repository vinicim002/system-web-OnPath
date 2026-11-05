import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAdicionarAoDia, useTarefas } from "@/dados/consultas";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";

interface Props {
  data: string;
  /** Tarefas que já estão no dia. */
  noDia: Set<string>;
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
}

/** Escolher tarefas abertas para o dia, com busca pelo título (FR-002). */
export function AdicionarAoDia({ data, noDia, aberto, aoMudar }: Props) {
  const { data: abertas = [] } = useTarefas();
  const adicionar = useAdicionarAoDia();
  const [busca, setBusca] = useState("");
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());

  const disponiveis = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return abertas.filter(
      (tarefa) => !noDia.has(tarefa.id) && (termo === "" || tarefa.titulo.toLocaleLowerCase("pt-BR").includes(termo)),
    );
  }, [abertas, noDia, busca]);

  function alternar(id: string) {
    setMarcadas((atuais) => {
      const novas = new Set(atuais);
      if (novas.has(id)) novas.delete(id);
      else novas.add(id);
      return novas;
    });
  }

  async function confirmar() {
    try {
      // Mantém a ordem da lista de tarefas, não a ordem dos cliques.
      const ids = abertas.filter((tarefa) => marcadas.has(tarefa.id)).map((tarefa) => tarefa.id);
      await adicionar.mutateAsync({ data, tarefaIds: ids });
      toast(t("hoje.avisos.adicionadas"));
      setMarcadas(new Set());
      setBusca("");
      aoMudar(false);
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={aoMudar}>
      <DialogContent className="flex max-h-[85vh] flex-col">
        <DialogHeader>
          <DialogTitle>{t("hoje.adicionarTitulo")}</DialogTitle>
          <DialogDescription className="sr-only">{t("hoje.buscar")}</DialogDescription>
        </DialogHeader>
        <Input
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder={t("hoje.buscar")}
          aria-label={t("hoje.buscar")}
          autoFocus
        />
        <ul className="-mx-2 min-h-0 flex-1 overflow-y-auto">
          {disponiveis.length === 0 && <li className="px-2 py-3 text-cinza-600">{t("hoje.nenhumaDisponivel")}</li>}
          {disponiveis.map((tarefa) => (
            <li key={tarefa.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-cinza-50">
                <Checkbox checked={marcadas.has(tarefa.id)} onCheckedChange={() => alternar(tarefa.id)} />
                <span className="min-w-0 flex-1 truncate">{tarefa.titulo}</span>
                <span className="shrink-0 text-pequeno text-cinza-500">
                  {t(`tarefas.prioridades.${tarefa.prioridade}`)}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button onClick={() => void confirmar()} disabled={marcadas.size === 0 || adicionar.isPending}>
            {t("hoje.adicionarQuantidade", { quantidade: marcadas.size })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
