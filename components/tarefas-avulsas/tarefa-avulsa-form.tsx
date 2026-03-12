"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  ActionState,
  criarTarefaAvulsa,
  MoradorResumo,
} from "@/lib/actions/tarefas-avulsas";

const INITIAL_STATE: ActionState = null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Criar tarefa"}
    </button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return <p className="mt-1 text-sm text-rose-600">{errors[0]}</p>;
}

type TarefaAvulsaFormProps = {
  moradores: MoradorResumo[];
};

export function TarefaAvulsaForm({ moradores }: TarefaAvulsaFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(criarTarefaAvulsa, INITIAL_STATE);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="titulo"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Nome da tarefa *
          </label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            placeholder="Ex.: Consertar chuveiro"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <FieldError errors={state?.errors?.titulo} />
        </div>

        <div>
          <label
            htmlFor="data_limite"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Data limite *
          </label>
          <input
            id="data_limite"
            name="data_limite"
            type="date"
            defaultValue={hoje}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <FieldError errors={state?.errors?.data_limite} />
        </div>

        <div>
          <label
            htmlFor="responsavel_morador_id"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Responsável
          </label>
          <select
            id="responsavel_morador_id"
            name="responsavel_morador_id"
            defaultValue=""
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Sem responsável</option>
            {moradores.map((morador) => (
              <option key={morador.id} value={morador.id}>
                {morador.nome}
              </option>
            ))}
          </select>
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
            placeholder="Detalhes da tarefa"
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