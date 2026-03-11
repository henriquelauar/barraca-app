import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex flex-1 flex-col p-6">
          <Link href="/dashboard">
            <h2 className="text-xl font-bold text-slate-900 hover:text-primary-600 transition-colors">
              Barraca
            </h2>
          </Link>
          <nav className="mt-8 space-y-2">
            <Link
              href="/dashboard"
              className="block rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <Link
              href="/gastos"
              className="block rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Gastos
            </Link>
            <Link
              href="/tarefas"
              className="block rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Tarefas
            </Link>
            <Link
              href="/moradores"
              className="block rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Moradores
            </Link>
          </nav>
          <div className="mt-auto pt-8">
            <form action={signOut}>
              <Button type="submit" variant="ghost" className="w-full justify-start">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-50 p-8">{children}</main>
    </div>
  );
}
