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
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Eventos"
        description="Agenda da Barraca Armada"
        action={<EventoFormModal />}
      />


      <SectionCard
        title="Calendário mensal"
        description="Visual mensal dos eventos cadastrados."
      >
        <EventoCalendar eventos={data.eventosDoMes} />
      </SectionCard>

      <SectionCard
        title="Próximos eventos"
        description="Eventos futuros com presença e ações rápidas."
      >
        <EventosTable eventos={data.proximos} variant="proximos" />
      </SectionCard>

      <SectionCard
        title="Eventos passados"
        description="Histórico recente dos eventos da casa."
      >
        <EventosTable eventos={data.passados} variant="passados" />
      </SectionCard>
    </div>
  );
}