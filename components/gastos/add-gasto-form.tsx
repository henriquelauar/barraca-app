"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { adicionarGasto } from "@/lib/actions/gastos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Morador = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  user_id?: string | null;
};

function SubmitButton() {
  return (
    <Button type="submit" size="lg" fullWidth>
      Salvar gasto
    </Button>
  );
}

type AddGastoFormProps = {
  moradores: Morador[];
  currentMoradorId: string | null;
  currentMoradorNome: string | null;
  onSuccess?: () => void;
};

export function AddGastoForm({
  moradores,
  currentMoradorId,
  currentMoradorNome,
  onSuccess,
}: AddGastoFormProps) {
  const [state, formAction] = useActionState(adicionarGasto, null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [participou, setParticipou] = useState(true);
  const [selecionados, setSelecionados] = useState<string[]>([]);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const moradoresDivisao = useMemo(
    () => moradores.filter((morador) => morador.id !== currentMoradorId),
    [moradores, currentMoradorId]
  );

  function toggleMorador(id: string) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setParticipou(true);
      setSelecionados([]);
    }
  }, [state]);

  const totalParticipantes = selecionados.length + (participou ? 1 : 0);

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

      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-200">
          Nome do gasto
        </label>
        <Input
          name="nome"
          placeholder="Ex.: Uber, mercado, pizza..."
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-200">Valor</label>
        <Input
          name="valor_total"
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
          required
        />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">Sua participação</p>
          <p className="text-xs text-zinc-500">
            Marque se você também participou desse gasto.
          </p>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <input
            type="checkbox"
            checked={participou}
            onChange={(event) => setParticipou(event.target.checked)}
          />
          <span className="text-sm font-medium text-zinc-200">
            {currentMoradorNome
              ? `${currentMoradorNome} participou`
              : "Eu participei"}
          </span>
        </label>

        <input
          type="hidden"
          name="participou"
          value={participou ? "true" : "false"}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">Dividir com</p>
          <p className="text-xs text-zinc-500">
            Selecione as outras pessoas que participaram do gasto.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {moradoresDivisao.map((morador) => {
            const checked = selecionados.includes(morador.id);

            return (
              <label
                key={morador.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                  checked
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-zinc-800 bg-zinc-950/70 hover:bg-zinc-900/80"
                }`}
              >
                <input
                  type="checkbox"
                  name="destino_moradores"
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
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
          Resumo da divisão
        </p>
        <p className="mt-2 text-sm text-zinc-300">
          {totalParticipantes > 0
            ? `Este gasto será dividido entre ${totalParticipantes} ${
                totalParticipantes === 1 ? "pessoa" : "pessoas"
              }.`
            : "Selecione pelo menos uma pessoa para dividir o gasto."}
        </p>
      </div>

      <SubmitButton />
    </form>
  );
}