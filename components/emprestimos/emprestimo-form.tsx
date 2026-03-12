"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ActionState, criarEmprestimo } from "@/lib/actions/emprestimos";

const INITIAL_STATE: ActionState = null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Registrar empréstimo"}
    </button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;

  return <p className="mt-1 text-sm text-rose-600">{errors[0]}</p>;
}

export function EmprestimoForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(criarEmprestimo, INITIAL_STATE);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="nome_item"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Nome do item *
          </label>
          <input
            id="nome_item"
            name="nome_item"
            type="text"
            placeholder="Ex.: Furadeira, panela grande, escada"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <FieldError errors={state?.errors?.nome_item} />
        </div>

        <div>
          <label
            htmlFor="tipo"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Tipo *
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue="emprestei"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="emprestei">Emprestei</option>
            <option value="peguei_emprestado">Peguei emprestado</option>
          </select>
          <FieldError errors={state?.errors?.tipo} />
        </div>

        <div>
          <label
            htmlFor="data_emprestimo"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Dia que pegou / emprestou *
          </label>
          <input
            id="data_emprestimo"
            name="data_emprestimo"
            type="date"
            defaultValue={hoje}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <FieldError errors={state?.errors?.data_emprestimo} />
        </div>

        <div>
          <label
            htmlFor="pessoa_nome"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Nome da pessoa *
          </label>
          <input
            id="pessoa_nome"
            name="pessoa_nome"
            type="text"
            placeholder="Ex.: João"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <FieldError errors={state?.errors?.pessoa_nome} />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="pessoa_republica"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            República
          </label>
          <input
            id="pessoa_republica"
            name="pessoa_republica"
            type="text"
            placeholder="Ex.: República do Caos"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="observacao"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Observação
          </label>
          <textarea
            id="observacao"
            name="observacao"
            rows={4}
            placeholder="Ex.: devolver até o fim do mês"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      {state?.message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            state.success
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="flex items-center justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}