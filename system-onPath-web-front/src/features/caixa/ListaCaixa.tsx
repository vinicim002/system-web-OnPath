import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useItensDescartados, useItensNovos } from "@/dados/consultas";
import { t } from "@/i18n";

import { ItemCaixa } from "./ItemCaixa";
import { ItemDescartado } from "./ItemDescartado";

function Contagem({ valor }: { valor: number }) {
  return <span className="text-pequeno text-cinza-500">{valor}</span>;
}

/** Abas Caixa e Descartados, cada uma com a contagem (FR-013). */
export function ListaCaixa() {
  const { data: novos = [] } = useItensNovos();
  const { data: descartados = [] } = useItensDescartados();

  return (
    <Tabs defaultValue="caixa" className="gap-4">
      <TabsList>
        <TabsTrigger value="caixa">
          {t("caixa.abas.caixa")} <Contagem valor={novos.length} />
        </TabsTrigger>
        <TabsTrigger value="descartados">
          {t("caixa.abas.descartados")} <Contagem valor={descartados.length} />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="caixa">
        {novos.length === 0 ? (
          <p className="max-w-140 px-3 text-cinza-600">{t("caixa.vazia")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-cinza-100">
            {novos.map((item) => (
              <ItemCaixa key={item.id} item={item} />
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="descartados">
        {descartados.length === 0 ? (
          <p className="px-3 text-cinza-600">{t("caixa.descartadosVazia")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-cinza-100">
            {descartados.map((item) => (
              <ItemDescartado key={item.id} item={item} />
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}
