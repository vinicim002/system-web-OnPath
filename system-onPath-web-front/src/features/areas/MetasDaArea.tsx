import { CheckCircle2, Circle, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAlterarMeta, useCriarMeta, useExcluirMeta, useMetasDaArea, useRecuperarMeta } from "@/dados/consultas";
import type { MetaNaLista } from "@/dados/contratos";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import { avisarErro } from "@/features/caixa/avisos";
import { useHoje } from "@/features/hoje/useHoje";
import { t } from "@/i18n";
import { dataPrazo } from "@/i18n/datas";
import { cn } from "@/lib/utils";

import { FormularioMeta, type ValoresMeta } from "./FormularioMeta";

const VAZIA: ValoresMeta = { titulo: "", descricao: "", prazo: "" };

function paraDados(valores: ValoresMeta) {
  return { titulo: valores.titulo, descricao: valores.descricao || null, prazo: valores.prazo || null };
}

/** Metas da área: criar, editar, mudar o status e excluir com desfazer (FR-008 a FR-010). */
export function MetasDaArea({ areaId }: { areaId: string }) {
  const hoje = useHoje();
  const { data: metas = [] } = useMetasDaArea(areaId, hoje);
  const criar = useCriarMeta();
  const alterar = useAlterarMeta();
  const excluir = useExcluirMeta();
  const recuperar = useRecuperarMeta();
  const [editando, setEditando] = useState<string | null>(null);

  async function salvar(acao: () => Promise<unknown>, aviso: string): Promise<ErroOnPath | null> {
    try {
      await acao();
      toast(aviso);
      setEditando(null);
      return null;
    } catch (erro) {
      if (ehErroOnPath(erro) && erro.codigo === "dados_invalidos") return erro;
      avisarErro(erro);
      return ehErroOnPath(erro) ? erro : null;
    }
  }

  async function mudarStatus(meta: MetaNaLista, status: MetaNaLista["status"]) {
    try {
      await alterar.mutateAsync({ id: meta.id, dados: { status } });
    } catch (erro) {
      avisarErro(erro);
    }
  }

  async function aoExcluir(id: string) {
    try {
      await excluir.mutateAsync(id);
      toast(t("metas.avisos.excluida"), {
        duration: 5000,
        action: { label: t("metas.avisos.desfazer"), onClick: () => recuperar.mutateAsync(id).catch(avisarErro) },
      });
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{t("metas.titulo")}</h3>
        <Button size="sm" variant="outline" onClick={() => setEditando("nova")}>
          <Plus />
          {t("metas.nova")}
        </Button>
      </div>

      {editando === "nova" && (
        <FormularioMeta
          valoresIniciais={VAZIA}
          rotuloSalvar={t("metas.criar")}
          aoCancelar={() => setEditando(null)}
          aoSalvar={(valores) =>
            salvar(() => criar.mutateAsync({ areaId, status: "ativa", ...paraDados(valores) }), t("metas.avisos.criada"))
          }
        />
      )}

      {metas.length === 0 && editando !== "nova" && <p className="text-cinza-600">{t("metas.vazia")}</p>}

      <ul className="flex flex-col gap-1">
        {metas.map((meta) =>
          editando === meta.id ? (
            <li key={meta.id}>
              <FormularioMeta
                valoresIniciais={{ titulo: meta.titulo, descricao: meta.descricao ?? "", prazo: meta.prazo ?? "" }}
                rotuloSalvar={t("metas.salvar")}
                aoCancelar={() => setEditando(null)}
                aoSalvar={(valores) =>
                  salvar(() => alterar.mutateAsync({ id: meta.id, dados: paraDados(valores) }), t("metas.avisos.salva"))
                }
              />
            </li>
          ) : (
            <li key={meta.id} className="group flex items-start gap-3 rounded-md px-2 py-2 hover:bg-cinza-50">
              <span aria-hidden className="mt-0.5 text-cinza-500 [&_svg]:size-4">
                {meta.status === "concluida" ? <CheckCircle2 /> : meta.status === "cancelada" ? <XCircle /> : <Circle />}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className={cn(meta.status !== "ativa" && "text-cinza-500 line-through")}>{meta.titulo}</p>
                {meta.descricao && <p className="text-pequeno text-cinza-600">{meta.descricao}</p>}
                <p className="text-pequeno text-cinza-500">
                  {[
                    meta.status !== "ativa" ? t(`metas.status.${meta.status}`) : null,
                    meta.atrasada ? t("metas.atrasada") : null,
                    meta.prazo ? t("metas.ate", { data: dataPrazo(meta.prazo) }) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                {meta.status === "ativa" ? (
                  <>
                    <Button size="xs" variant="ghost" onClick={() => void mudarStatus(meta, "concluida")}>
                      {t("metas.acoes.concluir")}
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => void mudarStatus(meta, "cancelada")}>
                      {t("metas.acoes.cancelar")}
                    </Button>
                  </>
                ) : (
                  <Button size="xs" variant="ghost" onClick={() => void mudarStatus(meta, "ativa")}>
                    {t("metas.acoes.reativar")}
                  </Button>
                )}
                <Button size="xs" variant="ghost" onClick={() => setEditando(meta.id)}>
                  {t("metas.acoes.editar")}
                </Button>
                <Button size="xs" variant="ghost" onClick={() => void aoExcluir(meta.id)}>
                  {t("metas.acoes.excluir")}
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
