"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  ActionState,
  criarEmprestimo,
} from "@/lib/actions/emprestimos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_STATE: ActionState = null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "Salvando..." : "Registrar empréstimo"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;

  return (
    <p className="text-sm font-medium text-rose-300">
      {errors[0]}
    </p>
  );
}

function hoje() {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function EmprestimoForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction] = useFormState(criarEmprestimo, INITIAL_STATE);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {state?.message ? (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            state.success
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/20 bg-rose-500/10 text-rose-300"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-zinc-200">
            Nome do item *
          </label>
          <Input
            name="nome_item"
            placeholder="Ex.: Furadeira, extensão, escada..."
            required
          />
          <FieldError errors={state?.errors?.nome_item} />
        </div>

        <div className="space-y-3 md:col-span-2">
          <div>
            <label className="text-sm font-semibold text-zinc-200">
              Tipo *
            </label>
            <p className="mt-1 text-sm text-zinc-400">
              Escolha se a casa emprestou o item ou se pegou emprestado.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <input
                type="radio"
                name="tipo"
                value="emprestei"
                defaultChecked
              />
              <div>
                <p className="text-sm font-semibold text-white">Emprestei</p>
                <p className="text-xs text-zinc-500">
                  O item saiu da casa
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <input
                type="radio"
                name="tipo"
                value="peguei_emprestado"
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  Peguei emprestado
                </p>
                <p className="text-xs text-zinc-500">
                  O item veio de fora
                </p>
              </div>
            </label>
          </div>

          <FieldError errors={state?.errors?.tipo} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">
            Dia que pegou / emprestou *
          </label>
          <Input
            name="data_emprestimo"
            type="date"
            defaultValue={hoje()}
            required
          />
          <FieldError errors={state?.errors?.data_emprestimo} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">
            Nome da pessoa *
          </label>
          <Input
            name="pessoa_nome"
            placeholder="Ex.: João, Pedro, Maria..."
            required
          />
          <FieldError errors={state?.errors?.pessoa_nome} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">
            República
          </label>
          <Input
            name="pessoa_republica"
            placeholder="Ex.: República X"
          />
          <FieldError errors={state?.errors?.pessoa_republica} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-zinc-200">
            Observação
          </label>
          <textarea
            name="observacao"
            rows={4}
            placeholder="Detalhes adicionais sobre o empréstimo"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <FieldError errors={state?.errors?.observacao} />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}