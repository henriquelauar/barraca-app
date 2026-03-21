import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur md:p-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Barraca Armada
            </span>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
                Gestão da república.
              </h1>

              <p className="max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
                Controle moradores, gastos, eventos, empréstimos e tarefas..
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 px-6 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
              >
                Entrar
              </Link>

              <Link
                href="/home"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 px-6 text-sm font-semibold text-zinc-100 hover:border-zinc-600 hover:bg-zinc-900"
              >
                Acessar home
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
              <p className="text-sm font-medium text-zinc-400">Visual</p>
              <p className="mt-2 text-xl font-semibold text-white">Dark theme completo</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Menos poluição visual, melhor contraste e identidade mais premium.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
              <p className="text-sm font-medium text-zinc-400">Mobile</p>
              <p className="mt-2 text-xl font-semibold text-white">Uso real no celular</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Menu lateral responsivo, cards e leitura confortável em telas pequenas.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
              <p className="text-sm font-medium text-zinc-400">Tarefas</p>
              <p className="mt-2 text-xl font-semibold text-white">Foco na operação diária</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Status mais visíveis, navegação semanal mais clara e separação por contexto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}