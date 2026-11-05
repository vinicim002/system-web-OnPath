import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlterarPreferencias, usePreferencias } from "@/dados/consultas";
import type { Preferencias as DadosPreferencias } from "@/dados/contratos";
import { avisarErro } from "@/features/caixa/avisos";
import { lerPermissao, pedirPermissao, type Permissao } from "@/features/lembretes/permissao";
import { t } from "@/i18n";

function JanelaDoDia({ atual }: { atual: DadosPreferencias }) {
  const alterar = useAlterarPreferencias();
  const [inicio, setInicio] = useState(atual.horaInicioDia);
  const [fim, setFim] = useState(atual.horaFimDia);
  const invalida = fim !== "" && inicio !== "" && fim <= inicio;

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    try {
      await alterar.mutateAsync({ horaInicioDia: inicio, horaFimDia: fim });
      toast(t("ajustes.dia.salva"));
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <section className="flex max-w-140 flex-col gap-3">
      <h2 className="text-subtitulo font-semibold">{t("ajustes.dia.titulo")}</h2>
      <p className="text-cinza-600">{t("ajustes.dia.descricao")}</p>
      <form className="flex flex-wrap items-end gap-3" onSubmit={(evento) => void salvar(evento)} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dia-inicio">{t("ajustes.dia.inicio")}</Label>
          <Input id="dia-inicio" type="time" className="w-32" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dia-fim">{t("ajustes.dia.fim")}</Label>
          <Input
            id="dia-fim"
            type="time"
            className="w-32"
            value={fim}
            aria-invalid={invalida}
            aria-describedby={invalida ? "dia-fim-erro" : undefined}
            onChange={(e) => setFim(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" disabled={invalida || alterar.isPending}>
          {t("ajustes.dia.salvar")}
        </Button>
      </form>
      {invalida && (
        <p id="dia-fim-erro" className="text-pequeno text-roxo">
          {t("ajustes.dia.fimAntes")}
        </p>
      )}
    </section>
  );
}

function Lembretes({ ativos }: { ativos: boolean }) {
  const alterar = useAlterarPreferencias();
  const [permissao, setPermissao] = useState<Permissao>(lerPermissao);

  async function mudar(ligar: boolean) {
    if (ligar) setPermissao(await pedirPermissao());
    try {
      await alterar.mutateAsync({ lembretesAtivos: ligar });
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <section className="flex max-w-140 flex-col gap-3">
      <h2 className="text-subtitulo font-semibold">{t("ajustes.lembretes.titulo")}</h2>
      <p className="text-cinza-600">{t("ajustes.lembretes.descricao")}</p>
      <div className="flex items-center gap-2">
        <Checkbox
          id="lembretes-ativos"
          checked={ativos}
          disabled={alterar.isPending}
          onCheckedChange={(valor) => void mudar(valor === true)}
        />
        <Label htmlFor="lembretes-ativos">{t("ajustes.lembretes.ativar")}</Label>
      </div>
      {ativos && permissao === "denied" && <p className="text-pequeno text-cinza-600">{t("ajustes.lembretes.negada")}</p>}
      {ativos && permissao === "sem_suporte" && (
        <p className="text-pequeno text-cinza-600">{t("ajustes.lembretes.semSuporte")}</p>
      )}
    </section>
  );
}

/** Janela do dia e lembretes (a tela Ajustes completa é a T030). */
export function Preferencias() {
  const { data: preferencias } = usePreferencias();
  if (!preferencias) return null;
  return (
    <>
      <JanelaDoDia key={`${preferencias.horaInicioDia}-${preferencias.horaFimDia}`} atual={preferencias} />
      <Lembretes ativos={preferencias.lembretesAtivos} />
    </>
  );
}
