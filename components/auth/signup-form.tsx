"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/actions/auth";

export function SignupForm() {
  const [state, formAction] = useFormState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await signUp(formData);
      return result ?? null;
    },
    null
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Criar conta</h1>

      {state?.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          label="Nome"
          name="nome"
          type="text"
          placeholder="Seu nome"
          required
          autoComplete="name"
        />
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
          placeholder="Mínimo 6 caracteres"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <Input
          label="Nome da república (opcional)"
          name="nome_republica"
          type="text"
          placeholder="Ex: República do Futuro"
        />
        <Button type="submit" className="w-full">
          Cadastrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
