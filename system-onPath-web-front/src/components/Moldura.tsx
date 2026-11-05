import { Outlet } from "react-router";

import { MenuLateral } from "./MenuLateral";
import estilos from "./Moldura.module.css";
import { PreparoPrimeiroUso } from "./PreparoPrimeiroUso";

/** Menu fixo à esquerda e a tela atual ao lado. */
export function Moldura() {
  return (
    <div className={estilos.moldura}>
      <MenuLateral />
      <main className={estilos.conteudo}>
        <PreparoPrimeiroUso>
          <Outlet />
        </PreparoPrimeiroUso>
      </main>
    </div>
  );
}
