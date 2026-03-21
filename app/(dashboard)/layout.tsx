"use client";

import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { name: "Home", href: "/home", icon: "▣" },
  { name: "Gastos", href: "/gastos", icon: "◈" },
  { name: "Gerais", href: "/tarefas", icon: "✓" },
  { name: "Tarefas", href: "/tarefas-avulsas", icon: "+" },
  { name: "Empréstimos", href: "/emprestimos", icon: "$" },
  { name: "Caixinha", href: "/caixinha", icon: "$" },
  { name: "Eventos", href: "/eventos", icon: "◌" },
  { name: "Moradores", href: "/moradores", icon: "◎" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const pageTitle = useMemo(() => {
    const item = navItems.find((navItem) =>
      pathname === navItem.href || pathname.startsWith(`${navItem.href}/`)
    );
    return item?.name ?? "Barraca";
  }, [pathname]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
          Barraca
        </p>
        <h1 className="mt-2 text-xl font-bold text-white">Administração da Barraca Armada</h1>
      </div>

      <div className="border-b border-zinc-800 px-5 py-4 lg:hidden">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Página atual</p>
        <p className="mt-1 text-sm font-semibold text-zinc-200">{pageTitle}</p>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/10"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              )}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-current/10 bg-black/10 text-sm">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <form action={signOut}>
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 text-sm font-semibold text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="lg:hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Barraca
            </p>
            <p className="text-sm font-semibold text-white">Painel administrativo</p>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 text-xl text-zinc-100 hover:bg-zinc-800"
            aria-label="Abrir menu"
          >
            ☰
          </button>
        </header>
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-80 border-r border-zinc-800 bg-zinc-900/80 backdrop-blur lg:block">
          <SidebarContent pathname={pathname} />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm border-r border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Menu
                </p>
                <p className="text-sm font-medium text-zinc-300">Navegação principal</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-lg text-zinc-100"
                aria-label="Fechar menu"
              >
                ×
              </button>
            </div>

            <SidebarContent
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}