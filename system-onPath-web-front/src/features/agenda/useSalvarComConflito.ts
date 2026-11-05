import { useState } from "react";

import type { Ocupante } from "@/dados/contratos";
import { ehErroOnPath } from "@/dados/erros";
import { avisarErro } from "@/features/caixa/avisos";

/**
 * Executa uma gravação que pode esbarrar em horário ocupado: na primeira tentativa, sem
 * confirmação; se vier `horario_ocupado`, guarda os ocupantes para o diálogo e repete confirmando.
 * Devolve os campos inválidos, quando houver, para o formulário mostrar.
 */
export function useSalvarComConflito() {
  const [pendente, setPendente] = useState<{ ocupantes: Ocupante[]; repetir: () => Promise<void> } | null>(null);

  async function salvar(acao: (confirmarConflito: boolean) => Promise<void>): Promise<string[]> {
    try {
      await acao(false);
      return [];
    } catch (erro) {
      if (ehErroOnPath(erro) && erro.codigo === "horario_ocupado") {
        setPendente({
          ocupantes: erro.detalhes.ocupantes as Ocupante[],
          repetir: async () => {
            setPendente(null);
            try {
              await acao(true);
            } catch (segundo) {
              avisarErro(segundo);
            }
          },
        });
        return [];
      }
      if (ehErroOnPath(erro) && erro.codigo === "dados_invalidos") return (erro.detalhes.campos as string[]) ?? [];
      avisarErro(erro);
      return [];
    }
  }

  return {
    salvar,
    ocupantes: pendente?.ocupantes ?? null,
    confirmar: () => void pendente?.repetir(),
    voltar: () => setPendente(null),
  };
}
