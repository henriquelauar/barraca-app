"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { marcarTarefaStatus } from "@/lib/actions/tarefas";
import { StatusBadge } from "@/components/ui/status-badge";

type Status = "pendente" | "concluida" | "nao_feita" | null;

function statusLabel(status: Status) {
  if (status === "concluida") return "Concluída";
  if (status === "nao_feita") return "Não feita";
  if (status === "pendente") return "Pendente";
  return "Sem registro";
}

function statusVariant(status: Status) {
  if (status === "concluida") return "success";
  if (status === "nao_feita") return "danger";
  if (status === "pendente") return "warning";
  return "neutral";
}

function MiniButton({
  label,
  value,
}: {
  label: string;
  value: "concluida" | "pendente" | "nao_feita";
}) {
  const { pending } = useFormStatus();

  const classes =
    value === "concluida"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
      : value === "nao_feita"
      ? "border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
      : "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700";

  return (
    <button
      type="submit"
      name="status"
      value={value}
      disabled={pending}
      className={`inline-flex h-8 items-center justify-center rounded-lg border px-2.5 text-[11px] font-semibold ${classes} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {pending ? "..." : label}
    </button>
  );
}

export function TarefaCell({
  atribuicaoId,
  dataReferencia,
  responsavel,
  statusAtual,
  horario,
}: {
  atribuicaoId: string;
  dataReferencia: string;
  responsavel: string;
  statusAtual: Status;
  horario?: string | null;
}) {
  const [, formAction] = useActionState(marcarTarefaStatus, null);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3"
    >
      <input type="hidden" name="atribuicao_id" value={atribuicaoId} />
      <input type="hidden" name="data_referencia" value={dataReferencia} />

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">{responsavel}</p>
          {horario ? (
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
              {horario}
            </p>
          ) : null}
        </div>

        <StatusBadge variant={statusVariant(statusAtual)}>
          {statusLabel(statusAtual)}
        </StatusBadge>

        <div className="grid grid-cols-3 gap-2">
          <MiniButton label="Ok" value="concluida" />
          <MiniButton label="Pendente" value="pendente" />
          <MiniButton label="Não fez" value="nao_feita" />
        </div>
      </div>
    </form>
  );
}