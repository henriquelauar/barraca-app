"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AddGastoForm } from "@/components/gastos/add-gasto-form";
import { AddPagamentoForm } from "@/components/gastos/add-pagamento-form";
import { Button } from "@/components/ui/button";

type Morador = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  user_id?: string | null;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999]">
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="absolute inset-x-3 bottom-0 top-5 max-h-[92vh] overflow-y-auto rounded-t-[28px] border border-zinc-800 bg-zinc-950 p-5 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-3xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:p-6">
        <div className=""
          onClick={(e) => e.stopPropagation()}
        >
          <div className="top-0 z-10 border-b border-zinc-800 bg-zinc-950 px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {title}
                </h2>
                <p className="text-sm leading-6 text-zinc-400">
                  {description}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-lg text-zinc-100 hover:bg-zinc-800"
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

type GastosPageActionsProps = {
  moradores: Morador[];
  currentMoradorId: string | null;
  currentMoradorNome: string | null;
};

export function GastosPageActions({
  moradores,
  currentMoradorId,
  currentMoradorNome,
}: GastosPageActionsProps) {
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
        description="Informe o nome, o valor e com quem o gasto foi dividido."
      >
        <AddGastoForm
          moradores={moradores}
          currentMoradorId={currentMoradorId}
          currentMoradorNome={currentMoradorNome}
          onSuccess={() => setGastoModalOpen(false)}
        />
      </ModalShell>

      <ModalShell
        open={pagamentoModalOpen}
        onClose={() => setPagamentoModalOpen(false)}
        title="Novo pagamento"
        description="Registre um pagamento entre moradores para acertar os saldos."
      >
        <AddPagamentoForm moradores={moradores} onSuccess={() => setGastoModalOpen(false)} />
      </ModalShell>
    </>
  );
}