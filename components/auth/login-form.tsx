"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}

export function LoginForm({ message }: { message?: string }) {
  const [state, formAction] = useFormState(signIn, initialState);

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
          Acesso
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white">Entrar</h1>
        <p className="text-sm leading-6 text-zinc-400">
          Use sua conta para acessar o painel da Barraca Armada.
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        {message ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {message}
          </div>
        ) : null}

        {state?.error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
            {state.error}
          </div>
        ) : null}

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
            placeholder="Sua senha"
            required
          />
        </div>

        <SubmitButton />
      </form>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-400">
        Não tem conta?{" "}
        <Link
          href="/signup"
          className="font-semibold text-amber-300 hover:text-amber-200"
        >
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}