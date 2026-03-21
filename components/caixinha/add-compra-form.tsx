"use client";

import { useActionState, useState } from "react";
import {
  adicionarCompraCaixinha,
  MoradorCaixinha,
} from "@/lib/actions/caixinha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AddCompraFormProps = {
  moradores: MoradorCaixinha[];
  mesReferencia: string;
};

export function AddCompraForm({ moradores, mesReferencia }: AddCompraFormProps) {
  const [state, formAction, pending] = useActionState(adicionarCompraCaixinha, null);
  const [quemPagouTipo, setQuemPagouTipo] = useState<"morador" | "casa">("morador");
  const [selecionados, setSelecionados] = useState<string[]>([]);

  function toggleMorador(id: string) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="mes_referencia" value={mesReferencia} />

      {state?.error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          {state.success}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-300">
          Nome da compra
        </label>
        <Input
          name="nome_compra"
          placeholder="Ex.: Mercado"
          required
          className="h-9"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Valor</label>
          <Input
            name="valor"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            required
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">
            Quem pagou?
          </label>
          <select
            name="quem_pagou_tipo"
            value={quemPagouTipo}
            onChange={(event) =>
              setQuemPagouTipo(event.target.value as "morador" | "casa")
            }
            className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="morador">Morador</option>
            <option value="casa">Casa</option>
          </select>
        </div>
      </div>

      {quemPagouTipo === "morador" ? (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">
            Qual morador pagou?
          </label>
          <select
            name="quem_pagou_morador_id"
            defaultValue=""
            className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            required
          >
            <option value="" disabled>
              Selecione
            </option>
            {moradores.map((morador) => (
              <option key={morador.id} value={morador.id}>
                {morador.nome}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-zinc-300">Dividir com</p>
          <p className="text-[11px] text-zinc-500">
            Marque os moradores participantes.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {moradores.map((morador) => {
            const checked = selecionados.includes(morador.id);

            return (
              <label
                key={morador.id}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 ${
                  checked
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-zinc-800 bg-zinc-950/70"
                }`}
              >
                <input
                  type="checkbox"
                  name="dividir_com"
                  value={morador.id}
                  checked={checked}
                  onChange={() => toggleMorador(morador.id)}
                />
                <span className="truncate text-xs text-zinc-200">
                  {morador.nome}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Adicionar compra"}
      </Button>
    </form>
  );
}