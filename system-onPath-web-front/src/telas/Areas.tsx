import { Plus } from "lucide-react";
import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { TelaBase } from "@/components/TelaBase";
import { Button } from "@/components/ui/button";
import { useAreasComResumo, useCriarArea } from "@/dados/consultas";
import { ehErroOnPath, type ErroOnPath } from "@/dados/erros";
import { FormularioArea, type ValoresArea } from "@/features/areas/FormularioArea";
import { GruposDaArea } from "@/features/areas/GruposDaArea";
import { ListaAreas } from "@/features/areas/ListaAreas";
import { MetasDaArea } from "@/features/areas/MetasDaArea";
import { PainelArea } from "@/features/areas/PainelArea";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";
import { TONS_AREA } from "@/theme";

const NOVA_AREA: ValoresArea = { nome: "", cor: TONS_AREA[0]! };

/** Tela Áreas e metas: áreas à esquerda e a área escolhida à direita (contracts/interface.md). */
export function Areas() {
  const [parametros, setParametros] = useSearchParams();
  const { data: areas = [] } = useAreasComResumo();
  const criar = useCriarArea();
  const escolhida = parametros.get("area");

  const abrir = useCallback(
    (id: string | null) =>
      setParametros((atuais) => {
        const novos = new URLSearchParams(atuais);
        if (id) novos.set("area", id);
        else novos.delete("area");
        return novos;
      }),
    [setParametros],
  );

  // Sem área escolhida, mostra a primeira.
  const area = escolhida && escolhida !== "nova" ? areas.find((a) => a.id === escolhida) : escolhida ? undefined : areas[0];

  async function aoCriar(valores: ValoresArea): Promise<ErroOnPath | null> {
    try {
      const nova = await criar.mutateAsync(valores);
      toast(t("areas.avisos.criada"));
      abrir(nova.id);
      return null;
    } catch (erro) {
      if (ehErroOnPath(erro) && (erro.codigo === "dados_invalidos" || erro.codigo === "nome_repetido")) return erro;
      avisarErro(erro);
      return ehErroOnPath(erro) ? erro : null;
    }
  }

  return (
    <TelaBase titulo={t("telas.areas.titulo")}>
      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-3">
          <div>
            <Button variant="outline" onClick={() => abrir("nova")}>
              <Plus />
              {t("areas.nova")}
            </Button>
          </div>
          <ListaAreas selecionada={area?.id ?? null} aoAbrir={abrir} />
        </div>
        <div className="min-w-0 max-w-180">
          {escolhida === "nova" ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-subtitulo font-semibold">{t("areas.novaTitulo")}</h2>
              <FormularioArea
                valoresIniciais={NOVA_AREA}
                rotuloSalvar={t("areas.criar")}
                aoSalvar={aoCriar}
                aoCancelar={() => abrir(null)}
                focar
              />
            </section>
          ) : area ? (
            <PainelArea key={area.id} area={area} aoArquivar={() => abrir(null)}>
              <MetasDaArea areaId={area.id} />
              <GruposDaArea areaId={area.id} />
            </PainelArea>
          ) : (
            <p className="text-cinza-600">{t("areas.vazia")}</p>
          )}
        </div>
      </div>
    </TelaBase>
  );
}
