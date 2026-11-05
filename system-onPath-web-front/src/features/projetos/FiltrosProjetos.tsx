import { useSearchParams } from "react-router";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOpcoesProjeto } from "@/dados/consultas";
import type { FiltrosProjetos as Filtros } from "@/dados/contratos";
import { t } from "@/i18n";

import { STATUS_PROJETO as STATUS } from "./filtros";

const TODOS = "_";

/** Filtros de área e status, guardados no endereço (FR-015). */
export function FiltrosProjetos({ filtros }: { filtros: Filtros }) {
  const [parametros, setParametros] = useSearchParams();
  const { data: opcoes } = useOpcoesProjeto();

  function mudar(chave: "area" | "status", valor: string) {
    const novos = new URLSearchParams(parametros);
    if (valor === TODOS) novos.delete(chave);
    else novos.set(chave, valor);
    setParametros(novos);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={filtros.areaId ?? TODOS} onValueChange={(valor) => mudar("area", valor)}>
        <SelectTrigger size="sm" aria-label={t("projetos.filtros.area")} className="min-w-36">
          <span className="text-cinza-500">{t("projetos.filtros.area")}:</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>{t("projetos.filtros.todas")}</SelectItem>
          {opcoes?.areas.map((area) => (
            <SelectItem key={area.id} value={area.id}>
              {area.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filtros.status ?? TODOS} onValueChange={(valor) => mudar("status", valor)}>
        <SelectTrigger size="sm" aria-label={t("projetos.filtros.status")} className="min-w-36">
          <span className="text-cinza-500">{t("projetos.filtros.status")}:</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>{t("projetos.filtros.todos")}</SelectItem>
          {STATUS.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`projetos.status.${status}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
