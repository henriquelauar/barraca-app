"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  atualizarPresencaEvento,
  PresencaStatus,
} from "@/lib/actions/eventos";

type PresencaToggleProps = {
  eventoId: string;
  moradorId: string;
  statusAtual: PresencaStatus;
};

export function PresencaToggle({
  eventoId,
  moradorId,
  statusAtual,
}: PresencaToggleProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PresencaStatus>(statusAtual);
  const [feedback, setFeedback] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: PresencaStatus) {
    setStatus(nextStatus);
    setFeedback("");

    const formData = new FormData();
    formData.set("evento_id", eventoId);
    formData.set("morador_id", moradorId);
    formData.set("status", nextStatus);

    startTransition(async () => {
      const result = await atualizarPresencaEvento(formData);

      if (!result?.success) {
        setFeedback(result?.message ?? "Erro ao atualizar presença.");
        setStatus(statusAtual);
        return;
      }

      setFeedback("Presença atualizada.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as PresencaStatus)}
        disabled={isPending}
        className="w-full min-w-[120px] rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="pendente">Pendente</option>
        <option value="vai">Vou</option>
        <option value="nao_vai">Não vou</option>
      </select>

      {feedback ? (
        <p className="text-xs text-slate-500">{feedback}</p>
      ) : null}
    </div>
  );
}