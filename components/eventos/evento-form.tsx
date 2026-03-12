"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ActionState, criarEvento } from "@/lib/actions/eventos";

const INITIAL_STATE: ActionState = null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Criando..." : "Criar evento"}
    </button>
  );
}

type FieldErrorProps = {
  errors?: string[];
};

function FieldError({ errors }: FieldErrorProps) {
  if (!errors || errors.length === 0) return null;

  return <p className="mt-1 text-sm text-rose-600">{errors[0]}</p>;
}

export function EventoForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(criarEvento, INITIAL_STATE);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const agora = new Date();
  const sugestaoInicio = new Date(agora.getTime() + 60 * 60 * 1000);
  const defaultInicio = sugestaoInicio.toISOString().slice(0, 16);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="titulo"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Título *
          </label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            placeholder="Ex.: Formatura Barraca Armada"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <FieldError errors={state?.errors?.titulo} />
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
            defaultValue="social"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="social">Social</option>
            <option value="manutencao">Formatura</option>
            <option value="reuniao">Reunião</option>
            <option value="financeiro">Aniversário</option>
            <option value="limpeza">Escolha</option>
            <option value="aniversario">Aniversário</option>
            <option value="outro">Outro</option>
          </select>
          <FieldError errors={state?.errors?.tipo} />
        </div>

        <div>
          <label
            htmlFor="data_inicio"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Início *
          </label>
          <input
            id="data_inicio"
            name="data_inicio"
            type="datetime-local"
            defaultValue={defaultInicio}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <FieldError errors={state?.errors?.data_inicio} />
        </div>

        <div>
          <label
            htmlFor="data_fim"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Fim
          </label>
          <input
            id="data_fim"
            name="data_fim"
            type="datetime-local"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <FieldError errors={state?.errors?.data_fim} />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="local"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Local
          </label>
          <input
            id="local"
            name="local"
            type="text"
            placeholder="Ex.: Barraca Armada / Área gourmet / Online"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="descricao"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Descrição
          </label>
          <textarea
            id="descricao"
            name="descricao"
            rows={4}
            placeholder="Detalhes importantes do evento"
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