import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/** Escolha do usuário: claro, escuro ou seguir o sistema (docs/spec.md, seção 7). */
export type Modo = "claro" | "escuro" | "sistema";

const CHAVE = "onpath:modo";
const CONSULTA_ESCURO = "(prefers-color-scheme: dark)";

export function lerModo(): Modo {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === "claro" || salvo === "escuro" || salvo === "sistema") return salvo;
  } catch {
    // Sem armazenamento: segue o sistema.
  }
  return "sistema";
}

function sistemaEscuro(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.(CONSULTA_ESCURO).matches === true;
}

/** Se a tela deve ficar escura com este modo. */
export function ficaEscuro(modo: Modo): boolean {
  return modo === "escuro" || (modo === "sistema" && sistemaEscuro());
}

/** Liga ou desliga a classe .dark na raiz. Chamado antes da primeira pintura, em main.tsx. */
export function aplicarModo(modo: Modo = lerModo()): void {
  document.documentElement.classList.toggle("dark", ficaEscuro(modo));
}

function assinarSistema(aoMudar: () => void): () => void {
  const consulta = window.matchMedia?.(CONSULTA_ESCURO);
  consulta?.addEventListener("change", aoMudar);
  return () => consulta?.removeEventListener("change", aoMudar);
}

/** Modo escolhido, se a tela está escura e a troca para o próximo modo (claro → escuro → sistema). */
export function useModo() {
  const [modo, setModo] = useState<Modo>(lerModo);
  // Acompanha a preferência do sistema operacional, para o modo "sistema".
  const sistema = useSyncExternalStore(assinarSistema, sistemaEscuro, () => false);
  const escuro = modo === "escuro" || (modo === "sistema" && sistema);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", escuro);
  }, [escuro]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, modo);
    } catch {
      // Sem armazenamento: vale só nesta sessão.
    }
  }, [modo]);

  const alternar = useCallback(
    () => setModo((atual) => (atual === "claro" ? "escuro" : atual === "escuro" ? "sistema" : "claro")),
    [],
  );

  return { modo, escuro, alternar };
}
