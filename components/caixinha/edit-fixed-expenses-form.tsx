"use client";

import { useActionState } from "react";
import {
  atualizarContasFixasCaixinha,
  ContaFixaCaixinha,
} from "@/lib/actions/caixinha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EditFixedExpensesFormProps = {
  contas: ContaFixaCaixinha[];
  mesReferencia: string;
};

export function EditFixedExpensesForm({
  contas,
  mesReferencia,
}: EditFixedExpensesFormProps) {
  const [state, formAction, pending] = useActionState(
    atualizarContasFixasCaixinha,
    null
  );

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

      <div className="grid gap-3 md:grid-cols-2">
        {contas.map((conta) => (
          <div key={conta.id} className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              {conta.nome}
            </label>
            <Input
              name={`valor_${conta.id}`}
              type="number"
              step="0.01"
              min="0"
              defaultValue={Number(conta.valor)}
              required
              className="h-9"
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Salvar contas fixas"}
      </Button>
    </form>
  );
}