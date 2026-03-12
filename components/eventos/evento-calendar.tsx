import { EventoComPresencas } from "@/lib/actions/eventos";
import { StatusBadge } from "@/components/ui/status-badge";

type EventoCalendarProps = {
  eventos: EventoComPresencas[];
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

function formatarHora(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

function getMesAtualBase() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getCalendarDays() {
  const firstDay = getMesAtualBase();
  const year = firstDay.getFullYear();
  const month = firstDay.getMonth();

  const firstWeekday = firstDay.getDay(); // 0 domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const startOffset = firstWeekday;
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }).map((_, index) => {
    const dayNumber = index - startOffset + 1;
    const date = new Date(year, month, dayNumber);

    const isCurrentMonth = date.getMonth() === month;

    return {
      key: `${year}-${month}-${index}`,
      date,
      isCurrentMonth,
    };
  });
}

function isMesmoDia(a: Date, b: string) {
  const db = new Date(b);
  return (
    a.getFullYear() === db.getFullYear() &&
    a.getMonth() === db.getMonth() &&
    a.getDate() === db.getDate()
  );
}

function isHoje(date: Date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function EventoCalendar({ eventos }: EventoCalendarProps) {
  const days = getCalendarDays();
  const monthBase = getMesAtualBase();

  const nomeMes = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(monthBase);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold capitalize text-slate-900">
          {nomeMes}
        </h3>

        <p className="text-sm text-slate-500">
          {eventos.length} evento{eventos.length === 1 ? "" : "s"} no mês
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="rounded-lg px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((item) => {
          const eventosDoDia = eventos.filter((evento) =>
            isMesmoDia(item.date, evento.data_inicio)
          );

          return (
            <div
              key={item.key}
              className={`min-h-[130px] rounded-2xl border p-2.5 ${
                item.isCurrentMonth
                  ? "border-slate-200 bg-white"
                  : "border-slate-100 bg-slate-50 text-slate-300"
              } ${isHoje(item.date) ? "ring-2 ring-slate-200" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                    isHoje(item.date)
                      ? "bg-slate-900 text-white"
                      : item.isCurrentMonth
                      ? "bg-slate-100 text-slate-700"
                      : "bg-transparent text-slate-300"
                  }`}
                >
                  {item.date.getDate()}
                </span>

                {eventosDoDia.length > 0 && item.isCurrentMonth ? (
                  <span className="text-[11px] text-slate-500">
                    {eventosDoDia.length}
                  </span>
                ) : null}
              </div>

              <div className="space-y-2">
                {item.isCurrentMonth &&
                  eventosDoDia.slice(0, 2).map((evento) => (
                    <div
                      key={evento.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-2"
                    >
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {evento.titulo}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {formatarHora(evento.data_inicio)}
                        {evento.local ? ` • ${evento.local}` : ""}
                      </p>

                      <div className="mt-2">
                        <StatusBadge variant={getTipoVariant(evento.tipo)}>
                          {getTipoLabel(evento.tipo)}
                        </StatusBadge>
                      </div>
                    </div>
                  ))}

                {item.isCurrentMonth && eventosDoDia.length > 2 ? (
                  <div className="rounded-xl bg-slate-100 px-2 py-1.5 text-[11px] font-medium text-slate-600">
                    +{eventosDoDia.length - 2} restante(s)
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}