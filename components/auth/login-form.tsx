"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/actions/auth";

export function LoginForm({ message }: { message?: string }) {
  const [state, formAction] = useFormState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await signIn(formData);
      return result ?? null;
    },
    null
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Entrar</h1>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {state?.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          autoComplete="email"
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Não tem conta?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
