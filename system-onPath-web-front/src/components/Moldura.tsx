import { Outlet } from "react-router";

import { MenuLateral } from "./MenuLateral";
import { PreparoPrimeiroUso } from "./PreparoPrimeiroUso";

/** Menu fixo à esquerda e a tela atual ao lado. */
export function Moldura() {
  return (
    <div className="flex h-full">
      <MenuLateral />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <PreparoPrimeiroUso>
          <Outlet />
        </PreparoPrimeiroUso>
      </main>
    </div>
  );
}
