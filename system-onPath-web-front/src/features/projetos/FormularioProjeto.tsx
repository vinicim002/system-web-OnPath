import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOpcoesProjeto } from "@/dados/consultas";
import type { ErroOnPath } from "@/dados/erros";
import type { Prioridade } from "@/dados/tipos";
import { t, type ChaveTexto } from "@/i18n";

export interface ValoresProjeto {
  nome: string;
  grupoId: string;
  prioridade: Prioridade | "";
  prazo: string;
  metaId: string;
  descricao: string;
}


const SEM_META = "_";

const esquema = z
  .object({
    nome: z.string().trim().min(1, { message: t("projetos.erros.nome") }),
    grupoId: z.string().min(1, { message: t("projetos.erros.grupoId") }),
    prioridade: z.union([z.enum(["alta", "media", "baixa"]), z.literal("")]),
    prazo: z.string(),
    metaId: z.string(),
    descricao: z.string(),
  })
  .refine((v) => v.prioridade !== "", { path: ["prioridade"], message: t("projetos.erros.prioridade") });

interface Props {
  valoresIniciais: ValoresProjeto;
  rotuloSalvar: string;
  aoSalvar: (valores: ValoresProjeto) => Promise<ErroOnPath | null>;
  aoCancelar?: () => void;
  focar?: boolean;
  somenteComMudancas?: boolean;
}

/** Nome, grupo, prioridade, prazo, meta e descrição do projeto (FR-008). */
export function FormularioProjeto({ valoresIniciais, rotuloSalvar, aoSalvar, aoCancelar, focar, somenteComMudancas }: Props) {
  const { data: opcoes } = useOpcoesProjeto();
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ValoresProjeto>({ resolver: zodResolver(esquema), defaultValues: valoresIniciais });

  useEffect(() => reset(valoresIniciais), [reset, valoresIniciais]);

  const [grupoId, metaId] = useWatch({ control, name: ["grupoId", "metaId"] });
  const areaDoGrupo = opcoes?.grupos.find((g) => g.id === grupoId)?.areaId;
  const metas = (opcoes?.metas ?? []).filter((meta) => meta.areaId === areaDoGrupo);

  // Ao trocar para um grupo de outra área, a meta escolhida deixa de valer.
  useEffect(() => {
    if (metaId && opcoes && !metas.some((meta) => meta.id === metaId)) setValue("metaId", "");
  }, [metaId, metas, opcoes, setValue]);

  async function enviar(valores: ValoresProjeto) {
    const erro = await aoSalvar(valores);
    if (!erro) return;
    if (erro.codigo === "nome_repetido") {
      setError("nome", { message: erro.mensagem });
      return;
    }
    for (const campo of (erro.detalhes.campos as string[] | undefined) ?? []) {
      if (["nome", "grupoId", "prioridade", "metaId"].includes(campo)) {
        setError(campo as keyof ValoresProjeto, { message: t(`projetos.erros.${campo}` as ChaveTexto) });
      }
    }
  }

  const erroDe = (campo: keyof ValoresProjeto) =>
    errors[campo] && (
      <p id={`projeto-${campo}-erro`} className="text-pequeno text-cinza-700">
        {errors[campo]?.message}
      </p>
    );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(enviar)} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="projeto-nome">{t("projetos.campos.nome")}</Label>
        <Input id="projeto-nome" autoComplete="off" autoFocus={focar} aria-invalid={errors.nome !== undefined} {...register("nome")} />
        {erroDe("nome")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="projeto-grupoId">{t("projetos.campos.grupo")}</Label>
          <Controller
            control={control}
            name="grupoId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger id="projeto-grupoId" className="w-full" aria-invalid={errors.grupoId !== undefined}>
                  <SelectValue placeholder={t("projetos.campos.escolherGrupo")} />
                </SelectTrigger>
                <SelectContent>
                  {opcoes?.areas.map((area) => {
                    const grupos = opcoes.grupos.filter((g) => g.areaId === area.id);
                    if (grupos.length === 0) return null;
                    return (
                      <SelectGroup key={area.id}>
                        <SelectLabel>{area.nome}</SelectLabel>
                        {grupos.map((grupo) => (
                          <SelectItem key={grupo.id} value={grupo.id}>
                            {grupo.nome}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          />
          {erroDe("grupoId")}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="projeto-prioridade">{t("projetos.campos.prioridade")}</Label>
          <Controller
            control={control}
            name="prioridade"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger id="projeto-prioridade" className="w-full">
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
          {erroDe("prioridade")}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="projeto-prazo">{t("projetos.campos.prazo")}</Label>
          <Input id="projeto-prazo" type="date" {...register("prazo")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="projeto-metaId">{t("projetos.campos.meta")}</Label>
          <Controller
            control={control}
            name="metaId"
            render={({ field }) => (
              <Select value={field.value || SEM_META} onValueChange={(valor) => field.onChange(valor === SEM_META ? "" : valor)}>
                <SelectTrigger id="projeto-metaId" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_META}>{t("projetos.campos.semMeta")}</SelectItem>
                  {metas.map((meta) => (
                    <SelectItem key={meta.id} value={meta.id}>
                      {meta.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {erroDe("metaId")}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="projeto-descricao">{t("projetos.campos.descricao")}</Label>
        <Textarea id="projeto-descricao" rows={3} className="min-h-20 text-normal" {...register("descricao")} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || (somenteComMudancas && !isDirty)}>
          {rotuloSalvar}
        </Button>
        {aoCancelar && (
          <Button type="button" variant="outline" onClick={aoCancelar}>
            {t("projetos.acoes.cancelarEdicao")}
          </Button>
        )}
      </div>
    </form>
  );
}
