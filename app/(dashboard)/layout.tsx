import Link from "next/link";
import { ReactNode } from "react";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Gastos", href: "/gastos" },
  { name: "Tarefas", href: "/tarefas" },
  { name: "Moradores", href: "/moradores" },
  { name: "Eventos", href: "/eventos" },
  { name: "Empréstimos", href: "/emprestimos" },
  { name: "Tarefas avulsas", href: "/tarefas-avulsas" }
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-100 px-6 py-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Barraca
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Administração da Barraca Armada
              </p>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="border-t border-slate-100 p-4">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="p-6 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}