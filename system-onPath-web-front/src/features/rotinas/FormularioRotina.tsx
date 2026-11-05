import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOpcoesTarefa } from "@/dados/consultas";
import type { ErroOnPath } from "@/dados/erros";
import { t, type ChaveTexto } from "@/i18n";
import { cn } from "@/lib/utils";

import { DIAS, nomeDoDia } from "./dias";

export interface ValoresRotina {
  nome: string;
  areaId: string;
  tipo: "horario" | "meta_horas";
  diasSemana: number[];
  horaInicio: string;
  duracaoMin: string;
  metaMin: string;
}

const esquema = z
  .object({
    nome: z.string().trim().min(1, { message: t("rotinas.erros.nome") }),
    areaId: z.string().min(1, { message: t("rotinas.erros.areaId") }),
    tipo: z.enum(["horario", "meta_horas"]),
    diasSemana: z.array(z.number()).min(1, { message: t("rotinas.erros.diasSemana") }),
    horaInicio: z.string(),
    duracaoMin: z.string(),
    metaMin: z.string(),
  })
  .superRefine((v, ctx) => {
    const problema = (path: keyof ValoresRotina, chave: ChaveTexto) => ctx.addIssue({ code: "custom", path: [path], message: t(chave) });
    if (v.tipo === "horario" && !v.horaInicio) problema("horaInicio", "rotinas.erros.horaInicio");
    if (v.tipo === "horario" && v.duracaoMin && !/^[1-9]\d*$/.test(v.duracaoMin)) problema("duracaoMin", "rotinas.erros.duracaoMin");
    if (v.tipo === "meta_horas" && !/^[1-9]\d*$/.test(v.metaMin)) problema("metaMin", "rotinas.erros.metaMin");
  });

interface Props {
  valoresIniciais: ValoresRotina;
  rotuloSalvar: string;
  aoSalvar: (valores: ValoresRotina) => Promise<ErroOnPath | null>;
  aoCancelar: () => void;
}

/** Nome, área, dias e horário ou meta da rotina (FR-005). */
export function FormularioRotina({ valoresIniciais, rotuloSalvar, aoSalvar, aoCancelar }: Props) {
  const { data: opcoes } = useOpcoesTarefa();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ValoresRotina>({ resolver: zodResolver(esquema), defaultValues: valoresIniciais });
  const tipo = useWatch({ control, name: "tipo" });

  async function enviar(valores: ValoresRotina) {
    const erro = await aoSalvar(valores);
    for (const campo of (erro?.detalhes.campos as string[] | undefined) ?? []) {
      if (campo in valoresIniciais) setError(campo as keyof ValoresRotina, { message: t(`rotinas.erros.${campo}` as ChaveTexto) });
    }
  }

  const erro = (campo: keyof ValoresRotina) =>
    errors[campo] && <p className="text-pequeno text-cinza-700">{errors[campo]?.message as string}</p>;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(enviar)} noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rotina-nome">{t("rotinas.nome")}</Label>
          <Input id="rotina-nome" autoComplete="off" autoFocus aria-invalid={errors.nome !== undefined} {...register("nome")} />
          {erro("nome")}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rotina-area">{t("rotinas.area")}</Label>
          <Controller
            control={control}
            name="areaId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger id="rotina-area" className="w-full" aria-invalid={errors.areaId !== undefined}>
                  <SelectValue placeholder={t("rotinas.escolherArea")} />
                </SelectTrigger>
                <SelectContent>
                  {opcoes?.areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {erro("areaId")}
        </div>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">{t("rotinas.tipo")}</legend>
        <Controller
          control={control}
          name="tipo"
          render={({ field }) => (
            <div role="radiogroup" className="flex gap-1 rounded-md bg-cinza-100 p-1">
              {(["horario", "meta_horas"] as const).map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  role="radio"
                  aria-checked={field.value === opcao}
                  onClick={() => field.onChange(opcao)}
                  className={cn(
                    "flex-1 rounded-sm px-3 py-1.5 text-sm text-cinza-600",
                    field.value === opcao && "bg-branco font-medium text-preto shadow-xs",
                  )}
                >
                  {t(`rotinas.tipos.${opcao}`)}
                </button>
              ))}
            </div>
          )}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">{t("rotinas.dias")}</legend>
        <Controller
          control={control}
          name="diasSemana"
          render={({ field }) => (
            <div className="flex flex-wrap gap-1.5">
              {DIAS.map(({ numero }) => {
                const marcado = field.value.includes(numero);
                return (
                  <button
                    key={numero}
                    type="button"
                    aria-pressed={marcado}
                    onClick={() => field.onChange(marcado ? field.value.filter((d) => d !== numero) : [...field.value, numero])}
                    className={cn(
                      "h-8 w-11 rounded-md border text-sm",
                      marcado ? "border-preto bg-preto text-branco" : "text-cinza-600 hover:bg-cinza-50",
                    )}
                  >
                    {nomeDoDia(numero)}
                  </button>
                );
              })}
            </div>
          )}
        />
        {erro("diasSemana")}
      </fieldset>

      {tipo === "horario" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rotina-hora">{t("rotinas.horaInicio")}</Label>
            <Input id="rotina-hora" type="time" aria-invalid={errors.horaInicio !== undefined} {...register("horaInicio")} />
            {erro("horaInicio")}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rotina-duracao">{t("rotinas.duracao")}</Label>
            <Input id="rotina-duracao" type="number" min={1} step={1} aria-invalid={errors.duracaoMin !== undefined} {...register("duracaoMin")} />
            {erro("duracaoMin") ?? <p className="text-pequeno text-cinza-500">{t("rotinas.semDuracao")}</p>}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 sm:w-1/2">
          <Label htmlFor="rotina-meta">{t("rotinas.meta")}</Label>
          <Input id="rotina-meta" type="number" min={1} step={1} aria-invalid={errors.metaMin !== undefined} {...register("metaMin")} />
          {erro("metaMin")}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {rotuloSalvar}
        </Button>
        <Button type="button" variant="outline" onClick={aoCancelar}>
          {t("rotinas.cancelar")}
        </Button>
      </div>
    </form>
  );
}
