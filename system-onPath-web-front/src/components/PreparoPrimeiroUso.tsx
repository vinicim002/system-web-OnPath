import { useEffect, useState, type ReactNode } from "react";

import { ehErroOnPath } from "@/dados/erros";
import { useRenovarBlocos } from "@/dados/consultas";
import { useServicos } from "@/dados/ServicosProvider";
import { useHoje } from "@/features/hoje/useHoje";
import { hoje } from "@/i18n/datas";
import { t } from "@/i18n";

type Estado = { fase: "carregando" } | { fase: "pronto" } | { fase: "erro"; mensagem: string };

/** Garante os dados iniciais antes de mostrar as telas. */
export function PreparoPrimeiroUso({ children }: { children: ReactNode }) {
  const { dados, rotinas } = useServicos();
  const [estado, setEstado] = useState<Estado>({ fase: "carregando" });

  useEffect(() => {
    let ativo = true;
    dados
      .prepararPrimeiroUso()
      // Os blocos das rotinas são gerados antes de as telas aparecerem, para a Agenda já os ler.
      .then(() => rotinas.renovarBlocos(hoje()))
      .then(() => ativo && setEstado({ fase: "pronto" }))
      .catch((erro: unknown) => {
        if (!ativo) return;
        const mensagem = ehErroOnPath(erro) ? erro.mensagem : t("erros.armazenamento_indisponivel");
        setEstado({ fase: "erro", mensagem });
      });
    return () => {
      ativo = false;
    };
  }, [dados, rotinas]);

  // Na virada do dia, a janela de 14 dias anda junto (specs/008-agenda).
  useRenovarBlocos(useHoje(), estado.fase === "pronto");

  if (estado.fase === "pronto") return children;

  return (
    <div className="flex h-full items-center justify-center p-8">
      {estado.fase === "carregando" ? (
        <p className="text-cinza-600" role="status">
          {t("carregando")}
        </p>
      ) : (
        <div className="flex max-w-120 flex-col gap-2" role="alert">
          <p className="font-medium">{estado.mensagem}</p>
          <p className="text-cinza-600">{t("erros.acao.liberarArmazenamento")}</p>
        </div>
      )}
    </div>
  );
}
