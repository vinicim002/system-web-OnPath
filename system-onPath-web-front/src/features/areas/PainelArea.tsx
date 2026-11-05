import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAlterarArea, useArquivarArea, useRecuperarArea } from "@/dados/consultas";
import type { AreaComResumo, ContagemArea } from "@/dados/contratos";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import { avisarErro } from "@/features/caixa/avisos";
import { t, tPlural } from "@/i18n";

import { FormularioArea, type ValoresArea } from "./FormularioArea";

const ITENS_CONTAGEM: (keyof ContagemArea)[] = ["metasAtivas", "grupos", "projetos", "tarefasAbertas", "materias"];

interface Props {
  area: AreaComResumo;
  aoArquivar: () => void;
  children?: React.ReactNode;
}

/** A área escolhida: nome, tom e arquivar com confirmação (FR-005 e FR-006). */
export function PainelArea({ area, aoArquivar, children }: Props) {
  const alterar = useAlterarArea();
  const arquivar = useArquivarArea();
  const recuperar = useRecuperarArea();
  const [confirmacao, setConfirmacao] = useState<ContagemArea | null>(null);

  // Os valores só mudam quando a área muda de fato, para não apagar o que está sendo digitado.
  const valoresIniciais = useMemo(
    () => ({ nome: area.nome, cor: area.cor }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [area.id, area.atualizadoEm],
  );

  async function aoSalvar(valores: ValoresArea): Promise<ErroOnPath | null> {
    try {
      await alterar.mutateAsync({ id: area.id, dados: valores });
      toast(t("areas.avisos.salva"));
      return null;
    } catch (erro) {
      if (ehErroOnPath(erro) && (erro.codigo === "dados_invalidos" || erro.codigo === "nome_repetido")) return erro;
      avisarErro(erro);
      return ehErroOnPath(erro) ? erro : null;
    }
  }

  async function aoArquivarArea(confirmado = false) {
    try {
      await arquivar.mutateAsync({ id: area.id, confirmado });
      setConfirmacao(null);
      aoArquivar();
      toast(t("areas.avisos.arquivada"), {
        duration: 5000,
        action: { label: t("areas.avisos.desfazer"), onClick: () => recuperar.mutateAsync(area.id).catch(avisarErro) },
      });
    } catch (erro) {
      if (ehErroOnPath(erro) && erro.codigo === "area_com_itens") {
        setConfirmacao(erro.detalhes.contagem as ContagemArea);
        return;
      }
      avisarErro(erro);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-3 text-subtitulo font-semibold">
            <span aria-hidden className="size-4 rounded-full" style={{ backgroundColor: area.cor }} />
            {area.nome}
          </h2>
          <Button variant="ghost" onClick={() => void aoArquivarArea()}>
            {t("areas.arquivar")}
          </Button>
        </div>
        <FormularioArea
          valoresIniciais={valoresIniciais}
          rotuloSalvar={t("areas.salvar")}
          aoSalvar={aoSalvar}
          somenteComMudancas
        />
      </section>

      {children}

      <AlertDialog open={confirmacao !== null} onOpenChange={(aberto) => !aberto && setConfirmacao(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areas.confirmar.titulo", { area: area.nome })}</AlertDialogTitle>
            <AlertDialogDescription>{t("areas.confirmar.descricao")}</AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="flex flex-col gap-1 text-sm">
            {confirmacao &&
              ITENS_CONTAGEM.filter((item) => confirmacao[item] > 0).map((item) => (
                <li key={item}>{tPlural(`areas.confirmar.${item}`, confirmacao[item])}</li>
              ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("areas.confirmar.voltar")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void aoArquivarArea(true)}>{t("areas.confirmar.confirmar")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
