"use client";

import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adicionarMorador } from "@/lib/actions/moradores";

export function AddMoradorForm() {
  const [state, formAction] = useFormState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await adicionarMorador(formData);
      return result ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      {state?.error && (
        <div className="w-full rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-4 sm:flex-row">
        <Input label="Nome" name="nome" placeholder="Nome completo" required />
        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="email@exemplo.com"
          required
        />
      </div>
      <Button type="submit">Adicionar</Button>
    </form>
  );
}
