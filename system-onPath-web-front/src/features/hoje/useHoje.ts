import { useEffect, useState } from "react";

import { hoje, milissegundosAteAmanha } from "@/i18n/datas";

/**
 * Data de hoje (AAAA-MM-DD) no fuso do usuário, recalculada quando a janela volta a ficar visível
 * e na virada do dia (FR-020 de specs/004-hoje).
 */
export function useHoje(): string {
  const [data, setData] = useState(() => hoje());

  useEffect(() => {
    const atualizar = () => setData(hoje());
    const temporizador = window.setTimeout(atualizar, milissegundosAteAmanha());
    document.addEventListener("visibilitychange", atualizar);
    window.addEventListener("focus", atualizar);
    return () => {
      window.clearTimeout(temporizador);
      document.removeEventListener("visibilitychange", atualizar);
      window.removeEventListener("focus", atualizar);
    };
  }, [data]);

  return data;
}
