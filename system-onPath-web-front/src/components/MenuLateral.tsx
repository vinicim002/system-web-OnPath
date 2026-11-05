import { NavLink } from "react-router";

import { t, type ChaveTexto } from "@/i18n";

import { Logo } from "./Logo";
import estilos from "./MenuLateral.module.css";

const ITENS: { rota: string; rotulo: ChaveTexto }[] = [
  { rota: "/", rotulo: "menu.hoje" },
  { rota: "/caixa", rotulo: "menu.caixa" },
  { rota: "/tarefas", rotulo: "menu.tarefas" },
  { rota: "/projetos", rotulo: "menu.projetos" },
  { rota: "/areas", rotulo: "menu.areas" },
  { rota: "/agenda", rotulo: "menu.agenda" },
  { rota: "/rotinas", rotulo: "menu.rotinas" },
  { rota: "/estudos", rotulo: "menu.estudos" },
  { rota: "/ajustes", rotulo: "menu.ajustes" },
];

export function MenuLateral() {
  return (
    <nav className={estilos.menu}>
      <div className={estilos.logo}>
        <Logo altura={26} />
      </div>
      {ITENS.map((item) => (
        <NavLink
          key={item.rota}
          to={item.rota}
          end
          className={({ isActive }) => (isActive ? `${estilos.item} ${estilos.ativo}` : estilos.item)}
        >
          {t(item.rotulo)}
        </NavLink>
      ))}
    </nav>
  );
}
