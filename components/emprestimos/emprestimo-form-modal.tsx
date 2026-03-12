"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmprestimoForm } from "@/components/emprestimos/emprestimo-form";

export function EmprestimoFormModal() {
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
      <Button type="button" onClick={() => setOpen(true)}>
        Novo empréstimo
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar modal"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          />

          <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Novo empréstimo
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Registre um item que você emprestou ou pegou emprestado.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
              <EmprestimoForm />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}