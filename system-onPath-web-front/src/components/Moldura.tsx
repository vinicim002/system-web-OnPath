import { useState } from "react";
import { Outlet } from "react-router";

import { Toaster } from "@/components/ui/sonner";
import { CapturaRapida } from "@/features/caixa/CapturaRapida";
import { useAtalhoCaptura } from "@/features/caixa/useAtalhoCaptura";

import { MenuLateral } from "./MenuLateral";
import { PreparoPrimeiroUso } from "./PreparoPrimeiroUso";

/** Menu fixo à esquerda e a tela atual ao lado, com o campo rápido e os avisos. */
export function Moldura() {
  const [capturaAberta, setCapturaAberta] = useState(false);
  // O atalho só abre: com o campo já aberto, nada muda (não abre um segundo campo).
  useAtalhoCaptura(() => setCapturaAberta(true));

  return (
    <div className="flex h-full">
      <MenuLateral abrirCaptura={() => setCapturaAberta(true)} />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <PreparoPrimeiroUso>
          <Outlet />
        </PreparoPrimeiroUso>
      </main>
      <CapturaRapida aberta={capturaAberta} aoMudar={setCapturaAberta} />
      <Toaster position="bottom-right" />
    </div>
  );
}
