import { AlertCircle } from "lucide-react";
import { Link } from "react-router";

import type { ProjetoNaVisao } from "@/dados/contratos";
import { t } from "@/i18n";
import { dataPrazo } from "@/i18n/datas";
import { cn } from "@/lib/utils";

import { AcoesStatus } from "./AcoesStatus";

interface Props {
  projeto: ProjetoNaVisao;
  grupo: string;
  /** Alça de arrastar, na fila. */
  alca?: React.ReactNode;
  posicao?: number;
}

/** Um projeto: nome, prioridade, prazo, aviso de próxima ação e ações de status (FR-009 e FR-010). */
export function LinhaProjeto({ projeto, grupo, alca, posicao }: Props) {
  const encerrado = projeto.status === "concluido" || projeto.status === "cancelado";
  return (
    <div className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-2 py-1.5 hover:bg-cinza-50">
      {alca}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {posicao !== undefined && <span className="w-5 shrink-0 text-right text-pequeno text-cinza-400">{posicao}.</span>}
        <Link to={`/projetos/${projeto.id}`} className={cn("truncate hover:underline", encerrado && "text-cinza-500")}>
          {projeto.nome}
        </Link>
        <span className="shrink-0 text-pequeno text-cinza-500">
          {[
            t(`tarefas.prioridades.${projeto.prioridade}`),
            projeto.prazo ? dataPrazo(projeto.prazo) : null,
            encerrado ? t(`projetos.status.${projeto.status}`) : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
        {projeto.semProximaAcao && (
          <span className="flex shrink-0 items-center gap-1 text-pequeno font-medium">
            <AlertCircle aria-hidden className="size-3.5" />
            {t("projetos.semProximaAcao")}
          </span>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
        <AcoesStatus projeto={projeto} grupo={grupo} />
      </div>
    </div>
  );
}
