import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">Barraca</h1>
        <p className="mb-8 text-lg text-slate-600">
          Administração da República
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Acessar
          </Link>
        </div>
      </div>
    </main>
  );
}
