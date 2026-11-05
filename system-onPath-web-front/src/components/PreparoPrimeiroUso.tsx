import { useEffect, useState, type ReactNode } from "react";

import { ehErroOnPath } from "@/dados/erros";
import { useServicos } from "@/dados/ServicosProvider";
import { t } from "@/i18n";

import estilos from "./PreparoPrimeiroUso.module.css";

type Estado = { fase: "carregando" } | { fase: "pronto" } | { fase: "erro"; mensagem: string };

/** Garante os dados iniciais antes de mostrar as telas. */
export function PreparoPrimeiroUso({ children }: { children: ReactNode }) {
  const { dados } = useServicos();
  const [estado, setEstado] = useState<Estado>({ fase: "carregando" });

  useEffect(() => {
    let ativo = true;
    dados
      .prepararPrimeiroUso()
      .then(() => ativo && setEstado({ fase: "pronto" }))
      .catch((erro: unknown) => {
        if (!ativo) return;
        const mensagem = ehErroOnPath(erro) ? erro.mensagem : t("erros.armazenamento_indisponivel");
        setEstado({ fase: "erro", mensagem });
      });
    return () => {
      ativo = false;
    };
  }, [dados]);

  if (estado.fase === "pronto") return children;

  return (
    <div className={estilos.centro}>
      {estado.fase === "carregando" ? (
        <p className={estilos.texto} role="status">
          {t("carregando")}
        </p>
      ) : (
        <div className={estilos.erro} role="alert">
          <p className={estilos.titulo}>{estado.mensagem}</p>
          <p className={estilos.texto}>{t("erros.acao.liberarArmazenamento")}</p>
        </div>
      )}
    </div>
  );
}
