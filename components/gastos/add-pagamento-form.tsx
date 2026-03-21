"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { registrarPagamento } from "@/lib/actions/gastos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Morador = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  user_id?: string | null;
};

function SubmitButton() {
  return (
    <div className="pt-2 sm:pt-3">
      <Button type="submit" size="lg" fullWidth>
        Registrar pagamento
      </Button>
    </div>
  );
}

function hoje() {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

type AddPagamentoFormProps = {
  moradores: Morador[];
  defaultDeMoradorId?: string | null;
  defaultParaMoradorId?: string | null;
  defaultValor?: number | null;
  onSuccess?: () => void;
};

export function AddPagamentoForm({
  moradores,
  defaultDeMoradorId = null,
  defaultParaMoradorId = null,
  defaultValor = null,
  onSuccess,
}: AddPagamentoFormProps) {
  const [state, formAction] = useActionState(registrarPagamento, null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const valorDefault = useMemo(() => {
    if (typeof defaultValor !== "number" || Number.isNaN(defaultValor)) {
      return "";
    }
    return defaultValor.toFixed(2);
  }, [defaultValor]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5 sm:space-y-6">
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

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">
            Quem pagou
          </label>
          <select
            name="de_morador_id"
            required
            defaultValue={defaultDeMoradorId ?? ""}
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
            Para quem
          </label>
          <select
            name="para_morador_id"
            required
            defaultValue={defaultParaMoradorId ?? ""}
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
            defaultValue={valorDefault}
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
          <Input
            name="observacao"
            placeholder="Ex.: acerto do Uber de sábado"
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}