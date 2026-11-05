import { useState } from "react";
import { Outlet } from "react-router";

import { Toaster } from "@/components/ui/sonner";
import { CapturaRapida } from "@/features/caixa/CapturaRapida";
import { useAtalhoCaptura } from "@/features/caixa/useAtalhoCaptura";
import { useRenovarBlocos } from "@/dados/consultas";
import { useHoje } from "@/features/hoje/useHoje";
import { useModo } from "@/theme/modo";

import { MenuLateral } from "./MenuLateral";
import { PreparoPrimeiroUso } from "./PreparoPrimeiroUso";

/** Menu fixo à esquerda e a tela atual ao lado, com o campo rápido e os avisos. */
export function Moldura() {
  const [capturaAberta, setCapturaAberta] = useState(false);
  // O atalho só abre: com o campo já aberto, nada muda (não abre um segundo campo).
  useAtalhoCaptura(() => setCapturaAberta(true));
  const { modo, escuro, alternar } = useModo();
  useRenovarBlocos(useHoje());

  return (
    <div className="flex h-full gap-3 bg-linear-to-br from-cinza-100 via-cinza-50 to-cinza-200 p-3">
      <MenuLateral abrirCaptura={() => setCapturaAberta(true)} modo={modo} alternarModo={alternar} />
      <main className="min-w-0 flex-1 overflow-y-auto rounded-3xl border border-cinza-200/70 bg-branco shadow-sm">
        <PreparoPrimeiroUso>
          <Outlet />
        </PreparoPrimeiroUso>
      </main>
      <CapturaRapida aberta={capturaAberta} aoMudar={setCapturaAberta} />
      <Toaster position="bottom-right" theme={escuro ? "dark" : "light"} />
    </div>
  );
}
