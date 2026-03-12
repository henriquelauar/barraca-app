"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MoradorResumo } from "@/lib/actions/tarefas-avulsas";
import { TarefaAvulsaForm } from "@/components/tarefas-avulsas/tarefa-avulsa-form";

type TarefaAvulsaFormModalProps = {
  moradores: MoradorResumo[];
};

export function TarefaAvulsaFormModal({
  moradores,
}: TarefaAvulsaFormModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        Nova tarefa
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[60]">
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="absolute inset-x-0 bottom-0 top-auto max-h-[92vh] overflow-y-auto rounded-t-[28px] border border-zinc-800 bg-zinc-950 p-5 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Nova tarefa avulsa
                </h2>
                <p className="text-sm leading-6 text-zinc-400">
                  Registre uma tarefa pontual da casa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-lg text-zinc-100 hover:bg-zinc-800"
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <TarefaAvulsaForm moradores={moradores} />
          </div>
        </div>
      ) : null}
    </>
  );
}