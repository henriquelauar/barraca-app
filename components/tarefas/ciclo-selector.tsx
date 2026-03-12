"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function CicloSelector({
  ciclos,
  cicloAtual,
}: {
  ciclos: string[];
  cicloAtual: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("ciclo", value);
    } else {
      params.delete("ciclo");
    }

    router.push(`/tarefas?${params.toString()}`);
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto">
      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        Ciclo rotativo
      </label>

      <select
        value={cicloAtual}
        onChange={(e) => handleChange(e.target.value)}
        className="h-11 min-w-[180px] rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
      >
        {ciclos.map((ciclo) => (
          <option key={ciclo} value={ciclo}>
            {ciclo}
          </option>
        ))}
      </select>
    </div>
  );
}