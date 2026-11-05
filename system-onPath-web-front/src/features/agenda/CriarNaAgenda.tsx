import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCriarBloco, useCriarCompromisso } from "@/dados/consultas";
import { t } from "@/i18n";
import { instanteLocal } from "@/i18n/datas";

import { ConfirmarConflito } from "./ConfirmarConflito";
import { FormularioBloco } from "./FormularioBloco";
import { FormularioCompromisso } from "./FormularioCompromisso";
import { useSalvarComConflito } from "./useSalvarComConflito";

function maisUmaHora(hora: string): string {
  const [h, m] = hora.split(":").map(Number);
  return `${String(Math.min(h! + 1, 23)).padStart(2, "0")}:${String(h! + 1 > 23 ? 59 : m!).padStart(2, "0")}`;
}

interface Props {
  inicial: { data: string; hora: string } | null;
  aoFechar: () => void;
}

/** Criar compromisso ou bloco a partir de um horário clicado na grade (FR-011). */
export function CriarNaAgenda({ inicial, aoFechar }: Props) {
  const criarCompromisso = useCriarCompromisso();
  const criarBloco = useCriarBloco();
  const conflito = useSalvarComConflito();

  if (!inicial) return null;
  const horario = { data: inicial.data, inicio: inicial.hora, fim: maisUmaHora(inicial.hora) };
  const intervalo = (v: { data: string; inicio: string; fim: string }) => ({
    inicio: instanteLocal(v.data, v.inicio),
    fim: instanteLocal(v.data, v.fim),
  });

  return (
    <>
      <Dialog open onOpenChange={(aberto) => !aberto && aoFechar()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("agenda.criarTitulo")}</DialogTitle>
            <DialogDescription className="sr-only">{t("agenda.criarTitulo")}</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="compromisso" className="gap-4">
            <TabsList>
              <TabsTrigger value="compromisso">{t("agenda.compromisso")}</TabsTrigger>
              <TabsTrigger value="bloco">{t("agenda.bloco")}</TabsTrigger>
            </TabsList>
            <TabsContent value="compromisso">
              <FormularioCompromisso
                valoresIniciais={{ ...horario, titulo: "", areaId: "", local: "" }}
                rotuloSalvar={t("agenda.criar")}
                aoCancelar={aoFechar}
                aoSalvar={(v) =>
                  conflito.salvar(async (confirmarConflito) => {
                    await criarCompromisso.mutateAsync({
                      dados: { titulo: v.titulo, areaId: v.areaId, local: v.local.trim() || null, ...intervalo(v) },
                      opcoes: { confirmarConflito },
                    });
                    toast(t("agenda.avisos.criado"));
                    aoFechar();
                  })
                }
              />
            </TabsContent>
            <TabsContent value="bloco">
              <FormularioBloco
                valoresIniciais={{ ...horario, alvo: "tarefa", tarefaId: "", rotinaId: "" }}
                aoCancelar={aoFechar}
                aoSalvar={(v) =>
                  conflito.salvar(async (confirmarConflito) => {
                    await criarBloco.mutateAsync({
                      dados: {
                        tarefaId: v.alvo === "tarefa" ? v.tarefaId : null,
                        rotinaId: v.alvo === "rotina" ? v.rotinaId : null,
                        status: "planejado",
                        ...intervalo(v),
                      },
                      opcoes: { confirmarConflito },
                    });
                    toast(t("agenda.avisos.criado"));
                    aoFechar();
                  })
                }
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <ConfirmarConflito ocupantes={conflito.ocupantes} aoConfirmar={conflito.confirmar} aoVoltar={conflito.voltar} />
    </>
  );
}
