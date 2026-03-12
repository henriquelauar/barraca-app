import {
  EventoComPresencas,
  PresencaStatus,
} from "@/lib/actions/eventos";
import { StatusBadge } from "@/components/ui/status-badge";
import { PresencaToggle } from "@/components/eventos/presenca-toggle";

type EventoPresencasCardProps = {
  evento: EventoComPresencas;
};

function getStatusLabel(status: PresencaStatus) {
  if (status === "vai") return "Vai";
  if (status === "nao_vai") return "Não vai";
  return "Pendente";
}

function getStatusVariant(status: PresencaStatus) {
  if (status === "vai") return "success" as const;
  if (status === "nao_vai") return "danger" as const;
  return "warning" as const;
}

export function EventoPresencasCard({
  evento,
}: EventoPresencasCardProps) {
  const presencas = (evento.presencas ?? []).slice().sort((a, b) => {
    const nomeA = Array.isArray(a.morador) ? a.morador[0]?.nome ?? "" : a.morador?.nome ?? "";
    const nomeB = Array.isArray(b.morador) ? b.morador[0]?.nome ?? "" : b.morador?.nome ?? "";
    return nomeA.localeCompare(nomeB, "pt-BR");
  });

  if (presencas.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Nenhuma presença cadastrada para este evento.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="grid grid-cols-[minmax(0,1fr)_140px_140px] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <div>Morador</div>
        <div>Status</div>
        <div>Responder</div>
      </div>

      <div className="divide-y divide-slate-200">
        {presencas.map((presenca) => {
          const morador = Array.isArray(presenca.morador)
            ? presenca.morador[0] ?? null
            : presenca.morador;

          return (
            <div
              key={presenca.id}
              className="grid grid-cols-[minmax(0,1fr)_140px_140px] items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {morador?.nome ?? "Morador sem nome"}
                </p>

                {presenca.respondido_em ? (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Respondido em{" "}
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(presenca.respondido_em))}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-slate-400">
                    Ainda sem resposta
                  </p>
                )}
              </div>

              <div>
                <StatusBadge variant={getStatusVariant(presenca.status)}>
                  {getStatusLabel(presenca.status)}
                </StatusBadge>
              </div>

              <div>
                <PresencaToggle
                  eventoId={presenca.evento_id}
                  moradorId={presenca.morador_id}
                  statusAtual={presenca.status}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}