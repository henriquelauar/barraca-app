"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  criarEvento,
  type ActionState,
  type EventoTipo,
} from "@/lib/actions/eventos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = null;

const tipos: Array<{ value: EventoTipo; label: string }> = [
  { value: "social", label: "Social" },
  { value: "formatura", label: "Formatura" },
  { value: "reuniao", label: "Reuniao" },
  { value: "escolha", label: "Escolha" },
  { value: "almoco", label: "Almoco" },
  { value: "aniversario", label: "Aniversario" },
  { value: "hospedagem_republica", label: "Hospedagem na republica" },
  { value: "aluguel_espaco_festa", label: "Aluguel do espaco de festa" },
  { value: "outro_evento", label: "Outro evento" },
  { value: "outro_compromisso", label: "Outro compromisso" },
];

function agoraMaisUmaHora() {
  const agora = new Date();
  agora.setMinutes(0, 0, 0);
  agora.setHours(agora.getHours() + 1);

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  const hora = String(agora.getHours()).padStart(2, "0");
  const minuto = String(agora.getMinutes()).padStart(2, "0");

  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "Criando evento..." : "Criar evento"}
    </Button>
  );
}

export function EventoFormModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(criarEvento, initialState);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        Novo evento
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 top-auto max-h-[92vh] overflow-y-auto rounded-t-[28px] border border-zinc-800 bg-zinc-950 p-5 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Novo evento
                </h2>
                <p className="text-sm leading-6 text-zinc-400">
                  Cadastre um evento ou compromisso mantendo a agenda da casa organizada.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-lg text-zinc-100 hover:bg-zinc-800"
                aria-label="Fechar modal"
              >
                x
              </button>
            </div>

            <form action={formAction} className="space-y-5">
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
                    Titulo
                  </label>
                  <Input name="titulo" placeholder="Ex.: Churrasco da casa" required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-200">
                    Tipo
                  </label>
                  <select
                    name="tipo"
                    defaultValue="social"
                    className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {tipos.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-200">
                    Local
                  </label>
                  <Input name="local" placeholder="Ex.: Barraca Armada" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-200">
                    Inicio
                  </label>
                  <Input
                    name="data_inicio"
                    type="datetime-local"
                    defaultValue={agoraMaisUmaHora()}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-200">
                    Fim
                  </label>
                  <Input name="data_fim" type="datetime-local" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-zinc-200">
                    Descricao
                  </label>
                  <textarea
                    name="descricao"
                    rows={4}
                    placeholder="Detalhes do evento"
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <SubmitButton />
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
