"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signUp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Cadastrando..." : "Criar conta"}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signUp, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre um novo morador da Barraca Armada
        </p>
      </div>

      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-medium">
          Nome
        </label>
        <Input id="nome" name="nome" type="text" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Senha
        </label>
        <Input id="password" name="password" type="password" required />
      </div>

      <SubmitButton />

      <p className="text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}