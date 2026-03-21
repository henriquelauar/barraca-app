"use client";

import { useMemo, useState } from "react";
import { EventoCalendar } from "@/components/eventos/evento-calendar";
import { EventosTable } from "@/components/eventos/eventos-table";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import type { EventoComPresencas } from "@/lib/actions/eventos";
import { getEventoCategoria } from "@/lib/utils/eventos";
import { createClient } from "@/lib/supabase/client";

type AbaAgenda = "eventos" | "compromissos";

type EventosPageContentProps = {
  eventos: EventoComPresencas[];
};

const supabase = await createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

const { data: moradorAtual } = await supabase
  .from("moradores")
  .select("id")
  .eq("user_id", user?.id)
  .maybeSingle();

const moradorAtualId = moradorAtual?.id ?? null;

function getInicioHoje() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

function filtrarPorAba(eventos: EventoComPresencas[], aba: AbaAgenda) {
  return eventos.filter((evento) => getEventoCategoria(evento.tipo) === aba);
}

export function EventosPageContent({
  eventos,
}: EventosPageContentProps) {
  const [abaAtiva, setAbaAtiva] = useState<AbaAgenda>("eventos");

  const agendaFiltrada = useMemo(
    () => filtrarPorAba(eventos, abaAtiva),
    [abaAtiva, eventos]
  );

  const inicioHoje = getInicioHoje();

  const proximos = useMemo(
    () =>
      agendaFiltrada.filter(
        (evento) => new Date(evento.data_inicio).getTime() >= inicioHoje.getTime()
      ),
    [agendaFiltrada, inicioHoje]
  );

  const passados = useMemo(
    () =>
      agendaFiltrada
        .filter(
          (evento) =>
            new Date(evento.data_inicio).getTime() < inicioHoje.getTime()
        )
        .sort(
          (a, b) =>
            new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()
        ),
    [agendaFiltrada, inicioHoje]
  );

  const hoje = useMemo(
    () =>
      agendaFiltrada.filter((evento) => {
        const data = new Date(evento.data_inicio);
        const agora = new Date();
        return (
          data.getFullYear() === agora.getFullYear() &&
          data.getMonth() === agora.getMonth() &&
          data.getDate() === agora.getDate()
        );
      }).length,
    [agendaFiltrada]
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-2">
        <div className="grid gap-2 grid-cols-2">
          <button
            type="button"
            onClick={() => setAbaAtiva("eventos")}
            className={`rounded-[20px] px-4 py-4 text-left transition ${
              abaAtiva === "eventos"
                ? "bg-amber-500 text-zinc-950"
                : "bg-transparent text-zinc-300 hover:bg-zinc-900"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Aba 1
            </p>
            <p className="mt-1 text-base font-semibold">Eventos</p>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("compromissos")}
            className={`rounded-[20px] px-4 py-4 text-left transition ${
              abaAtiva === "compromissos"
                ? "bg-amber-500 text-zinc-950"
                : "bg-transparent text-zinc-300 hover:bg-zinc-900"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Aba 2
            </p>
            <p className="mt-1 text-base font-semibold">Compromissos</p>
          </button>
        </div>
      </div>

      <SectionCard
        title="Calendario anual"
        description="Navegue entre os meses para visualizar toda a agenda cadastrada na aba atual."
      >
        <EventoCalendar eventos={agendaFiltrada} />
      </SectionCard>

      <SectionCard
        title={abaAtiva === "eventos" ? "Proximos eventos" : "Proximos compromissos"}
        description={
          abaAtiva === "eventos"
            ? "Eventos futuros com presenca e acoes rapidas."
            : "Reservas e compromissos futuros da casa."
        }
      >
        <EventosTable eventos={proximos} variant="proximos" moradorAtualId={moradorAtualId}/>
      </SectionCard>

      <SectionCard
        title={abaAtiva === "eventos" ? "Eventos passados" : "Compromissos passados"}
        description={
          abaAtiva === "eventos"
            ? "Historico recente dos eventos da casa."
            : "Historico recente dos compromissos cadastrados."
        }
      >
        <EventosTable eventos={passados} variant="passados" moradorAtualId={moradorAtualId} />
      </SectionCard>
    </div>
  );
}
