"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  ActionState,
  criarTarefaAvulsa,
  MoradorResumo,
} from "@/lib/actions/tarefas-avulsas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_STATE: ActionState = null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "Salvando..." : "Criar tarefa"}
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

type TarefaAvulsaFormProps = {
  moradores: MoradorResumo[];
};

export function TarefaAvulsaForm({ moradores }: TarefaAvulsaFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction] = useFormState(criarTarefaAvulsa, INITIAL_STATE);

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
            Nome da tarefa *
          </label>
          <Input
            name="titulo"
            placeholder="Ex.: Comprar lâmpada da cozinha"
            required
          />
          <FieldError errors={state?.errors?.titulo} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">
            Data limite *
          </label>
          <Input
            name="data_limite"
            type="date"
            defaultValue={hoje()}
            required
          />
          <FieldError errors={state?.errors?.data_limite} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">
            Responsável
          </label>
          <select
            name="responsavel_morador_id"
            defaultValue=""
            className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Sem responsável</option>
            {moradores.map((morador) => (
              <option key={morador.id} value={morador.id}>
                {morador.nome}
              </option>
            ))}
          </select>
          <FieldError errors={state?.errors?.responsavel_morador_id} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-zinc-200">
            Descrição
          </label>
          <textarea
            name="descricao"
            rows={4}
            placeholder="Detalhes adicionais da tarefa"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <FieldError errors={state?.errors?.descricao} />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}