import { Plus } from "lucide-react";
import { useSearchParams } from "react-router";

import { TelaBase } from "@/components/TelaBase";
import { Button } from "@/components/ui/button";
import { useTarefas } from "@/dados/consultas";
import { NovaTarefa } from "@/features/tarefas/NovaTarefa";
import { t } from "@/i18n";

export function Tarefas() {
  const [parametros, setParametros] = useSearchParams();
  const aberta = parametros.get("tarefa");
  const { data: tarefas = [] } = useTarefas();

  function abrir(id: string | null) {
    const novos = new URLSearchParams(parametros);
    if (id) novos.set("tarefa", id);
    else novos.delete("tarefa");
    setParametros(novos);
  }

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <TelaBase titulo={t("telas.tarefas.titulo")}>
          <div className="-mt-2 flex">
            <Button onClick={() => abrir("nova")}>
              <Plus />
              {t("tarefas.nova")}
            </Button>
          </div>
          <ul className="flex flex-col divide-y divide-cinza-100">
            {tarefas.map((tarefa) => (
              <li key={tarefa.id} className="px-3 py-2.5">
                {tarefa.titulo}
              </li>
            ))}
          </ul>
        </TelaBase>
      </div>
      {aberta === "nova" && (
        <aside className="w-110 shrink-0 overflow-y-auto border-l bg-branco p-6">
          <NovaTarefa aoCriar={(id) => abrir(id)} aoCancelar={() => abrir(null)} />
        </aside>
      )}
    </div>
  );
}
