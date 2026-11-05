import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ErroOnPath } from "@/dados/erros";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { TONS_AREA } from "@/theme";

export interface ValoresArea {
  nome: string;
  cor: string;
}

const esquema = z.object({
  nome: z.string().trim().min(1, { message: t("areas.erros.nome") }),
  cor: z.string().refine((cor) => TONS_AREA.includes(cor), { message: t("areas.erros.cor") }),
});

interface Props {
  valoresIniciais: ValoresArea;
  rotuloSalvar: string;
  /** Devolve o erro do serviço, ou `null` se salvou. */
  aoSalvar: (valores: ValoresArea) => Promise<ErroOnPath | null>;
  aoCancelar?: () => void;
  focar?: boolean;
  somenteComMudancas?: boolean;
}

/** Nome e tom da área (FR-002). */
export function FormularioArea({ valoresIniciais, rotuloSalvar, aoSalvar, aoCancelar, focar, somenteComMudancas }: Props) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ValoresArea>({ resolver: zodResolver(esquema), defaultValues: valoresIniciais });

  useEffect(() => reset(valoresIniciais), [reset, valoresIniciais]);

  async function enviar(valores: ValoresArea) {
    const erro = await aoSalvar(valores);
    if (!erro) {
      reset(valores);
      return;
    }
    const campos = (erro.detalhes.campos as string[] | undefined) ?? [];
    if (erro.codigo === "nome_repetido") setError("nome", { message: erro.mensagem });
    else for (const campo of campos) if (campo === "nome" || campo === "cor") setError(campo, { message: t(`areas.erros.${campo}`) });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(enviar)} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="area-nome">{t("areas.nome")}</Label>
        <Input
          id="area-nome"
          autoComplete="off"
          autoFocus={focar}
          aria-invalid={errors.nome !== undefined}
          aria-describedby={errors.nome ? "area-nome-erro" : undefined}
          {...register("nome")}
        />
        {errors.nome && (
          <p id="area-nome-erro" className="text-pequeno text-cinza-700">
            {errors.nome.message}
          </p>
        )}
      </div>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">{t("areas.tom")}</legend>
        <Controller
          control={control}
          name="cor"
          render={({ field }) => (
            <div role="radiogroup" aria-label={t("areas.tom")} className="flex gap-2">
              {TONS_AREA.map((tom, indice) => (
                <button
                  key={tom}
                  type="button"
                  role="radio"
                  aria-checked={field.value === tom}
                  aria-label={t("areas.tomOpcao", { numero: indice + 1 })}
                  onClick={() => field.onChange(tom)}
                  className={cn(
                    "size-7 rounded-full ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    field.value === tom && "ring-2 ring-preto",
                  )}
                  style={{ backgroundColor: tom }}
                />
              ))}
            </div>
          )}
        />
        {errors.cor && <p className="text-pequeno text-cinza-700">{errors.cor.message}</p>}
      </fieldset>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || (somenteComMudancas && !isDirty)}>
          {rotuloSalvar}
        </Button>
        {aoCancelar && (
          <Button type="button" variant="outline" onClick={aoCancelar}>
            {t("areas.cancelar")}
          </Button>
        )}
      </div>
    </form>
  );
}
