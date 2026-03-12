"use client";

type EmprestimosErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function EmprestimosError({
  error,
  reset,
}: EmprestimosErrorProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-rose-800">
        Não foi possível carregar os empréstimos
      </h2>

      <p className="mt-2 text-sm text-rose-700">
        Ocorreu um erro ao montar a página de empréstimos.
      </p>

      {error?.message ? (
        <p className="mt-3 rounded-xl bg-white/70 p-3 text-sm text-rose-700">
          {error.message}
        </p>
      ) : null}

      <div className="mt-4">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}