import { z } from "zod";

import type { Preferencias, ServicoPreferencias } from "../contratos";
import { criarErro } from "../erros";

/** Fora das coleções, como o modo escuro: não entra na cópia de dados (research.md, item 1). */
const CHAVE = "onpath:preferencias";

export const PREFERENCIAS_PADRAO: Preferencias = {
  horaInicioDia: "07:00",
  horaFimDia: "23:00",
  lembretesAtivos: false,
};

const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const esquema = z.object({ horaInicioDia: hora, horaFimDia: hora, lembretesAtivos: z.boolean() });

/** Lê as preferências; um valor ausente ou estragado volta ao padrão. */
export function lerPreferencias(): Preferencias {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto === null) return { ...PREFERENCIAS_PADRAO };
    const lido = esquema.safeParse({ ...PREFERENCIAS_PADRAO, ...(JSON.parse(bruto) as object) });
    return lido.success ? lido.data : { ...PREFERENCIAS_PADRAO };
  } catch {
    return { ...PREFERENCIAS_PADRAO };
  }
}

export function criarServicoPreferencias(): ServicoPreferencias {
  return {
    async obter() {
      return lerPreferencias();
    },

    async alterar(dados) {
      const novo = { ...lerPreferencias(), ...dados };
      const lido = esquema.safeParse(novo);
      if (!lido.success) {
        const campos = [...new Set(lido.error.issues.map((problema) => String(problema.path[0])))];
        throw criarErro("dados_invalidos", { campos });
      }
      if (lido.data.horaFimDia <= lido.data.horaInicioDia) throw criarErro("dados_invalidos", { campos: ["horaFimDia"] });
      try {
        localStorage.setItem(CHAVE, JSON.stringify(lido.data));
      } catch (causa) {
        throw criarErro("armazenamento_indisponivel", { causa: String(causa) });
      }
      return lido.data;
    },
  };
}
