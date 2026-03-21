"use client";

import { ReactNode, useEffect } from "react";

type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function ModalShell({
  open,
  onClose,
  title,
  description,
  children,
}: ModalShellProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="absolute inset-x-0 bottom-0 top-auto max-h-[92vh] overflow-y-auto rounded-t-[28px] border border-zinc-800 bg-zinc-950 p-5 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-3xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {title}
            </h2>
            {description ? (
              <p className="text-sm leading-6 text-zinc-400">{description}</p>
            ) : null}
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