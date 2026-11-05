import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch, type Path } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOpcoesTarefa } from "@/dados/consultas";
import type { ErroOnPath } from "@/dados/erros";
import { t, type ChaveTexto } from "@/i18n";
import { cn } from "@/lib/utils";

import { PRIORIDADES, VALORES_VAZIOS, VINCULOS, type ValoresFormulario } from "./valoresTarefa";

const erro = (chave: ChaveTexto) => ({ message: t(chave) });

/** Validação do formulário, com as mesmas regras do serviço, para dar retorno na hora. */
function esquemaFormulario(subtarefa: boolean) {
  return z
    .object({
      titulo: z.string().trim().min(1, erro("tarefas.erros.titulo")),
      vinculo: z.enum(VINCULOS),
      projetoId: z.string(),
      materiaId: z.string(),
      areaId: z.string(),
      prioridade: z.union([z.enum(["alta", "media", "baixa"]), z.literal("")]),
      tempoEstimadoMin: z.string(),
      prazo: z.string(),
      anotacoes: z.string(),
    })
    .superRefine((valores, ctx) => {
      const problema = (path: keyof ValoresFormulario, chave: ChaveTexto) =>
        ctx.addIssue({ code: "custom", path: [path], message: t(chave) });
      const tempo = valores.tempoEstimadoMin.trim();
      if (tempo !== "" && !/^[1-9]\d*$/.test(tempo)) problema("tempoEstimadoMin", "tarefas.erros.tempoEstimadoMin");
      if (subtarefa) return;
      if (valores.vinculo === "projeto" && !valores.projetoId) problema("projetoId", "tarefas.erros.projetoId");
      if (valores.vinculo === "materia" && !valores.materiaId) problema("materiaId", "tarefas.erros.materiaId");
      if (valores.vinculo === "avulsa" && !valores.areaId) problema("areaId", "tarefas.erros.areaId");
      if (!valores.prioridade) problema("prioridade", "tarefas.erros.prioridade");
      if (tempo === "") problema("tempoEstimadoMin", "tarefas.erros.tempoEstimadoMin");
    });
}

const CAMPO_DO_SERVICO: Record<string, Path<ValoresFormulario>> = {
  titulo: "titulo",
  areaId: "areaId",
  prioridade: "prioridade",
  tempoEstimadoMin: "tempoEstimadoMin",
  projetoId: "projetoId",
  materiaId: "materiaId",
  prazo: "prazo",
};

interface Props {
  valoresIniciais?: ValoresFormulario;
  /** Na subtarefa, área, prioridade e vínculo são herdados e só aparecem para leitura. */
  modo?: "principal" | "subtarefa";
  /** Título da tarefa do topo, para a dica de herança. */
  herdadoDe?: string;
  rotuloSalvar: string;
  /** Devolve o erro do serviço, ou `null` se salvou. */
  aoSalvar: (valores: ValoresFormulario) => Promise<ErroOnPath | null>;
  aoCancelar?: () => void;
  focarTitulo?: boolean;
  /** Na edição, salvar só fica ativo depois de alguma mudança. */
  somenteComMudancas?: boolean;
}

function Campo({
  id,
  rotulo,
  erro: mensagem,
  children,
  className,
}: {
  id: string;
  rotulo: string;
  erro?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{rotulo}</Label>
      {children}
      {mensagem && (
        <p id={`${id}-erro`} className="text-pequeno text-cinza-700">
          {mensagem}
        </p>
      )}
    </div>
  );
}

/** Formulário da tarefa: criar, editar no painel e converter um item da caixa. */
export function FormularioTarefa({
  valoresIniciais = VALORES_VAZIOS,
  modo = "principal",
  herdadoDe,
  rotuloSalvar,
  aoSalvar,
  aoCancelar,
  focarTitulo = false,
  somenteComMudancas = false,
}: Props) {
  const subtarefa = modo === "subtarefa";
  const { data: opcoes } = useOpcoesTarefa();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario(subtarefa)),
    defaultValues: valoresIniciais,
  });

  // Ao trocar de tarefa no painel, o formulário recebe os valores novos.
  useEffect(() => reset(valoresIniciais), [reset, valoresIniciais]);

  const [vinculo, projetoId, materiaId] = useWatch({
    control,
    name: ["vinculo", "projetoId", "materiaId"],
  });

  // A área acompanha o projeto ou a matéria escolhidos (RN01).
  useEffect(() => {
    if (subtarefa) return;
    const origem =
      vinculo === "projeto"
        ? opcoes?.projetos.find((p) => p.id === projetoId)
        : vinculo === "materia"
          ? opcoes?.materias.find((m) => m.id === materiaId)
          : undefined;
    if (origem) setValue("areaId", origem.areaId, { shouldDirty: true, shouldValidate: true });
  }, [subtarefa, vinculo, projetoId, materiaId, opcoes, setValue]);

  async function enviar(valores: ValoresFormulario) {
    const erroServico = await aoSalvar(valores);
    if (!erroServico) {
      reset(valores);
      return;
    }
    const campos = (erroServico.detalhes.campos as string[] | undefined) ?? [];
    for (const campo of campos) {
      const nome = CAMPO_DO_SERVICO[campo];
      if (nome) setError(nome, { message: t(`tarefas.erros.${campo}` as ChaveTexto) });
    }
  }

  const areaTravada = subtarefa || vinculo !== "avulsa";
  const semMaterias = (opcoes?.materias.length ?? 0) === 0;
  const dicaHerdado = subtarefa && herdadoDe ? t("tarefas.herdado", { tarefa: herdadoDe }) : null;
  const ligacaoErro = (campo: keyof ValoresFormulario) => ({
    "aria-invalid": errors[campo] !== undefined,
    "aria-describedby": errors[campo] ? `tarefa-${campo}-erro` : undefined,
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(enviar)} noValidate>
      <Campo id="tarefa-titulo" rotulo={t("tarefas.campos.titulo")} erro={errors.titulo?.message}>
        <Input
          id="tarefa-titulo"
          autoComplete="off"
          autoFocus={focarTitulo}
          {...register("titulo")}
          {...ligacaoErro("titulo")}
        />
      </Campo>

      <fieldset className="flex flex-col gap-1.5" disabled={subtarefa}>
        <legend className="mb-1.5 text-sm font-medium">{t("tarefas.campos.vinculo")}</legend>
        <Controller
          control={control}
          name="vinculo"
          render={({ field }) => (
            <div role="radiogroup" className="flex gap-1 rounded-md bg-cinza-100 p-1">
              {VINCULOS.map((opcao) => {
                const desativada = opcao === "materia" && semMaterias;
                return (
                  <button
                    key={opcao}
                    type="button"
                    role="radio"
                    aria-checked={field.value === opcao}
                    disabled={subtarefa || desativada}
                    onClick={() => {
                      field.onChange(opcao);
                      clearErrors(["areaId", "projetoId", "materiaId"]);
                    }}
                    className={cn(
                      "flex-1 rounded-sm px-3 py-1.5 text-sm text-cinza-600 disabled:opacity-50",
                      field.value === opcao && "bg-branco font-medium text-preto shadow-xs",
                    )}
                  >
                    {t(`tarefas.campos.${opcao}`)}
                  </button>
                );
              })}
            </div>
          )}
        />
        {semMaterias && !subtarefa && <p className="text-pequeno text-cinza-500">{t("tarefas.semMaterias")}</p>}
        {dicaHerdado && <p className="text-pequeno text-cinza-500">{dicaHerdado}</p>}
      </fieldset>

      {vinculo === "projeto" && (
        <Campo id="tarefa-projetoId" rotulo={t("tarefas.campos.projeto")} erro={errors.projetoId?.message}>
          <Controller
            control={control}
            name="projetoId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange} disabled={subtarefa}>
                <SelectTrigger id="tarefa-projetoId" className="w-full" {...ligacaoErro("projetoId")}>
                  <SelectValue placeholder={t("tarefas.campos.escolherProjeto")} />
                </SelectTrigger>
                <SelectContent>
                  {opcoes?.projetos.map((projeto) => (
                    <SelectItem key={projeto.id} value={projeto.id}>
                      {projeto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Campo>
      )}

      {vinculo === "materia" && (
        <Campo id="tarefa-materiaId" rotulo={t("tarefas.campos.materia")} erro={errors.materiaId?.message}>
          <Controller
            control={control}
            name="materiaId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange} disabled={subtarefa}>
                <SelectTrigger id="tarefa-materiaId" className="w-full" {...ligacaoErro("materiaId")}>
                  <SelectValue placeholder={t("tarefas.campos.escolherMateria")} />
                </SelectTrigger>
                <SelectContent>
                  {opcoes?.materias.map((materia) => (
                    <SelectItem key={materia.id} value={materia.id}>
                      {materia.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Campo>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Campo id="tarefa-areaId" rotulo={t("tarefas.campos.area")} erro={errors.areaId?.message}>
          <Controller
            control={control}
            name="areaId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange} disabled={areaTravada}>
                <SelectTrigger id="tarefa-areaId" className="w-full" {...ligacaoErro("areaId")}>
                  <SelectValue placeholder={t("tarefas.campos.escolherArea")} />
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
        </Campo>

        <Campo id="tarefa-prioridade" rotulo={t("tarefas.campos.prioridade")} erro={errors.prioridade?.message}>
          <Controller
            control={control}
            name="prioridade"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange} disabled={subtarefa}>
                <SelectTrigger id="tarefa-prioridade" className="w-full" {...ligacaoErro("prioridade")}>
                  <SelectValue placeholder={t("tarefas.campos.escolherPrioridade")} />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES.map((prioridade) => (
                    <SelectItem key={prioridade} value={prioridade}>
                      {t(`tarefas.prioridades.${prioridade}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Campo>

        <Campo
          id="tarefa-tempoEstimadoMin"
          rotulo={t("tarefas.campos.tempo")}
          erro={errors.tempoEstimadoMin?.message}
        >
          <Input
            id="tarefa-tempoEstimadoMin"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            {...register("tempoEstimadoMin")}
            {...ligacaoErro("tempoEstimadoMin")}
          />
        </Campo>

        <Campo id="tarefa-prazo" rotulo={t("tarefas.campos.prazo")} erro={errors.prazo?.message}>
          <Input id="tarefa-prazo" type="date" {...register("prazo")} {...ligacaoErro("prazo")} />
        </Campo>
      </div>

      <Campo id="tarefa-anotacoes" rotulo={t("tarefas.campos.anotacoes")}>
        <Textarea id="tarefa-anotacoes" rows={3} className="min-h-20 text-normal" {...register("anotacoes")} />
      </Campo>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || (somenteComMudancas && !isDirty)}>
          {rotuloSalvar}
        </Button>
        {aoCancelar && (
          <Button type="button" variant="outline" onClick={aoCancelar}>
            {t("tarefas.acoes.descartarAlteracoes")}
          </Button>
        )}
      </div>
    </form>
  );
}
