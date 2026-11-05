import {
  BookOpen,
  CalendarDays,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  Plus,
  ListChecks,
  Repeat,
  Settings,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Link, NavLink } from "react-router";

import { Button } from "@/components/ui/button";
import { useItensNovos, usePendencias } from "@/dados/consultas";
import { useHoje } from "@/features/hoje/useHoje";
import { textoAtalho } from "@/features/caixa/useAtalhoCaptura";
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

interface Props {
  abrirCaptura: () => void;
}

const classeItem = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-cinza-700 outline-none hover:bg-cinza-100 hover:text-preto focus-visible:ring-2 focus-visible:ring-ring",
    isActive && "bg-cinza-200 font-medium text-preto hover:bg-cinza-200",
  );

/** Pendências de dias anteriores sem destino, ao lado de Hoje (FR-018 de specs/004-hoje). */
function ContadorPendencias() {
  const hoje = useHoje();
  const { data: pendencias = [] } = usePendencias(hoje);
  if (pendencias.length === 0) return null;
  return (
    <span
      aria-label={t("menu.pendencias", { quantidade: pendencias.length })}
      className="ml-auto rounded-full bg-preto px-2 text-pequeno font-medium text-branco"
    >
      {pendencias.length}
    </span>
  );
}

export function MenuLateral({ abrirCaptura }: Props) {
  return (
    <nav className="flex h-full w-60 shrink-0 flex-col gap-1 border-r bg-cinza-50 px-3 py-6">
      <div className="mb-6 px-3">
        <Logo altura={26} />
      </div>
      <Button variant="outline" className="mb-4 w-full justify-start" onClick={abrirCaptura}>
        <Plus />
        {t("menu.anotar")}
        <kbd className="ml-auto font-sans text-pequeno text-cinza-500">{textoAtalho()}</kbd>
      </Button>
      {ITENS.map(({ rota, rotulo, Icone }) => (
        <NavLink
          key={rota}
          to={rota}
          end
          className={classeItem}
        >
          <Icone aria-hidden className="size-4 shrink-0" />
          {t(rotulo)}
          {rota === "/caixa" && <ContadorCaixa />}
          {rota === "/" && <ContadorPendencias />}
        </NavLink>
      ))}

      <div className="mt-auto flex flex-col gap-1 border-t pt-3">
        {import.meta.env.DEV && (
          <NavLink to="/painel" className={classeItem}>
            <LayoutDashboard aria-hidden className="size-4 shrink-0" />
            {t("menu.painel")}
          </NavLink>
        )}
        <Link to="/login" className={classeItem({ isActive: false })}>
          <LogOut aria-hidden className="size-4 shrink-0" />
          {t("menu.sair")}
        </Link>
      </div>
    </nav>
  );
}
