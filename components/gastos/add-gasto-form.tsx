"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { adicionarGasto } from "@/lib/actions/gastos";
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
      {pending ? "Adicionando..." : "Adicionar gasto"}
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

export function AddGastoForm({ moradores }: { moradores: Morador[] }) {
  const [state, formAction] = useFormState(adicionarGasto, null);
  const formRef = useRef<HTMLFormElement>(null);

  const [tipoDestino, setTipoDestino] = useState<"casa" | "moradores">("casa");
  const [selecionados, setSelecionados] = useState<string[]>([]);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setTipoDestino("casa");
      setSelecionados([]);
    }
  }, [state]);

  function toggleMorador(id: string) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {state?.error ? (
        <div className="alert-error">{state.error}</div>
      ) : null}

      {state?.success ? (
        <div className="alert-success">{state.success}</div>
      ) : null}

      <input type="hidden" name="tipo_destino" value={tipoDestino} />

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="nome" className="form-label">
            Nome do gasto
          </label>
          <Input
            id="nome"
            name="nome"
            type="text"
            required
            placeholder="Ex.: Mercado da semana"
            className="border-slate-300 focus-visible:ring-emerald-500"
          />
        </div>

        <div className="form-field">
          <label htmlFor="valor_total" className="form-label">
            Valor total
          </label>
          <Input
            id="valor_total"
            name="valor_total"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="border-slate-300 focus-visible:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="form-field">
          <label htmlFor="data_gasto" className="form-label">
            Data
          </label>
          <Input
            id="data_gasto"
            name="data_gasto"
            type="date"
            defaultValue={hoje()}
            required
            className="border-slate-300 focus-visible:ring-emerald-500"
          />
        </div>

        <div className="form-field">
          <label htmlFor="categoria" className="form-label">
            Categoria
          </label>
          <Input
            id="categoria"
            name="categoria"
            type="text"
            placeholder="Ex.: mercado"
            className="border-slate-300 focus-visible:ring-emerald-500"
          />
        </div>

        <div className="form-field">
          <label htmlFor="pagador_morador_id" className="form-label">
            Quem pagou
          </label>
          <select
            id="pagador_morador_id"
            name="pagador_morador_id"
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

      <div className="form-field">
        <label htmlFor="descricao" className="form-label">
          Descrição
        </label>
        <Input
          id="descricao"
          name="descricao"
          type="text"
          placeholder="Opcional"
          className="border-slate-300 focus-visible:ring-emerald-500"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">
          Pra quem pagou
        </p>

        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="radio"
              name="destino_radio"
              checked={tipoDestino === "casa"}
              onChange={() => {
                setTipoDestino("casa");
                setSelecionados([]);
              }}
            />
            <span>Casa inteira</span>
          </label>

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="radio"
              name="destino_radio"
              checked={tipoDestino === "moradores"}
              onChange={() => setTipoDestino("moradores")}
            />
            <span>Moradores específicos</span>
          </label>
        </div>

        {tipoDestino === "moradores" ? (
          <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
            {moradores.map((morador) => (
              <label
                key={morador.id}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  name="destino_moradores"
                  value={morador.id}
                  checked={selecionados.includes(morador.id)}
                  onChange={() => toggleMorador(morador.id)}
                />
                {morador.nome}
              </label>
            ))}
          </div>
        ) : null}
      </div>

      <SubmitButton />
    </form>
  );
}