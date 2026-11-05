import { useEffect, useState } from "react";

/** Minuto atual, atualizado a cada minuto, para a linha de agora. */
export function useAgora(): string {
  const [agora, setAgora] = useState(() => new Date().toISOString());
  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(new Date().toISOString()), 60_000);
    return () => window.clearInterval(intervalo);
  }, []);
  return agora;
}
