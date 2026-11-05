import { ListFilter } from "lucide-react";
import { Popover } from "radix-ui";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Area } from "@/dados/tipos";
import { t } from "@/i18n";

import { filtroAtivo, FILTRO_VAZIO, STATUS_FILTRO, TIPOS_FILTRO, type FiltroAgenda as Filtro } from "./visoes";

function alternar<T>(lista: T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

function Grupo<T extends string>({
  titulo,
  opcoes,
  marcados,
  aoMudar,
}: {
  titulo: string;
  opcoes: { valor: T; rotulo: string }[];
  marcados: T[];
  aoMudar: (valores: T[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1 text-pequeno font-medium text-cinza-500">{titulo}</legend>
      {opcoes.map(({ valor, rotulo }) => {
        const id = `filtro-${titulo}-${valor}`;
        return (
          <label key={valor} htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox id={id} checked={marcados.includes(valor)} onCheckedChange={() => aoMudar(alternar(marcados, valor))} />
            {rotulo}
          </label>
        );
      })}
    </fieldset>
  );
}

/** Filtro comum a todas as visões: tipo, área e status (FR-002). */
export function FiltroAgenda({ filtro, areas, aoMudar }: { filtro: Filtro; areas: Area[]; aoMudar: (filtro: Filtro) => void }) {
  const quantidade = filtroAtivo(filtro);
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="sm" className={quantidade > 0 ? "text-preto" : "text-cinza-600"}>
          <ListFilter />
          {quantidade > 0 ? t("agenda.filtro.botaoAtivo", { quantidade }) : t("agenda.filtro.botao")}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 flex w-64 flex-col gap-4 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md"
        >
          <Grupo
            titulo={t("agenda.filtro.tipos")}
            opcoes={TIPOS_FILTRO.map((valor) => ({ valor, rotulo: t(`agenda.filtro.tipo.${valor}`) }))}
            marcados={filtro.tipos}
            aoMudar={(tipos) => aoMudar({ ...filtro, tipos })}
          />
          <Grupo
            titulo={t("agenda.filtro.areas")}
            opcoes={areas.map((area) => ({ valor: area.id, rotulo: area.nome }))}
            marcados={filtro.areas}
            aoMudar={(selecionadas) => aoMudar({ ...filtro, areas: selecionadas })}
          />
          <Grupo
            titulo={t("agenda.filtro.status")}
            opcoes={STATUS_FILTRO.map((valor) => ({ valor, rotulo: t(`agenda.filtro.situacao.${valor}`) }))}
            marcados={filtro.status}
            aoMudar={(status) => aoMudar({ ...filtro, status })}
          />
          {quantidade > 0 && (
            <Button variant="outline" size="sm" onClick={() => aoMudar(FILTRO_VAZIO)}>
              {t("agenda.filtro.limpar")}
            </Button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
