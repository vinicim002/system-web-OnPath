import { TelaBase } from "@/components/TelaBase";
import { useCapturarItem } from "@/dados/consultas";
import { CampoAnotacao } from "@/features/caixa/CampoAnotacao";
import { ListaCaixa } from "@/features/caixa/ListaCaixa";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";

export function Caixa() {
  const capturar = useCapturarItem();

  async function aoSalvar(conteudo: string) {
    try {
      await capturar.mutateAsync(conteudo);
      return true;
    } catch (erro) {
      avisarErro(erro);
      return false;
    }
  }

  return (
    <TelaBase titulo={t("telas.caixa.titulo")}>
      <div className="flex max-w-180 flex-col gap-6">
        <CampoAnotacao
          aoSalvar={aoSalvar}
          focarAoMontar
          rotulo={t("caixa.campo")}
          placeholder={t("caixa.campo")}
          dica={t("caixa.dicaCampo")}
        />
        <ListaCaixa />
      </div>
    </TelaBase>
  );
}
