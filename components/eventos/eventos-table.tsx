"use client";

import {
  atualizarPresencaEventoSubmit,
  removerEventoSubmit,
} from "@/lib/actions/eventos";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getEventoTipoBadgeVariant,
  getEventoTipoLabel,
} from "@/lib/utils/eventos";

type Morador =
  | {
      id: string;
      nome: string;
    }
  | {
      id: string;
      nome: string;
    }[]
  | null
  | undefined;

type Presenca = {
  id: string;
  morador_id: string;
  status: "pendente" | "vai" | "nao_vai";
  respondido_em?: string | null;
  observacao?: string | null;
  morador?: Morador;
};

type EventoItem = {
  id: string;
  titulo: string;
  descricao?: string | null;
  tipo: string;
  local?: string | null;
  data_inicio: string;
  data_fim?: string | null;
  presencas?: Presenca[] | null;
};

type Variant = "proximos" | "passados";

function formatarDataHora(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

function getPresencaVariant(status: Presenca["status"]) {
  switch (status) {
    case "vai":
      return "success" as const;
    case "nao_vai":
      return "danger" as const;
    case "pendente":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

function getPresencaLabel(status: Presenca["status"]) {
  switch (status) {
    case "vai":
      return "Vai";
    case "nao_vai":
      return "Nao vai";
    case "pendente":
      return "Pendente";
    default:
      return status;
  }
}

function extrairMorador(morador?: Morador) {
  if (!morador) return null;
  return Array.isArray(morador) ? morador[0] ?? null : morador;
}

function resumirPresencas(presencas?: Presenca[] | null) {
  const lista = presencas ?? [];

  return lista.reduce(
    (acc, item) => {
      if (item.status === "vai") acc.vai += 1;
      if (item.status === "nao_vai") acc.naoVao += 1;
      if (item.status === "pendente") acc.pendentes += 1;
      return acc;
    },
    {
      vai: 0,
      naoVao: 0,
      pendentes: 0,
    }
  );
}

function PresenceButton({
  eventoId,
  moradorId,
  status,
  label,
}: {
  eventoId: string;
  moradorId: string;
  status: "pendente" | "vai" | "nao_vai";
  label: string;
}) {
  return (
    <form action={atualizarPresencaEventoSubmit}>
      <input type="hidden" name="evento_id" value={eventoId} />
      <input type="hidden" name="morador_id" value={moradorId} />
      <button
        type="submit"
        name="status"
        value={status}
        className={
          status === "vai"
            ? "inline-flex h-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20"
            : status === "nao_vai"
            ? "inline-flex h-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20"
            : "inline-flex h-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 text-[11px] font-semibold text-zinc-200 hover:bg-zinc-700"
        }
      >
        {label}
      </button>
    </form>
  );
}

export function EventosTable({
  eventos,
  variant,
  moradorAtualId,
}: {
  eventos: EventoItem[];
  variant: Variant;
  moradorAtualId: string | null;
}) {
  if (eventos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
        {variant === "proximos"
          ? "Nenhum item futuro cadastrado."
          : "Nenhum item passado encontrado."}
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto xl:block">
        <table className="table-dark min-w-[1100px]">
          <thead>
            <tr>
              <th>Item</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Local</th>
              <th>Presencas</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((evento) => {
              const resumo = resumirPresencas(evento.presencas);

              return (
                <tr key={evento.id}>
                  <td className="min-w-[280px]">
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{evento.titulo}</p>
                      {evento.descricao ? (
                        <p className="text-sm text-zinc-500">{evento.descricao}</p>
                      ) : null}
                    </div>
                  </td>

                  <td>
                    <StatusBadge variant={getEventoTipoBadgeVariant(evento.tipo)}>
                      {getEventoTipoLabel(evento.tipo)}
                    </StatusBadge>
                  </td>

                  <td>{formatarDataHora(evento.data_inicio)}</td>

                  <td>{evento.local || "Nao informado"}</td>

                  <td>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge variant="success">{resumo.vai} vao</StatusBadge>
                      <StatusBadge variant="danger">
                        {resumo.naoVao} nao vao
                      </StatusBadge>
                      <StatusBadge variant="warning">
                        {resumo.pendentes} pendentes
                      </StatusBadge>
                    </div>
                  </td>

                  <td>
                    <form action={removerEventoSubmit}>
                      <input type="hidden" name="id" value={evento.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
                      >
                        Remover
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 xl:hidden">
        {eventos.map((evento) => {
          const resumo = resumirPresencas(evento.presencas);
          const presencas = evento.presencas ?? [];
          const minhaPresenca = presencas.find((presenca) => presenca.morador_id === moradorAtualId) ?? null;

          return (
            <div
              key={evento.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
            >
              <div className="flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge variant={getEventoTipoBadgeVariant(evento.tipo)}>
                      {getEventoTipoLabel(evento.tipo)}
                    </StatusBadge>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {evento.titulo}
                    </h3>
                    {evento.descricao ? (
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {evento.descricao}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                        Data
                      </p>
                      <p className="mt-1 text-sm text-zinc-200">
                        {formatarDataHora(evento.data_inicio)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                        Local
                      </p>
                      <p className="mt-1 text-sm text-zinc-200">
                        {evento.local || "Nao informado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge variant="success">{resumo.vai} vao</StatusBadge>
                    <StatusBadge variant="danger">
                      {resumo.naoVao} nao vao
                    </StatusBadge>
                    <StatusBadge variant="warning">
                      {resumo.pendentes} pendentes
                    </StatusBadge>
                  </div>
                </div>

                {variant === "proximos" && minhaPresenca ? (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      Sua presença
                    </p>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">Você</p>
                          <StatusBadge variant={getPresencaVariant(minhaPresenca.status)}>
                            {getPresencaLabel(minhaPresenca.status)}
                          </StatusBadge>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <PresenceButton
                            eventoId={evento.id}
                            moradorId={minhaPresenca.morador_id}
                            status="vai"
                            label="Vai"
                          />
                          <PresenceButton
                            eventoId={evento.id}
                            moradorId={minhaPresenca.morador_id}
                            status="nao_vai"
                            label="Nao vai"
                          />
                          <PresenceButton
                            eventoId={evento.id}
                            moradorId={minhaPresenca.morador_id}
                            status="pendente"
                            label="Pendente"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <form action={removerEventoSubmit}>
                  <input type="hidden" name="id" value={evento.id} />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
                  >
                    Remover item
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
