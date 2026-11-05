import { useEffect, useEffectEvent } from "react";

function ehMac(): boolean {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
}

/** Texto do atalho para mostrar na tela: "⌘K" no Mac e "Ctrl K" nos demais. */
export function textoAtalho(): string {
  return ehMac() ? "⌘K" : "Ctrl K";
}

/**
 * Ctrl+K (⌘K no Mac) em qualquer tela, mesmo com o foco em um campo de texto
 * (specs/002-caixa-entrada/research.md, item 4).
 */
export function useAtalhoCaptura(aoAtivar: () => void): void {
  const ativar = useEffectEvent(aoAtivar);

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      const modificador = ehMac() ? evento.metaKey : evento.ctrlKey;
      if (!modificador || evento.altKey || evento.shiftKey) return;
      if (evento.key.toLowerCase() !== "k") return;
      evento.preventDefault();
      if (!evento.repeat) ativar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);
}
