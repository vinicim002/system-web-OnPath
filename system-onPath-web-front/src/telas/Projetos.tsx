import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import { TelaBase } from "@/components/TelaBase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCriarProjeto, useVisaoProjetos } from "@/dados/consultas";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import { avisarErro } from "@/features/caixa/avisos";
import { CartaoGrupo } from "@/features/projetos/CartaoGrupo";
import { filtrosDeProjetos } from "@/features/projetos/filtros";
import { FiltrosProjetos } from "@/features/projetos/FiltrosProjetos";
import { FormularioProjeto, type ValoresProjeto } from "@/features/projetos/FormularioProjeto";
import { paraDadosProjeto, PROJETO_VAZIO } from "@/features/projetos/valoresProjeto";
import { t } from "@/i18n";

/** Tela Projetos: áreas, grupos com vagas, ativos, fila e pausados (specs/006-projetos/contracts/interface.md). */
export function Projetos() {
  const [parametros] = useSearchParams();
  const chave = parametros.toString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filtros = useMemo(() => filtrosDeProjetos(parametros), [chave]);
  const { data: visao } = useVisaoProjetos(filtros);
  const criar = useCriarProjeto();
  const navegar = useNavigate();
  const [criando, setCriando] = useState(false);

  async function aoCriar(valores: ValoresProjeto): Promise<ErroOnPath | null> {
    try {
      const projeto = await criar.mutateAsync(paraDadosProjeto(valores));
      setCriando(false);
      toast(t("projetos.avisos.criado"), {
        action: { label: t("projetos.avisos.abrirProjeto"), onClick: () => navegar(`/projetos/${projeto.id}`) },
      });
      return null;
    } catch (erro) {
      if (ehErroOnPath(erro) && (erro.codigo === "dados_invalidos" || erro.codigo === "nome_repetido")) return erro;
      avisarErro(erro);
      return ehErroOnPath(erro) ? erro : null;
    }
  }

  return (
    <TelaBase titulo={t("telas.projetos.titulo")}>
      <div className="-mt-2 flex flex-wrap items-center gap-3">
        <Button onClick={() => setCriando(true)}>
          <Plus />
          {t("projetos.novo")}
        </Button>
        <FiltrosProjetos filtros={filtros} />
      </div>

      {visao && visao.length === 0 && <p className="text-cinza-600">{t("projetos.vazio")}</p>}

      <div className="flex max-w-220 flex-col gap-8">
        {visao?.map(({ area, grupos }) => (
          <section key={area.id} className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-subtitulo font-semibold">
              <span aria-hidden className="size-3 rounded-full" style={{ backgroundColor: area.cor }} />
              {area.nome}
            </h2>
            {grupos.length === 0 && <p className="text-cinza-600">{t("projetos.semGrupos")}</p>}
            {grupos.map((grupo) => (
              <CartaoGrupo key={grupo.id} grupo={grupo} />
            ))}
          </section>
        ))}
      </div>

      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("projetos.novoTitulo")}</DialogTitle>
          </DialogHeader>
          {criando && (
            <FormularioProjeto
              valoresIniciais={PROJETO_VAZIO}
              rotuloSalvar={t("projetos.acoes.criar")}
              aoSalvar={aoCriar}
              aoCancelar={() => setCriando(false)}
              focar
            />
          )}
        </DialogContent>
      </Dialog>
    </TelaBase>
  );
}
