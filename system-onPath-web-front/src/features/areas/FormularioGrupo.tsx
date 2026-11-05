import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ErroOnPath } from "@/dados/erros";
import { t } from "@/i18n";

export interface ValoresGrupo {
  nome: string;
  limiteAtivos: string;
}

const esquema = z.object({
  nome: z.string().trim().min(1, { message: t("grupos.erros.nome") }),
  limiteAtivos: z.string().regex(/^\d+$/, { message: t("grupos.erros.limiteAtivos") }),
});

interface Props {
  valoresIniciais: ValoresGrupo;
  rotuloSalvar: string;
  aoSalvar: (valores: ValoresGrupo) => Promise<ErroOnPath | null>;
  aoCancelar: () => void;
}

/** Nome e limite de ativos do grupo (FR-012). */
export function FormularioGrupo({ valoresIniciais, rotuloSalvar, aoSalvar, aoCancelar }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ValoresGrupo>({ resolver: zodResolver(esquema), defaultValues: valoresIniciais });

  async function enviar(valores: ValoresGrupo) {
    const erro = await aoSalvar(valores);
    if (!erro) return;
    if (erro.codigo === "nome_repetido") {
      setError("nome", { message: erro.mensagem });
      return;
    }
    for (const campo of (erro.detalhes.campos as string[] | undefined) ?? []) {
      if (campo === "nome" || campo === "limiteAtivos") setError(campo, { message: t(`grupos.erros.${campo}`) });
    }
  }

  return (
    <form className="flex flex-col gap-3 rounded-lg border p-4" onSubmit={handleSubmit(enviar)} noValidate>
      <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grupo-nome">{t("grupos.nome")}</Label>
          <Input
            id="grupo-nome"
            autoComplete="off"
            autoFocus
            aria-invalid={errors.nome !== undefined}
            aria-describedby={errors.nome ? "grupo-nome-erro" : undefined}
            {...register("nome")}
          />
          {errors.nome && (
            <p id="grupo-nome-erro" className="text-pequeno text-cinza-700">
              {errors.nome.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grupo-limite">{t("grupos.limite")}</Label>
          <Input
            id="grupo-limite"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            aria-invalid={errors.limiteAtivos !== undefined}
            aria-describedby="grupo-limite-dica"
            {...register("limiteAtivos")}
          />
        </div>
      </div>
      <p id="grupo-limite-dica" className="text-pequeno text-cinza-600">
        {errors.limiteAtivos?.message ?? t("grupos.dicaLimite")}
      </p>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {rotuloSalvar}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={aoCancelar}>
          {t("grupos.cancelar")}
        </Button>
      </div>
    </form>
  );
}
