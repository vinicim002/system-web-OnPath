import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAceitarProposta, useMarcarRealizado, useRecusarProposta, useRotinasPerdidas } from "@/dados/consultas";
import type { Intervalo, RotinaPerdida } from "@/dados/contratos";
import { avisarErro } from "@/features/caixa/avisos";
import { t } from "@/i18n";
import { dataLocal, horaLocal } from "@/i18n/datas";

const horario = (intervalo: Intervalo) => `${horaLocal(intervalo.inicio)}–${horaLocal(intervalo.fim)}`;

function LinhaPerdida({ perdida, hoje }: { perdida: RotinaPerdida; hoje: string }) {
  const aceitar = useAceitarProposta();
  const recusar = useRecusarProposta();
  const realizar = useMarcarRealizado();
  const ocupado = aceitar.isPending || recusar.isPending || realizar.isPending;
  const { proposta } = perdida;

  async function executar(acao: () => Promise<unknown>, aviso: string) {
    try {
      await acao();
      toast(aviso);
    } catch (erro) {
      avisarErro(erro);
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex flex-col gap-0.5">
        <p className="font-medium">{perdida.titulo}</p>
        <p className="text-pequeno text-cinza-500">
          {t("hoje.perdidas.era", { horario: horario(perdida.bloco) })}
          {" · "}
          {proposta === null
            ? t("hoje.perdidas.semProposta")
            : dataLocal(proposta.inicio) === hoje
              ? t("hoje.perdidas.proposta", { horario: horario(proposta) })
              : t("hoje.perdidas.propostaAmanha", { horario: horario(proposta) })}
        </p>
      </div>
      <div className="flex gap-2">
        {proposta !== null && (
          <Button
            size="sm"
            disabled={ocupado}
            onClick={() =>
              void executar(() => aceitar.mutateAsync({ id: perdida.bloco.id, proposta }), t("hoje.perdidas.remarcada"))
            }
          >
            {t("hoje.perdidas.aceitar")}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={ocupado}
          onClick={() => void executar(() => realizar.mutateAsync(perdida.bloco.id), t("hoje.perdidas.feita"))}
        >
          {t("hoje.perdidas.fiz")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={ocupado}
          onClick={() => void executar(() => recusar.mutateAsync(perdida.bloco.id), t("hoje.perdidas.recusada"))}
        >
          {t("hoje.perdidas.recusar")}
        </Button>
      </div>
    </li>
  );
}

/** Rotinas de hoje que passaram sem ser feitas, com a proposta de novo horário (RN18). */
export function RotinasPerdidas({ hoje }: { hoje: string }) {
  const { data: perdidas } = useRotinasPerdidas(hoje);
  if (!perdidas || perdidas.length === 0) return null;
  return (
    <section className="flex flex-col gap-2" aria-labelledby="titulo-perdidas">
      <h2 id="titulo-perdidas" className="text-pequeno font-medium text-cinza-600">
        {t("hoje.perdidas.titulo")}
      </h2>
      <ul className="flex flex-col gap-2">
        {perdidas.map((perdida) => (
          <LinhaPerdida key={perdida.bloco.id} perdida={perdida} hoje={hoje} />
        ))}
      </ul>
    </section>
  );
}
