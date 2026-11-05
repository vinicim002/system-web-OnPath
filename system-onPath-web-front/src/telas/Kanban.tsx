import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { TelaBase } from "@/components/TelaBase";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOpcoesTarefa } from "@/dados/consultas";
import type { StatusProjeto } from "@/dados/tipos";
import { EditarColunas } from "@/features/kanban/EditarColunas";
import { QuadroKanban } from "@/features/kanban/QuadroKanban";
import { t } from "@/i18n";

const ORDEM_STATUS: Record<StatusProjeto, number> = { ativo: 0, pausado: 1, fila: 2, concluido: 3, cancelado: 4 };

/** Atalho do menu para o Kanban, com seletor de projeto (docs/spec.md, seção 6.7). */
export function Kanban() {
  const [parametros, setParametros] = useSearchParams();
  const { data: opcoes } = useOpcoesTarefa();
  const [editandoColunas, setEditandoColunas] = useState(false);

  // Ativos primeiro, depois pausados, fila e encerrados; dentro de cada um, por nome.
  const projetos = useMemo(
    () =>
      [...(opcoes?.projetos ?? [])].sort(
        (a, b) => ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status] || a.nome.localeCompare(b.nome, "pt-BR"),
      ),
    [opcoes],
  );

  const escolhido = projetos.find((p) => p.id === parametros.get("projeto")) ?? projetos[0];

  return (
    <TelaBase titulo={t("telas.kanban.titulo")}>
      {opcoes && projetos.length === 0 ? (
        <p className="text-cinza-600">{t("kanban.semProjetos")}</p>
      ) : (
        <div className="-mt-2 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={escolhido?.id}
              onValueChange={(id) => {
                setParametros({ projeto: id }, { replace: true });
                setEditandoColunas(false);
              }}
            >
              <SelectTrigger aria-label={t("kanban.projeto")} className="min-w-64">
                <SelectValue placeholder={t("kanban.escolherProjeto")} />
              </SelectTrigger>
              <SelectContent>
                {projetos.map((projeto) => (
                  <SelectItem key={projeto.id} value={projeto.id}>
                    {projeto.nome}
                    <span className="text-cinza-500"> · {t(`projetos.status.${projeto.status}`)}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {escolhido && (
              <>
                <Button variant="outline" size="sm" onClick={() => setEditandoColunas((atual) => !atual)}>
                  {editandoColunas ? t("kanban.fecharEdicao") : t("kanban.editarColunas")}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/projetos/${escolhido.id}`}>
                    <ExternalLink />
                    {t("kanban.abrirProjeto")}
                  </Link>
                </Button>
              </>
            )}
          </div>
          {escolhido && editandoColunas && <EditarColunas projetoId={escolhido.id} />}
          {escolhido && <QuadroKanban key={escolhido.id} projeto={escolhido} />}
        </div>
      )}
    </TelaBase>
  );
}
