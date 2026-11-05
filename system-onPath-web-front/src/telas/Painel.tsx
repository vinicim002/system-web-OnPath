import { TelaBase } from "@/components/TelaBase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Board } from "@/features/painel/Board";
import { documento } from "@/features/painel/documentos";
import { Documentos } from "@/features/painel/Documentos";
import { Historico } from "@/features/painel/Historico";
import { lerTarefas } from "@/features/painel/tarefas";
import { VisaoGeral } from "@/features/painel/VisaoGeral";
import { t } from "@/i18n";

/** Painel do projeto, só no modo de desenvolvimento (docs/plan.md, seção 1). */
export function Painel() {
  const etapas = lerTarefas(documento("docs/tasks.md")?.conteudo ?? "");

  return (
    <TelaBase titulo={t("painel.titulo")}>
      <p className="-mt-4 text-cinza-500">{t("painel.descricao")}</p>
      <Tabs defaultValue="visao" className="gap-6">
        <TabsList>
          <TabsTrigger value="visao">{t("painel.abas.visao")}</TabsTrigger>
          <TabsTrigger value="board">{t("painel.abas.board")}</TabsTrigger>
          <TabsTrigger value="historico">{t("painel.abas.historico")}</TabsTrigger>
          <TabsTrigger value="documentos">{t("painel.abas.documentos")}</TabsTrigger>
        </TabsList>
        <TabsContent value="visao">
          <VisaoGeral etapas={etapas} />
        </TabsContent>
        <TabsContent value="board">
          <Board etapas={etapas} />
        </TabsContent>
        <TabsContent value="historico">
          <Historico />
        </TabsContent>
        <TabsContent value="documentos">
          <Documentos />
        </TabsContent>
      </Tabs>
    </TelaBase>
  );
}
