import { listarEventosPagina } from "@/lib/actions/eventos";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { EventoCalendar } from "@/components/eventos/evento-calendar";
import { EventosTable } from "@/components/eventos/eventos-table";
import { EventoFormModal } from "@/components/eventos/evento-form-modal";

export default async function EventosPage() {
  const data = await listarEventosPagina();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eventos"
        description="Agenda da Barraca Armada"
        action={<EventoFormModal />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="No mês" value={data.stats.noMes} />
        <StatCard title="Próximos" value={data.stats.proximos} />
        <StatCard title="Hoje" value={data.stats.hoje} />
        <StatCard title="Passados" value={data.stats.passados} />
        <StatCard title="Pendentes" value={data.stats.pendentesResposta} />
      </div>

      <SectionCard title="Calendário mensal">
        <EventoCalendar eventos={data.eventosDoMes} />
      </SectionCard>

      <SectionCard title="Próximos eventos">
        <EventosTable eventos={data.proximos} variant="proximos" />
      </SectionCard>

      <SectionCard title="Eventos passados">
        <EventosTable eventos={data.passados} variant="passados" />
      </SectionCard>
    </div>
  );
}