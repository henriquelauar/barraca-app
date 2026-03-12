export default function EventosLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
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
        <div className="mb-6 h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
        <div className="mt-4 h-28 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-4 h-11 w-36 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 h-6 w-44 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[110px] animate-pulse rounded-xl border border-slate-100 bg-slate-50"
            />
          ))}
        </div>
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
        <div className="mb-6 h-6 w-44 animate-pulse rounded bg-slate-200" />
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