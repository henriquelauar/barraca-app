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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function GastosPageActions({ moradores }: { moradores: Morador[] }) {
  const [gastoModalOpen, setGastoModalOpen] = useState(false);
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={() => setGastoModalOpen(true)}>
          Novo gasto
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setPagamentoModalOpen(true)}
        >
          Novo pagamento
        </Button>
      </div>

      <ModalShell
        open={gastoModalOpen}
        onClose={() => setGastoModalOpen(false)}
        title="Novo gasto"
        description="Cadastre um gasto e distribua para a casa inteira ou moradores específicos."
      >
        <AddGastoForm moradores={moradores} />
      </ModalShell>

      <ModalShell
        open={pagamentoModalOpen}
        onClose={() => setPagamentoModalOpen(false)}
        title="Novo pagamento"
        description="Registre um pagamento entre moradores."
      >
        <AddPagamentoForm moradores={moradores} />
      </ModalShell>
    </>
  );
}