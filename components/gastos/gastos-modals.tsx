"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AddGastoForm } from "@/components/gastos/add-gasto-form";
import { AddPagamentoForm } from "@/components/gastos/add-pagamento-form";
import { Button } from "@/components/ui/button";

type Morador = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
};

type ModalShellProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
};

function ModalShell({
  open,
  title,
  description,
  onClose,
  children,
}: ModalShellProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 bottom-0 top-auto max-h-[92vh] overflow-y-auto rounded-t-[28px] border border-zinc-800 bg-zinc-950 p-5 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
            <p className="text-sm leading-6 text-zinc-400">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-lg text-zinc-100 hover:bg-zinc-800"
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export function GastosPageActions({ moradores }: { moradores: Morador[] }) {
  const [gastoModalOpen, setGastoModalOpen] = useState(false);
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);

  return (
    <>
      <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
        <Button onClick={() => setGastoModalOpen(true)} size="lg">
          Novo gasto
        </Button>
        <Button
          onClick={() => setPagamentoModalOpen(true)}
          variant="outline"
          size="lg"
        >
          Novo pagamento
        </Button>
      </div>

      <ModalShell
        open={gastoModalOpen}
        onClose={() => setGastoModalOpen(false)}
        title="Novo gasto"
        description="Cadastre um gasto e distribua para a casa inteira ou para moradores específicos."
      >
        <AddGastoForm moradores={moradores} />
      </ModalShell>

      <ModalShell
        open={pagamentoModalOpen}
        onClose={() => setPagamentoModalOpen(false)}
        title="Novo pagamento"
        description="Registre um pagamento entre moradores para acertar os saldos."
      >
        <AddPagamentoForm moradores={moradores} />
      </ModalShell>
    </>
  );
}