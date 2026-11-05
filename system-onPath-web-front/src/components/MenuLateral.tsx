import {
  BookOpen,
  CalendarDays,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Repeat,
  Settings,
  SquareKanban,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useMatch } from "react-router";
import { Tooltip } from "radix-ui";

import { useItensNovos, usePendencias } from "@/dados/consultas";
import { textoAtalho } from "@/features/caixa/useAtalhoCaptura";
import { useHoje } from "@/features/hoje/useHoje";
import { t, type ChaveTexto } from "@/i18n";
import { cn } from "@/lib/utils";
import type { Modo } from "@/theme/modo";

import { Logo } from "./Logo";

type Contador = "caixa" | "pendencias";

interface Item {
  rota: string;
  rotulo: ChaveTexto;
  Icone: LucideIcon;
  contador?: Contador;
}

const SECOES: { titulo: ChaveTexto; itens: Item[] }[] = [
  {
    titulo: "menu.secoes.foco",
    itens: [
      { rota: "/", rotulo: "menu.hoje", Icone: Sun, contador: "pendencias" },
      { rota: "/caixa", rotulo: "menu.caixa", Icone: Inbox, contador: "caixa" },
    ],
  },
  {
    titulo: "menu.secoes.trabalho",
    itens: [
      { rota: "/tarefas", rotulo: "menu.tarefas", Icone: ListChecks },
      { rota: "/projetos", rotulo: "menu.projetos", Icone: FolderKanban },
      { rota: "/kanban", rotulo: "menu.kanban", Icone: SquareKanban },
    ],
  },
  {
    titulo: "menu.secoes.planejamento",
    itens: [
      { rota: "/areas", rotulo: "menu.areas", Icone: Target },
      { rota: "/agenda", rotulo: "menu.agenda", Icone: CalendarDays },
      { rota: "/rotinas", rotulo: "menu.rotinas", Icone: Repeat },
      { rota: "/estudos", rotulo: "menu.estudos", Icone: BookOpen },
    ],
  },
];

const CHAVE_RECOLHIDO = "onpath:menu-recolhido";

/** Lembra se o menu está recolhido. Sem acesso ao armazenamento, começa aberto. */
function useRecolhido() {
  const [recolhido, setRecolhido] = useState(() => {
    try {
      return localStorage.getItem(CHAVE_RECOLHIDO) === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_RECOLHIDO, recolhido ? "1" : "0");
    } catch {
      // Sem armazenamento: o estado vale só nesta sessão.
    }
  }, [recolhido]);
  return [recolhido, () => setRecolhido((atual) => !atual)] as const;
}

function useQuantidade(contador: Contador | undefined): number {
  const hoje = useHoje();
  const { data: itens = [] } = useItensNovos();
  const { data: pendencias = [] } = usePendencias(hoje);
  if (contador === "caixa") return itens.length; // FR-008
  if (contador === "pendencias") return pendencias.length; // FR-018 de specs/004-hoje
  return 0;
}

/** Número ao lado do item; com o menu recolhido, vira um ponto roxo sobre o ícone. */
function Contagem({ contador, recolhido, ativo }: { contador: Contador; recolhido: boolean; ativo: boolean }) {
  const quantidade = useQuantidade(contador);
  if (quantidade === 0) return null;
  const rotulo =
    contador === "caixa"
      ? t("menu.itensNovos", { quantidade })
      : t("menu.pendencias", { quantidade });

  if (recolhido) {
    return (
      <span
        aria-label={rotulo}
        className="absolute top-2 right-2 size-2 rounded-full bg-roxo ring-2 ring-branco"
      />
    );
  }
  return (
    <span
      aria-label={rotulo}
      className={cn(
        "ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-pequeno font-medium tabular-nums",
        ativo ? "bg-branco text-preto" : "bg-preto text-branco",
      )}
    >
      {quantidade}
    </span>
  );
}

/** Mostra o nome do item ao passar o mouse, só quando o menu está recolhido. */
function Dica({ texto, ativa, children }: { texto: string; ativa: boolean; children: ReactNode }) {
  if (!ativa) return children;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={12}
          className="z-50 rounded-lg bg-preto px-2.5 py-1.5 text-pequeno font-medium text-branco shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          {texto}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

const classeBase =
  "group relative flex h-10 items-center gap-3 rounded-full text-cinza-600 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring";

function classeItem(ativo: boolean, recolhido: boolean) {
  return cn(
    classeBase,
    recolhido ? "w-10 justify-center self-center" : "px-3.5",
    ativo
      ? "bg-preto font-medium text-branco shadow-md shadow-preto/20"
      : "hover:bg-branco/80 hover:text-preto hover:shadow-sm",
  );
}

function Rotulo({ texto, recolhido }: { texto: string; recolhido: boolean }) {
  return <span className={cn("truncate", recolhido && "sr-only")}>{texto}</span>;
}

function ItemMenu({ item, recolhido }: { item: Item; recolhido: boolean }) {
  const { rota, rotulo, Icone, contador } = item;
  const texto = t(rotulo);
  // O estado ativo é calculado aqui, e o NavLink recebe a classe já em texto: o Tooltip.Trigger
  // (asChild) junta os className como texto e quebraria a forma de função do NavLink, que é o
  // que deixava os itens sem estilo com o menu recolhido.
  const ativo = useMatch({ path: rota, end: rota === "/" }) !== null;
  return (
    <Dica texto={texto} ativa={recolhido}>
      <NavLink to={rota} end={rota === "/"} className={classeItem(ativo, recolhido)}>
        <Icone aria-hidden className="size-4.5 shrink-0" strokeWidth={ativo ? 2.25 : 1.75} />
        <Rotulo texto={texto} recolhido={recolhido} />
        {contador && <Contagem contador={contador} recolhido={recolhido} ativo={ativo} />}
      </NavLink>
    </Dica>
  );
}

const ICONE_MODO: Record<Modo, LucideIcon> = { claro: Sun, escuro: Moon, sistema: Monitor };

interface Props {
  abrirCaptura: () => void;
  modo: Modo;
  alternarModo: () => void;
}

export function MenuLateral({ abrirCaptura, modo, alternarModo }: Props) {
  const IconeModo = ICONE_MODO[modo];
  const textoModo = t("menu.modo", { modo: t(`menu.modos.${modo}`) });
  const [recolhido, alternar] = useRecolhido();
  const IconeAlternar = recolhido ? PanelLeftOpen : PanelLeftClose;
  const textoAlternar = t(recolhido ? "menu.expandir" : "menu.recolher");

  return (
    <Tooltip.Provider delayDuration={150}>
      <nav
        aria-label={t("menu.titulo")}
        data-recolhido={recolhido || undefined}
        className={cn(
          "relative flex h-full shrink-0 flex-col overflow-hidden rounded-3xl border border-branco/70",
          "bg-branco/55 shadow-xl shadow-cinza-400/25 backdrop-blur-2xl backdrop-saturate-150",
          "transition-[width] duration-300 ease-out",
          recolhido ? "w-18" : "w-64",
        )}
      >
        {/* Brilho do vidro na borda de cima. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-branco/80 to-transparent"
        />

        <div
          className={cn(
            "relative flex h-18 shrink-0 items-center border-b border-cinza-200/70",
            recolhido ? "justify-center" : "justify-between pr-3 pl-5",
          )}
        >
          {!recolhido && <Logo altura={24} />}
          <Dica texto={textoAlternar} ativa={recolhido}>
            <button
              type="button"
              onClick={alternar}
              aria-label={textoAlternar}
              aria-expanded={!recolhido}
              className="grid size-9 place-items-center rounded-full text-cinza-500 outline-none transition-colors hover:bg-branco/80 hover:text-preto focus-visible:ring-2 focus-visible:ring-ring"
            >
              {recolhido ? <Logo variante="simbolo" altura={22} /> : <IconeAlternar aria-hidden className="size-4.5" />}
            </button>
          </Dica>
        </div>

        <div className={"relative flex min-h-0 flex-1 flex-col px-3 py-4"}>
          <Dica texto={`${t("menu.anotar")} (${textoAtalho()})`} ativa={recolhido}>
            <button
              type="button"
              onClick={abrirCaptura}
              aria-label={recolhido ? t("menu.anotar") : undefined}
              className={cn(
                "mb-4 flex h-10 items-center gap-3 rounded-full border border-cinza-200 bg-branco/90 text-preto shadow-sm outline-none transition-all hover:border-cinza-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
                recolhido ? "w-10 justify-center self-center" : "px-3.5",
              )}
            >
              <Plus aria-hidden className="size-4.5 shrink-0" />
              {!recolhido && (
                <>
                  <span className="font-medium">{t("menu.anotar")}</span>
                  <kbd className="ml-auto rounded-md border border-cinza-200 bg-cinza-50 px-1.5 font-sans text-pequeno text-cinza-500">
                    {textoAtalho()}
                  </kbd>
                </>
              )}
            </button>
          </Dica>

          <div className="-mx-3 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 [scrollbar-width:none]">
            {SECOES.map(({ titulo, itens }, indice) => (
              <section key={titulo} aria-label={t(titulo)} className="flex flex-col gap-1">
                {recolhido ? (
                  indice > 0 && <hr aria-hidden className="mx-auto mb-1 w-6 border-cinza-300/70" />
                ) : (
                  <h2 className="px-3.5 pb-1 text-pequeno font-medium text-cinza-400">{t(titulo)}</h2>
                )}
                {itens.map((item) => (
                  <ItemMenu key={item.rota} item={item} recolhido={recolhido} />
                ))}
              </section>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-1 border-t border-cinza-200/70 pt-3">
            <ItemMenu item={{ rota: "/ajustes", rotulo: "menu.ajustes", Icone: Settings }} recolhido={recolhido} />
            {import.meta.env.DEV && (
              <ItemMenu item={{ rota: "/painel", rotulo: "menu.painel", Icone: LayoutDashboard }} recolhido={recolhido} />
            )}
            <Dica texto={textoModo} ativa={recolhido}>
              <button type="button" onClick={alternarModo} aria-label={textoModo} className={classeItem(false, recolhido)}>
                <IconeModo aria-hidden className="size-4.5 shrink-0" strokeWidth={1.75} />
                <Rotulo texto={textoModo} recolhido={recolhido} />
              </button>
            </Dica>
            <Dica texto={t("menu.sair")} ativa={recolhido}>
              <Link to="/login" className={classeItem(false, recolhido)}>
                <LogOut aria-hidden className="size-4.5 shrink-0" strokeWidth={1.75} />
                <Rotulo texto={t("menu.sair")} recolhido={recolhido} />
              </Link>
            </Dica>
          </div>
        </div>
      </nav>
    </Tooltip.Provider>
  );
}
