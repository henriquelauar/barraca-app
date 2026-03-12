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
    <div className="flex items-center gap-3">
      <label
        htmlFor="ciclo"
        className="text-sm font-medium text-slate-700"
      >
        Quinzenal
      </label>

      <select
        id="ciclo"
        value={cicloAtual}
        onChange={(e) => handleChange(e.target.value)}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
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