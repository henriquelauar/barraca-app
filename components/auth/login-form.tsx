"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}

export function LoginForm({ message }: { message?: string }) {
  const [state, formAction] = useFormState(signIn, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="text-sm text-muted-foreground">
          Acesse sua conta da Barraca Armada
        </p>
      </div>

      {message && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

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
        Não tem conta?{" "}
        <Link href="/signup" className="underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}