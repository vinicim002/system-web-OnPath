import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAlterarGrupo, useCriarGrupo, useExcluirGrupo, useGruposDaArea, useRecuperarGrupo } from "@/dados/consultas";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import { avisarErro } from "@/features/caixa/avisos";
import { t, tPlural } from "@/i18n";

import { FormularioGrupo, type ValoresGrupo } from "./FormularioGrupo";

const VAZIO: ValoresGrupo = { nome: "", limiteAtivos: "1" };

/** Grupos da área com as vagas e o limite de ativos (FR-011 a FR-015). */
export function GruposDaArea({ areaId }: { areaId: string }) {
  const { data: grupos = [] } = useGruposDaArea(areaId);
  const criar = useCriarGrupo();
  const alterar = useAlterarGrupo();
  const excluir = useExcluirGrupo();
  const recuperar = useRecuperarGrupo();
  const [editando, setEditando] = useState<string | null>(null);

  async function salvar(acao: () => Promise<unknown>, aviso: string): Promise<ErroOnPath | null> {
    try {
      await acao();
      toast(aviso);
      setEditando(null);
      return null;
    } catch (erro) {
      if (ehErroOnPath(erro) && (erro.codigo === "dados_invalidos" || erro.codigo === "nome_repetido")) return erro;
      avisarErro(erro);
      return ehErroOnPath(erro) ? erro : null;
    }
  }

  async function aoArquivar(id: string) {
    try {
      await excluir.mutateAsync(id);
      toast(t("grupos.avisos.arquivado"), {
        duration: 5000,
        action: { label: t("grupos.avisos.desfazer"), onClick: () => recuperar.mutateAsync(id).catch(avisarErro) },
      });
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{t("grupos.titulo")}</h3>
        <Button size="sm" variant="outline" onClick={() => setEditando("novo")}>
          <Plus />
          {t("grupos.novo")}
        </Button>
      </div>

      {editando === "novo" && (
        <FormularioGrupo
          valoresIniciais={VAZIO}
          rotuloSalvar={t("grupos.criar")}
          aoCancelar={() => setEditando(null)}
          aoSalvar={(valores) =>
            salvar(
              () => criar.mutateAsync({ areaId, nome: valores.nome, limiteAtivos: Number(valores.limiteAtivos) }),
              t("grupos.avisos.criado"),
            )
          }
        />
      )}

      {grupos.length === 0 && editando !== "novo" && <p className="text-cinza-600">{t("grupos.vazio")}</p>}

      <ul className="flex flex-col gap-1">
        {grupos.map((grupo) =>
          editando === grupo.id ? (
            <li key={grupo.id}>
              <FormularioGrupo
                valoresIniciais={{ nome: grupo.nome, limiteAtivos: String(grupo.limiteAtivos) }}
                rotuloSalvar={t("grupos.salvar")}
                aoCancelar={() => setEditando(null)}
                aoSalvar={(valores) =>
                  salvar(
                    () =>
                      alterar.mutateAsync({
                        id: grupo.id,
                        dados: { nome: valores.nome, limiteAtivos: Number(valores.limiteAtivos) },
                      }),
                    t("grupos.avisos.salvo"),
                  )
                }
              />
            </li>
          ) : (
            <li key={grupo.id} className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-cinza-50">
              <span className="min-w-0 flex-1 truncate">{grupo.nome}</span>
              {grupo.acimaDoLimite && (
                <span className="shrink-0 rounded-sm bg-preto px-1.5 py-0.5 text-pequeno text-branco">
                  {t("grupos.acimaDoLimite")}
                </span>
              )}
              <span className="shrink-0 text-pequeno text-cinza-600">
                {tPlural("grupos.vagas", grupo.limiteAtivos, { ativos: grupo.ativos, limite: grupo.limiteAtivos })}
              </span>
              <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                <Button size="xs" variant="ghost" onClick={() => setEditando(grupo.id)}>
                  {t("grupos.editar")}
                </Button>
                <Button size="xs" variant="ghost" onClick={() => void aoArquivar(grupo.id)}>
                  {t("grupos.arquivar")}
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
