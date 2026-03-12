"use client";

type EventosErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function EventosError({
  error,
  reset,
}: EventosErrorProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-rose-800">
        Não foi possível carregar os eventos
      </h2>

      <p className="mt-2 text-sm text-rose-700">
        Ocorreu um erro ao montar a página de eventos.
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