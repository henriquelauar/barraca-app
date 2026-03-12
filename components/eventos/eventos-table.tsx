import { removerEvento, EventoComPresencas } from "@/lib/actions/eventos";
import { StatusBadge } from "@/components/ui/status-badge";
import { EventoPresencasCard } from "@/components/eventos/evento-presencas-card";

type EventosTableProps = {
  eventos: EventoComPresencas[];
  variant: "proximos" | "passados";
};

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

function getTipoVariant(tipo: string) {
  switch (tipo) {
    case "social":
      return "info" as const;
    case "manutencao":
      return "warning" as const;
    case "reuniao":
      return "neutral" as const;
    case "financeiro":
      return "danger" as const;
    case "limpeza":
      return "success" as const;
    case "aniversario":
      return "info" as const;
    default:
      return "neutral" as const;
  }
}

function formatarDataHora(dataInicio: string, dataFim?: string | null) {
  const inicio = new Date(dataInicio);

  const data = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(inicio);

  if (!dataFim) return data;

  const fim = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dataFim));

  return `${data} → ${fim}`;
}

function getResumoPresencas(evento: EventoComPresencas) {
  const resumo = { vai: 0, nao_vai: 0, pendente: 0 };

  for (const item of evento.presencas ?? []) {
    if (item.status === "vai") resumo.vai += 1;
    if (item.status === "nao_vai") resumo.nao_vai += 1;
    if (item.status === "pendente") resumo.pendente += 1;
  }

  return resumo;
}

function EmptyState({ variant }: { variant: "proximos" | "passados" }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="text-sm font-medium text-slate-700">
        {variant === "proximos"
          ? "Nenhum próximo evento cadastrado."
          : "Nenhum evento passado encontrado."}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Os eventos aparecerão aqui conforme forem cadastrados e preservados no histórico.
      </p>
    </div>
  );
}

export function EventosTable({ eventos, variant }: EventosTableProps) {
  if (eventos.length === 0) {
    return <EmptyState variant={variant} />;
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Local</th>
              <th className="px-4 py-3">Presença</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {eventos.map((evento) => {
              const resumo = getResumoPresencas(evento);

              return (
                <tr key={evento.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="max-w-[260px]">
                      <p className="font-medium text-slate-900">{evento.titulo}</p>
                      {evento.descricao ? (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {evento.descricao}
                        </p>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge variant={getTipoVariant(evento.tipo)}>
                      {getTipoLabel(evento.tipo)}
                    </StatusBadge>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    {formatarDataHora(evento.data_inicio, evento.data_fim)}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    {evento.local ?? "—"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    <div className="space-y-1">
                      <p>{resumo.vai} vão</p>
                      <p>{resumo.nao_vai} não vão</p>
                      <p>{resumo.pendente} pendentes</p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-col items-end gap-2">
                      <details className="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50">
                        <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-slate-700">
                          Ver presenças
                        </summary>
                        <div className="border-t border-slate-200 p-3">
                          <EventoPresencasCard evento={evento} />
                        </div>
                      </details>

                      <form action={removerEvento}>
                        <input type="hidden" name="id" value={evento.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                        >
                          Remover
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {eventos.map((evento) => {
          const resumo = getResumoPresencas(evento);

          return (
            <div
              key={evento.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-900">{evento.titulo}</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatarDataHora(evento.data_inicio, evento.data_fim)}
                  </p>
                </div>

                <StatusBadge variant={getTipoVariant(evento.tipo)}>
                  {getTipoLabel(evento.tipo)}
                </StatusBadge>
              </div>

              {evento.local ? (
                <p className="mt-3 text-sm text-slate-600">
                  Local: {evento.local}
                </p>
              ) : null}

              {evento.descricao ? (
                <p className="mt-2 text-sm text-slate-600">{evento.descricao}</p>
              ) : null}

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
                  {resumo.vai} vão
                </div>
                <div className="rounded-xl bg-rose-50 px-3 py-2 text-rose-700">
                  {resumo.nao_vai} não vão
                </div>
                <div className="rounded-xl bg-amber-50 px-3 py-2 text-amber-700">
                  {resumo.pendente} pendentes
                </div>
              </div>

              <div className="mt-4">
                <EventoPresencasCard evento={evento} />
              </div>

              <div className="mt-4 flex justify-end">
                <form action={removerEvento}>
                  <input type="hidden" name="id" value={evento.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                  >
                    Remover
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}