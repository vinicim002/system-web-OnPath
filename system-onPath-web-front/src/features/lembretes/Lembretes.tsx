import { useEffect } from "react";
import { toast } from "sonner";

import { useLembretesDevidos, usePreferencias } from "@/dados/consultas";
import { t } from "@/i18n";
import { horaLocal } from "@/i18n/datas";

import { avisarUmaVez } from "./avisados";
import { lerPermissao } from "./permissao";

/**
 * Lembretes com o app aberto (docs/plan.md, "Lembretes"): aviso no app e, com permissão, uma
 * notificação do sistema. Não desenha nada.
 */
export function Lembretes() {
  const { data: preferencias } = usePreferencias();
  const { data: devidos } = useLembretesDevidos(preferencias?.lembretesAtivos === true);

  useEffect(() => {
    if (!devidos || preferencias?.lembretesAtivos !== true) return;
    for (const item of devidos) {
      if (!avisarUmaVez(item.id, item.inicio)) continue;
      const minutos = Math.max(0, Math.round((Date.parse(item.inicio) - Date.now()) / 60_000));
      const titulo = t("lembretes.titulo", { titulo: item.titulo, horario: horaLocal(item.inicio) });
      const corpo = minutos === 0 ? t("lembretes.corpoAgora") : t("lembretes.corpo", { minutos });
      toast(titulo, { description: corpo, duration: 15_000 });
      if (lerPermissao() === "granted") {
        try {
          new Notification(titulo, { body: corpo, tag: `onpath-${item.id}` });
        } catch {
          // Alguns navegadores só notificam por service worker; o aviso no app já apareceu.
        }
      }
    }
  }, [devidos, preferencias?.lembretesAtivos]);

  return null;
}
