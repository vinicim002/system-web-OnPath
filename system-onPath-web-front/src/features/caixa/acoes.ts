import { useMemo } from "react";
import { toast } from "sonner";

import { useDescartarItem, useEditarItem, useRecuperarItem } from "@/dados/consultas";
import { t } from "@/i18n";

import { avisarErro } from "./avisos";

export interface AcoesCaixa {
  descartar: (id: string) => Promise<void>;
  /** Devolve `true` se salvou. */
  editar: (id: string, conteudo: string) => Promise<boolean>;
}

/**
 * Ações dos itens da caixa, criadas uma vez para a lista inteira. Assim cada item não precisa
 * dos próprios hooks de escrita, e a lista continua leve com centenas de itens (SC-004 e SC-005).
 */
export function useAcoesCaixa(): AcoesCaixa {
  const { mutateAsync: descartar } = useDescartarItem();
  const { mutateAsync: recuperar } = useRecuperarItem();
  const { mutateAsync: editar } = useEditarItem();

  return useMemo(
    () => ({
      async descartar(id) {
        try {
          await descartar(id);
          toast(t("caixa.avisos.descartado"), {
            duration: 5000,
            action: {
              label: t("caixa.avisos.desfazer"),
              onClick: () => recuperar(id).catch(avisarErro),
            },
          });
        } catch (erro) {
          avisarErro(erro);
        }
      },
      async editar(id, conteudo) {
        try {
          await editar({ id, conteudo });
          return true;
        } catch (erro) {
          avisarErro(erro);
          return false;
        }
      },
    }),
    [descartar, recuperar, editar],
  );
}
