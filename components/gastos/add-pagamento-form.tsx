"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { registrarPagamento } from "@/lib/actions/gastos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Morador = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? "Registrando..." : "Registrar pagamento"}
    </Button>
  );
}

function hoje() {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function AddPagamentoForm({ moradores }: { moradores: Morador[] }) {
  const [state, formAction] = useFormState(registrarPagamento, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {state?.error ? <div className="alert-error">{state.error}</div> : null}
      {state?.success ? (
        <div className="alert-success">{state.success}</div>
      ) : null}

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="de_morador_id" className="form-label">
            Quem pagou
          </label>
          <select
            id="de_morador_id"
            name="de_morador_id"
            required
            defaultValue=""
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="" disabled>
              Selecione
            </option>
            {moradores.map((morador) => (
              <option key={morador.id} value={morador.id}>
                {morador.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="para_morador_id" className="form-label">
            Quem recebeu
          </label>
          <select
            id="para_morador_id"
            name="para_morador_id"
            required
            defaultValue=""
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="" disabled>
              Selecione
            </option>
            {moradores.map((morador) => (
              <option key={morador.id} value={morador.id}>
                {morador.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="valor" className="form-label">
            Valor
          </label>
          <Input
            id="valor"
            name="valor"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="border-slate-300 focus-visible:ring-emerald-500"
          />
        </div>

        <div className="form-field">
          <label htmlFor="data_pagamento" className="form-label">
            Data
          </label>
          <Input
            id="data_pagamento"
            name="data_pagamento"
            type="date"
            defaultValue={hoje()}
            required
            className="border-slate-300 focus-visible:ring-emerald-500"
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="observacao" className="form-label">
          Observação
        </label>
        <Input
          id="observacao"
          name="observacao"
          type="text"
          placeholder="Opcional"
          className="border-slate-300 focus-visible:ring-emerald-500"
        />
      </div>

      <SubmitButton />
    </form>
  );
}