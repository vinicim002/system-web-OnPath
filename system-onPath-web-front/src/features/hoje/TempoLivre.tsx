import { TriangleAlert } from "lucide-react";

import { useTempoLivre } from "@/dados/consultas";
import { t } from "@/i18n";
import { duracao } from "@/i18n/datas";

/** Tempo livre do dia (texto ao lado do planejado). */
export function TextoLivre({ data }: { data: string }) {
  const { data: livre } = useTempoLivre(data);
  if (!livre) return null;
  return <>{t("hoje.livre", { tempo: duracao(livre.livreMin) })}</>;
}

/** Aviso de dia cheio: o planejado passou do tempo livre, sem bloquear nada (RN10). */
export function AvisoDiaCheio({ data, planejadoMin }: { data: string; planejadoMin: number }) {
  const { data: livre } = useTempoLivre(data);
  if (!livre || planejadoMin <= livre.livreMin) return null;
  return (
    <p role="status" className="flex items-start gap-2 rounded-lg border border-roxo/40 bg-roxo/5 p-3 text-pequeno">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-roxo" aria-hidden />
      {t("hoje.diaCheio", { tempo: duracao(planejadoMin - livre.livreMin) })}
    </p>
  );
}
