"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "Criando conta..." : "Cadastrar"}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signUp, initialState);

  return (
    <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl backdrop-blur sm:p-7">
      <div className="mb-6 space-y-3 sm:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-sm font-semibold text-zinc-300 hover:text-white"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
            B
          </span>
          Barraca Armada
        </Link>
      </div>

      <div className="space-y-2">
        <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
          Novo acesso
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Criar conta
        </h1>
        <p className="text-sm leading-6 text-zinc-400">
          Cadastre seu acesso e configure a base inicial da sua república.
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        {state?.error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
            {state.error}
          </div>
        ) : null}

        <div className="grid gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-200">Nome</label>
            <Input
              name="nome"
              type="text"
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-200">E-mail</label>
            <Input
              name="email"
              type="email"
              placeholder="voce@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-200">Senha</label>
            <Input
              name="password"
              type="password"
              placeholder="Crie uma senha"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-200">
              Nome da república
            </label>
            <Input
              name="nome_republica"
              type="text"
              placeholder="Ex.: Barraca Armada"
            />
            <p className="text-xs leading-5 text-zinc-500">
              Se deixar em branco, o sistema cria um nome padrão automaticamente.
            </p>
          </div>
        </div>

        <SubmitButton />
      </form>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-400">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-amber-300 hover:text-amber-200"
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}