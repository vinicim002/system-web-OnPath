import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Prioridade } from "@/dados/tipos";
import { t } from "@/i18n";

export interface ValoresProximaAcao {
  titulo: string;
  prioridade: Prioridade;
  tempoEstimadoMin: string;
}

const esquema = z.object({
  titulo: z.string().trim().min(1, { message: t("tarefas.erros.titulo") }),
  prioridade: z.enum(["alta", "media", "baixa"]),
  tempoEstimadoMin: z.string().regex(/^[1-9]\d*$/, { message: t("tarefas.erros.tempoEstimadoMin") }),
});

interface Props {
  aberto: boolean;
  projeto: string;
  prioridade: Prioridade;
  aoCriar: (valores: ValoresProximaAcao) => Promise<void>;
  aoFechar: () => void;
}

/** Recusa por falta de próxima ação: criar a tarefa e ativar (RN08, FR-013). */
export function ProximaAcao({ aberto, projeto, prioridade, aoCriar, aoFechar }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ValoresProximaAcao>({
    resolver: zodResolver(esquema),
    defaultValues: { titulo: "", prioridade, tempoEstimadoMin: "" },
  });

  return (
    <Dialog open={aberto} onOpenChange={(valor) => !valor && aoFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("projetos.proximaAcao.titulo", { projeto })}</DialogTitle>
          <DialogDescription>{t("projetos.proximaAcao.descricao")}</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(aoCriar)} noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proxima-titulo">{t("tarefas.campos.titulo")}</Label>
            <Input id="proxima-titulo" autoComplete="off" autoFocus aria-invalid={errors.titulo !== undefined} {...register("titulo")} />
            {errors.titulo && <p className="text-pequeno text-cinza-700">{errors.titulo.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proxima-prioridade">{t("tarefas.campos.prioridade")}</Label>
              <Controller
                control={control}
                name="prioridade"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="proxima-prioridade" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["alta", "media", "baixa"] as const).map((p) => (
                        <SelectItem key={p} value={p}>
                          {t(`tarefas.prioridades.${p}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proxima-tempo">{t("tarefas.campos.tempo")}</Label>
              <Input
                id="proxima-tempo"
                type="number"
                min={1}
                step={1}
                aria-invalid={errors.tempoEstimadoMin !== undefined}
                {...register("tempoEstimadoMin")}
              />
              {errors.tempoEstimadoMin && <p className="text-pequeno text-cinza-700">{errors.tempoEstimadoMin.message}</p>}
            </div>
          </div>
          <div>
            <Button type="submit" disabled={isSubmitting}>
              {t("projetos.proximaAcao.criar")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
