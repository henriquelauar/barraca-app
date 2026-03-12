"use client";

import {
  atualizarPresencaEventoSubmit,
  removerEventoSubmit,
} from "@/lib/actions/eventos";
import { StatusBadge } from "@/components/ui/status-badge";

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

function getTipoVariant(tipo: string) {
  switch (tipo) {
    case "social":
      return "info" as const;
    case "manutencao":
      return "warning" as const;
    case "financeiro":
      return "danger" as const;
    case "limpeza":
      return "success" as const;
    default:
      return "neutral" as const;
  }
}

function getTipoLabel(tipo: string) {
  switch (tipo) {
    case "social":
      return "Social";
    case "manutencao":
      return "Manutenção";
    case "reuniao":
      return "Reunião";
    case "financeiro":
      return "Financeiro";
    case "limpeza":
      return "Limpeza";
    case "aniversario":
      return "Aniversário";
    default:
      return "Outro";
  }
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
      return "Não vai";
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
}: {
  eventos: EventoItem[];
  variant: Variant;
}) {
  if (eventos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
        {variant === "proximos"
          ? "Nenhum próximo evento cadastrado."
          : "Nenhum evento passado encontrado."}
      </div>
    );
  }

  return (
    <>
      <div className="hidden xl:block overflow-x-auto">
        <table className="table-dark min-w-[1100px]">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Local</th>
              <th>Presenças</th>
              <th>Ações</th>
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
                    <StatusBadge variant={getTipoVariant(evento.tipo)}>
                      {getTipoLabel(evento.tipo)}
                    </StatusBadge>
                  </td>

                  <td>{formatarDataHora(evento.data_inicio)}</td>

                  <td>{evento.local || "Não informado"}</td>

                  <td>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge variant="success">{resumo.vai} vão</StatusBadge>
                      <StatusBadge variant="danger">
                        {resumo.naoVao} não vão
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

          return (
            <div
              key={evento.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
            >
              <div className="flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge variant={getTipoVariant(evento.tipo)}>
                      {getTipoLabel(evento.tipo)}
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
                        {evento.local || "Não informado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge variant="success">{resumo.vai} vão</StatusBadge>
                    <StatusBadge variant="danger">
                      {resumo.naoVao} não vão
                    </StatusBadge>
                    <StatusBadge variant="warning">
                      {resumo.pendentes} pendentes
                    </StatusBadge>
                  </div>
                </div>

                {variant === "proximos" && presencas.length > 0 ? (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      Presenças
                    </p>

                    <div className="space-y-3">
                      {presencas.map((presenca) => {
                        const morador = extrairMorador(presenca.morador);

                        return (
                          <div
                            key={presenca.id}
                            className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
                          >
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-white">
                                  {morador?.nome || "Morador"}
                                </p>
                                <StatusBadge
                                  variant={getPresencaVariant(presenca.status)}
                                >
                                  {getPresencaLabel(presenca.status)}
                                </StatusBadge>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <PresenceButton
                                  eventoId={evento.id}
                                  moradorId={presenca.morador_id}
                                  status="vai"
                                  label="Vai"
                                />
                                <PresenceButton
                                  eventoId={evento.id}
                                  moradorId={presenca.morador_id}
                                  status="nao_vai"
                                  label="Não vai"
                                />
                                <PresenceButton
                                  eventoId={evento.id}
                                  moradorId={presenca.morador_id}
                                  status="pendente"
                                  label="Pendente"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <form action={removerEventoSubmit}>
                  <input type="hidden" name="id" value={evento.id} />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
                  >
                    Remover evento
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