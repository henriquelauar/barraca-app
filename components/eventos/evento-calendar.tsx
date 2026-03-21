"use client";

import { useMemo, useState } from "react";
import {
  getEventoTipoCalendarClass,
  getEventoTipoLabel,
} from "@/lib/utils/eventos";

type EventoCalendarItem = {
  id: string;
  titulo: string;
  tipo: string;
  data_inicio: string;
  local?: string | null;
};

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDayLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  }).format(date);
}

function formatDayNumber(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
  }).format(date);
}

function formatDateTime(dateString: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function startCalendar(date: Date) {
  const first = startOfMonth(date);
  const day = first.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const result = new Date(first);
  result.setDate(first.getDate() + diff);
  return result;
}

function buildCalendarDays(baseDate: Date) {
  const start = startCalendar(baseDate);
  const days: Date[] = [];

  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }

  return days;
}

function sameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMesInicial(eventos: EventoCalendarItem[]) {
  if (eventos.length === 0) {
    return startOfMonth(new Date());
  }

  const hoje = new Date();
  const inicioMesAtual = startOfMonth(hoje);
  const fimMesAtual = endOfMonth(hoje);

  const temEventoNoMesAtual = eventos.some((evento) => {
    const data = new Date(evento.data_inicio);
    return data >= inicioMesAtual && data <= fimMesAtual;
  });

  if (temEventoNoMesAtual) {
    return inicioMesAtual;
  }

  return startOfMonth(new Date(eventos[0].data_inicio));
}

export function EventoCalendar({
  eventos,
}: {
  eventos: EventoCalendarItem[];
}) {
  const [mesAtual, setMesAtual] = useState(() => getMesInicial(eventos));
  const hoje = new Date();

  const calendarDays = useMemo(() => buildCalendarDays(mesAtual), [mesAtual]);

  const eventosNoMes = useMemo(
    () =>
      eventos
        .filter((evento) => {
          const data = new Date(evento.data_inicio);
          return (
            data.getFullYear() === mesAtual.getFullYear() &&
            data.getMonth() === mesAtual.getMonth()
          );
        })
        .sort(
          (a, b) =>
            new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
        ),
    [eventos, mesAtual]
  );

  const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Mes exibido
          </p>
          <h3 className="mt-1 text-lg font-semibold capitalize text-white">
            {getMonthLabel(mesAtual)}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMesAtual((current) => addMonths(current, -1))}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
          >
            Mes anterior
          </button>
          <button
            type="button"
            onClick={() => setMesAtual(startOfMonth(new Date()))}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
          >
            Mes atual
          </button>
          <button
            type="button"
            onClick={() => setMesAtual((current) => addMonths(current, 1))}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
          >
            Proximo mes
          </button>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-400">
            {eventosNoMes.length} item(ns) no mes
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="grid grid-cols-7 overflow-hidden rounded-2xl border border-zinc-800">
          {diasSemana.map((dia) => (
            <div
              key={dia}
              className="border-b border-r border-zinc-800 bg-zinc-900 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400 last:border-r-0"
            >
              {dia}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === mesAtual.getMonth();
            const isToday = sameDate(day, hoje);

            const eventosDia = eventosNoMes.filter((evento) =>
              sameDate(new Date(evento.data_inicio), day)
            );

            return (
              <div
                key={`${day.toISOString()}-${index}`}
                className={`min-h-[150px] border-b border-r border-zinc-800 p-3 align-top last:border-r-0 ${
                  isCurrentMonth ? "bg-zinc-950/50" : "bg-zinc-950/20"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isToday
                        ? "bg-amber-500 text-zinc-950"
                        : isCurrentMonth
                        ? "text-zinc-100"
                        : "text-zinc-600"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <div className="space-y-2">
                  {eventosDia.map((evento) => (
                    <div
                      key={evento.id}
                      className={`rounded-xl border px-2.5 py-2 text-xs ${getEventoTipoCalendarClass(
                        evento.tipo
                      )}`}
                    >
                      <p className="truncate font-semibold">{evento.titulo}</p>
                      <p className="mt-1 opacity-80">
                        {new Intl.DateTimeFormat("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(evento.data_inicio))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        {eventosNoMes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-5 text-sm text-zinc-400">
            Nenhum item neste mes.
          </div>
        ) : (
          eventosNoMes.map((evento) => {
            const data = new Date(evento.data_inicio);

            return (
              <div
                key={evento.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
              >
                <div className="flex gap-4">
                  <div className="flex w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                      {getDayLabel(data)}
                    </span>
                    <span className="mt-1 text-xl font-bold text-white">
                      {formatDayNumber(data)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getEventoTipoCalendarClass(
                          evento.tipo
                        )}`}
                      >
                        {getEventoTipoLabel(evento.tipo)}
                      </span>
                    </div>

                    <h4 className="mt-3 text-sm font-semibold text-white">
                      {evento.titulo}
                    </h4>

                    <p className="mt-1 text-sm text-zinc-400">
                      {formatDateTime(evento.data_inicio)}
                    </p>

                    {evento.local ? (
                      <p className="mt-1 text-sm text-zinc-500">{evento.local}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
