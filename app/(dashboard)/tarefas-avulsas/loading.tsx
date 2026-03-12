export default function TarefasAvulsasLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-80 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 h-6 w-44 animate-pulse rounded bg-slate-200" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 h-6 w-52 animate-pulse rounded bg-slate-200" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}