import {
  BookOpen,
  CalendarDays,
  FolderKanban,
  Inbox,
  ListChecks,
  Repeat,
  Settings,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router";

import { useItensNovos } from "@/dados/consultas";
import { t, type ChaveTexto } from "@/i18n";
import { cn } from "@/lib/utils";

import { Logo } from "./Logo";

const ITENS: { rota: string; rotulo: ChaveTexto; Icone: LucideIcon }[] = [
  { rota: "/", rotulo: "menu.hoje", Icone: Sun },
  { rota: "/caixa", rotulo: "menu.caixa", Icone: Inbox },
  { rota: "/tarefas", rotulo: "menu.tarefas", Icone: ListChecks },
  { rota: "/projetos", rotulo: "menu.projetos", Icone: FolderKanban },
  { rota: "/areas", rotulo: "menu.areas", Icone: Target },
  { rota: "/agenda", rotulo: "menu.agenda", Icone: CalendarDays },
  { rota: "/rotinas", rotulo: "menu.rotinas", Icone: Repeat },
  { rota: "/estudos", rotulo: "menu.estudos", Icone: BookOpen },
  { rota: "/ajustes", rotulo: "menu.ajustes", Icone: Settings },
];

/** Quantidade de itens novos na caixa, escondida quando é zero (FR-008). */
function ContadorCaixa() {
  const { data: itens = [] } = useItensNovos();
  if (itens.length === 0) return null;
  return (
    <span
      aria-label={t("menu.itensNovos", { quantidade: itens.length })}
      className="ml-auto rounded-full bg-cinza-200 px-2 text-pequeno font-medium text-cinza-700"
    >
      {itens.length}
    </span>
  );
}

export function MenuLateral() {
  return (
    <nav className="flex h-full w-60 shrink-0 flex-col gap-1 border-r bg-cinza-50 px-3 py-6">
      <div className="mb-6 px-3">
        <Logo altura={26} />
      </div>
      {ITENS.map(({ rota, rotulo, Icone }) => (
        <NavLink
          key={rota}
          to={rota}
          end
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-cinza-700 outline-none hover:bg-cinza-100 hover:text-preto focus-visible:ring-2 focus-visible:ring-ring",
              isActive && "bg-cinza-200 font-medium text-preto hover:bg-cinza-200",
            )
          }
        >
          <Icone aria-hidden className="size-4 shrink-0" />
          {t(rotulo)}
          {rota === "/caixa" && <ContadorCaixa />}
        </NavLink>
      ))}
    </nav>
  );
}
