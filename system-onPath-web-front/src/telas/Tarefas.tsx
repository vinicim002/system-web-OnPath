import { Plus } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import { TelaBase } from "@/components/TelaBase";
import { Button } from "@/components/ui/button";
import { useTarefas, useTodasTarefas } from "@/dados/consultas";
import { useAcoesTarefas } from "@/features/tarefas/acoes";
import { ConfirmarSubtarefas } from "@/features/tarefas/ConfirmarSubtarefas";
import { filtrosDoEndereco } from "@/features/tarefas/filtros";
import { FiltrosTarefas } from "@/features/tarefas/FiltrosTarefas";
import { ListaTarefas } from "@/features/tarefas/ListaTarefas";
import { NovaTarefa } from "@/features/tarefas/NovaTarefa";
import { PainelTarefa } from "@/features/tarefas/PainelTarefa";
import { t } from "@/i18n";

/** Tela de Tarefas: lista com filtros e painel lateral (specs/003-tarefas/contracts/interface.md). */
export function Tarefas() {
  const [parametros, setParametros] = useSearchParams();
  const chaveFiltros = parametros.toString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filtros = useMemo(() => filtrosDoEndereco(parametros), [chaveFiltros]);
  const aberta = parametros.get("tarefa");
  const { data: tarefas = [] } = useTarefas(filtros);
  const { data: todas = [] } = useTodasTarefas();
  const { acoes, pedido } = useAcoesTarefas();

  const abrir = useCallback(
    (id: string | null) => {
      setParametros((atuais) => {
        const novos = new URLSearchParams(atuais);
        if (id) novos.set("tarefa", id);
        else novos.delete("tarefa");
        return novos;
      });
    },
    [setParametros],
  );
  const fechar = useCallback(() => abrir(null), [abrir]);

  const tarefaAberta = aberta && aberta !== "nova" ? todas.find((tarefa) => tarefa.id === aberta) : undefined;

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <TelaBase titulo={t("telas.tarefas.titulo")}>
          <div className="-mt-2 flex flex-col gap-3">
            <div>
              <Button onClick={() => abrir("nova")}>
                <Plus />
                {t("tarefas.nova")}
              </Button>
            </div>
            <FiltrosTarefas filtros={filtros} />
          </div>
          <ListaTarefas tarefas={tarefas} selecionada={aberta} acoes={acoes} aoAbrir={abrir} />
        </TelaBase>
      </div>

      {(aberta === "nova" || tarefaAberta) && (
        <aside className="w-110 shrink-0 overflow-y-auto border-l bg-branco p-6">
          {aberta === "nova" ? (
            <NovaTarefa aoCriar={abrir} aoCancelar={fechar} />
          ) : (
            tarefaAberta && (
              <PainelTarefa tarefa={tarefaAberta} todas={todas} acoes={acoes} aoFechar={fechar} aoAbrir={abrir} />
            )
          )}
        </aside>
      )}

      <ConfirmarSubtarefas pedido={pedido} />
    </div>
  );
}
