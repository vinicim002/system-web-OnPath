import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useAlterarCompromisso,
  useArquivarCompromisso,
  useExcluirBloco,
  useMarcarRealizado,
  useRecuperarCompromisso,
} from "@/dados/consultas";
import type { ItemAgenda } from "@/dados/contratos";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";
import { dataLocal, dataPrazo, horaLocal, instanteLocal } from "@/i18n/datas";

import { ConfirmarConflito } from "./ConfirmarConflito";
import { FormularioCompromisso } from "./FormularioCompromisso";
import { useSalvarComConflito } from "./useSalvarComConflito";

interface Props {
  item: ItemAgenda | null;
  aoFechar: () => void;
}

/** Ações de um item da agenda: editar e arquivar compromisso; concluir e excluir bloco (FR-011). */
export function DetalheItem({ item, aoFechar }: Props) {
  const alterar = useAlterarCompromisso();
  const arquivar = useArquivarCompromisso();
  const recuperar = useRecuperarCompromisso();
  const realizado = useMarcarRealizado();
  const excluir = useExcluirBloco();
  const conflito = useSalvarComConflito();
  const [editando, setEditando] = useState(false);

  if (!item) return null;
  const quando = `${dataPrazo(dataLocal(item.inicio))}, ${horaLocal(item.inicio)}–${horaLocal(item.fim)}`;

  async function executar(acao: () => Promise<unknown>, aviso: string, comDesfazer?: () => Promise<unknown>) {
    try {
      await acao();
      aoFechar();
      toast(aviso, comDesfazer && {
        duration: 5000,
        action: { label: t("agenda.avisos.desfazer"), onClick: () => comDesfazer().catch(avisarErro) },
      });
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <>
      <Dialog
        open
        onOpenChange={(aberto) => {
          if (!aberto) {
            setEditando(false);
            aoFechar();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{item.titulo}</DialogTitle>
            <DialogDescription>
              {[quando, item.local, item.status === "realizado" ? t("agenda.realizado") : null].filter(Boolean).join(" · ")}
            </DialogDescription>
          </DialogHeader>

          {item.tipo === "compromisso" && editando ? (
            <FormularioCompromisso
              valoresIniciais={{
                titulo: item.titulo,
                areaId: item.areaId ?? "",
                local: item.local ?? "",
                data: dataLocal(item.inicio),
                inicio: horaLocal(item.inicio),
                fim: horaLocal(item.fim),
              }}
              rotuloSalvar={t("agenda.salvar")}
              aoCancelar={() => setEditando(false)}
              aoSalvar={(v) =>
                conflito.salvar(async (confirmarConflito) => {
                  await alterar.mutateAsync({
                    id: item.id,
                    dados: {
                      titulo: v.titulo,
                      areaId: v.areaId,
                      local: v.local.trim() || null,
                      inicio: instanteLocal(v.data, v.inicio),
                      fim: instanteLocal(v.data, v.fim),
                    },
                    opcoes: { confirmarConflito },
                  });
                  toast(t("agenda.avisos.salvo"));
                  setEditando(false);
                  aoFechar();
                })
              }
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {item.tipo === "compromisso" ? (
                <>
                  <Button variant="outline" onClick={() => setEditando(true)}>
                    {t("agenda.editar")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      void executar(() => arquivar.mutateAsync(item.id), t("agenda.avisos.arquivado"), () => recuperar.mutateAsync(item.id))
                    }
                  >
                    {t("agenda.arquivar")}
                  </Button>
                </>
              ) : (
                <>
                  {item.status !== "realizado" && (
                    <Button variant="outline" onClick={() => void executar(() => realizado.mutateAsync(item.id), t("agenda.avisos.realizado"))}>
                      {t("agenda.marcarRealizado")}
                    </Button>
                  )}
                  {item.tarefaId && (
                    <Button variant="ghost" asChild>
                      <Link to={`/tarefas?tarefa=${item.tarefaId}`}>{t("agenda.tarefa")}</Link>
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => void executar(() => excluir.mutateAsync(item.id), t("agenda.avisos.excluido"))}>
                    {t("agenda.excluir")}
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmarConflito ocupantes={conflito.ocupantes} aoConfirmar={conflito.confirmar} aoVoltar={conflito.voltar} />
    </>
  );
}
