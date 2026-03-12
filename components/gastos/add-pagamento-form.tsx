"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { registrarPagamento } from "@/lib/actions/gastos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Morador = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "Registrando..." : "Registrar pagamento"}
    </Button>
  );
}

function hoje() {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function AddPagamentoForm({ moradores }: { moradores: Morador[] }) {
  const [state, formAction] = useFormState(registrarPagamento, null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {state?.error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {state.success}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">
            Quem pagou
          </label>
          <select
            name="pagador_morador_id"
            required
            defaultValue=""
            className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">
            Quem recebeu
          </label>
          <select
            name="recebedor_morador_id"
            required
            defaultValue=""
            className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">Valor</label>
          <Input
            name="valor"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">Data</label>
          <Input
            name="data_pagamento"
            type="date"
            defaultValue={hoje()}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-zinc-200">
            Observação
          </label>
          <textarea
            name="observacao"
            rows={4}
            placeholder="Detalhes adicionais do pagamento"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}