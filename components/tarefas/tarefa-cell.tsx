"use client";

import { useFormState, useFormStatus } from "react-dom";
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
      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
      : value === "nao_feita"
      ? "bg-rose-600 hover:bg-rose-700 text-white"
      : "bg-slate-200 hover:bg-slate-300 text-slate-700";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${classes}`}
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
  const [, formAction] = useFormState(marcarTarefaStatus, null);

  return (
    <div className="min-w-[160px] space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{responsavel}</p>
        {horario ? (
          <p className="text-[11px] text-slate-500">{horario}</p>
        ) : null}
        <StatusBadge variant={statusVariant(statusAtual) as any}>
          {statusLabel(statusAtual)}
        </StatusBadge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <form action={formAction}>
          <input type="hidden" name="atribuicao_id" value={atribuicaoId} />
          <input type="hidden" name="data_referencia" value={dataReferencia} />
          <input type="hidden" name="status" value="concluida" />
          <MiniButton label="✔" value="concluida" />
        </form>

        <form action={formAction}>
          <input type="hidden" name="atribuicao_id" value={atribuicaoId} />
          <input type="hidden" name="data_referencia" value={dataReferencia} />
          <input type="hidden" name="status" value="pendente" />
          <MiniButton label="…" value="pendente" />
        </form>

        <form action={formAction}>
          <input type="hidden" name="atribuicao_id" value={atribuicaoId} />
          <input type="hidden" name="data_referencia" value={dataReferencia} />
          <input type="hidden" name="status" value="nao_feita" />
          <MiniButton label="✕" value="nao_feita" />
        </form>
      </div>
    </div>
  );
}