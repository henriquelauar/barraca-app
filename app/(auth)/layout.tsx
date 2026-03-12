import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-zinc-800 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_28%)]" />

          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
            <div className="space-y-6">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-sm font-semibold text-zinc-300 hover:text-white"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                  B
                </span>
                Barraca Armada
              </Link>

              <div className="max-w-xl space-y-5">
                <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Gestão da república
                </span>

                <p className="text-base leading-7 text-zinc-400 xl:text-lg">
                  Controle tarefas, gastos, eventos, empréstimos e moradores em uma
                  experiência mais limpa, organizada e confortável no desktop e no
                  celular.
                </p>
              </div>
            </div>

            <div className="grid gap-4">

            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}