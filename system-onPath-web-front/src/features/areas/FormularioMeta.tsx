import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ErroOnPath } from "@/dados/erros";
import { t } from "@/i18n";

export interface ValoresMeta {
  titulo: string;
  descricao: string;
  prazo: string;
}

const esquema = z.object({
  titulo: z.string().trim().min(1, { message: t("metas.erros.titulo") }),
  descricao: z.string(),
  prazo: z.string(),
});

interface Props {
  valoresIniciais: ValoresMeta;
  rotuloSalvar: string;
  aoSalvar: (valores: ValoresMeta) => Promise<ErroOnPath | null>;
  aoCancelar: () => void;
}

/** Título, descrição e prazo da meta (FR-008). */
export function FormularioMeta({ valoresIniciais, rotuloSalvar, aoSalvar, aoCancelar }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ValoresMeta>({ resolver: zodResolver(esquema), defaultValues: valoresIniciais });

  async function enviar(valores: ValoresMeta) {
    const erro = await aoSalvar(valores);
    if (erro && ((erro.detalhes.campos as string[] | undefined) ?? []).includes("titulo")) {
      setError("titulo", { message: t("metas.erros.titulo") });
    }
  }

  return (
    <form className="flex flex-col gap-3 rounded-lg border p-4" onSubmit={handleSubmit(enviar)} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="meta-titulo">{t("metas.campoTitulo")}</Label>
        <Input
          id="meta-titulo"
          autoComplete="off"
          autoFocus
          aria-invalid={errors.titulo !== undefined}
          aria-describedby={errors.titulo ? "meta-titulo-erro" : undefined}
          {...register("titulo")}
        />
        {errors.titulo && (
          <p id="meta-titulo-erro" className="text-pequeno text-cinza-700">
            {errors.titulo.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="meta-descricao">{t("metas.descricao")}</Label>
        <Textarea id="meta-descricao" rows={2} className="min-h-14 text-normal" {...register("descricao")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="meta-prazo">{t("metas.prazo")}</Label>
        <Input id="meta-prazo" type="date" className="w-44" {...register("prazo")} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {rotuloSalvar}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={aoCancelar}>
          {t("metas.cancelar")}
        </Button>
      </div>
    </form>
  );
}
