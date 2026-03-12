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
    <Button type="submit" size="lg" fullWidth disabled={pending}>
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
  const formRef = useRef<HTMLFormElement | null>(null);
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
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {state.success}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">
            Nome do gasto
          </label>
          <Input name="nome" placeholder="Ex.: Compra do mercado" required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">
            Valor total
          </label>
          <Input
            name="valor_total"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">Data</label>
          <Input name="data_gasto" type="date" defaultValue={hoje()} required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-200">
            Categoria
          </label>
          <Input name="categoria" placeholder="Ex.: Mercado, limpeza, contas..." />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-zinc-200">
            Quem pagou
          </label>
          <select
            name="pagador_morador_id"
            required
            className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            defaultValue=""
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

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-zinc-200">
            Descrição
          </label>
          <textarea
            name="descricao"
            rows={4}
            placeholder="Detalhes adicionais do gasto"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div>
          <p className="text-sm font-semibold text-white">Pra quem pagou</p>
          <p className="mt-1 text-sm text-zinc-400">
            Escolha se o gasto foi para a casa inteira ou para moradores específicos.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <input
              type="radio"
              name="tipo_destino"
              value="casa"
              checked={tipoDestino === "casa"}
              onChange={() => {
                setTipoDestino("casa");
                setSelecionados([]);
              }}
            />
            <div>
              <p className="text-sm font-semibold text-white">Casa inteira</p>
              <p className="text-xs text-zinc-500">Divide para todos</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <input
              type="radio"
              name="tipo_destino"
              value="moradores"
              checked={tipoDestino === "moradores"}
              onChange={() => setTipoDestino("moradores")}
            />
            <div>
              <p className="text-sm font-semibold text-white">Moradores específicos</p>
              <p className="text-xs text-zinc-500">Escolha manualmente</p>
            </div>
          </label>
        </div>

        {tipoDestino === "moradores" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {moradores.map((morador) => {
              const checked = selecionados.includes(morador.id);

              return (
                <label
                  key={morador.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${
                    checked
                      ? "border-amber-500/30 bg-amber-500/10"
                      : "border-zinc-800 bg-zinc-950/70"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="destinatarios"
                    value={morador.id}
                    checked={checked}
                    onChange={() => toggleMorador(morador.id)}
                  />
                  <span className="text-sm font-medium text-zinc-200">
                    {morador.nome}
                  </span>
                </label>
              );
            })}
          </div>
        ) : null}
      </div>

      <SubmitButton />
    </form>
  );
}