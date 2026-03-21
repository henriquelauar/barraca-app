"use client";

import { useEffect, useRef, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  adicionarMorador,
  type MoradorFormState,
} from "@/lib/actions/moradores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "Adicionando..." : "Adicionar morador"}
    </Button>
  );
}

const initialState: MoradorFormState = null;

export function AddMoradorForm() {
  const [state, formAction] = useActionState(adicionarMorador, initialState);
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
          <label className="text-sm font-semibold text-zinc-200">Nome</label>
          <Input name="nome" placeholder="Nome do morador" required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">E-mail</label>
          <Input
            name="email"
            type="email"
            placeholder="email@exemplo.com"
            required
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}