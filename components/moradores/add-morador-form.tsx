"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { adicionarMorador } from "@/lib/actions/moradores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? "Adicionando..." : "Adicionar morador"}
    </Button>
  );
}

export function AddMoradorForm() {
  const [state, formAction] = useFormState(adicionarMorador, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {state?.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium text-slate-700">
            Nome
          </label>
          <Input
            id="nome"
            name="nome"
            type="text"
            required
            placeholder="Ex.: João Bobo"
            className="border-slate-300 focus-visible:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            E-mail
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="nome@exemplo.com"
            className="border-slate-300 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}