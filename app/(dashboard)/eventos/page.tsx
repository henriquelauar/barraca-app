import { listarEventosPagina } from "@/lib/actions/eventos";
import { EventoFormModal } from "@/components/eventos/evento-form-modal";
import { EventosPageContent } from "@/components/eventos/eventos-page-content";
import { PageHeader } from "@/components/ui/page-header";

export default async function EventosPage() {
  const data = await listarEventosPagina();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Eventos"
        description="Agenda da Barraca Armada"
        action={<EventoFormModal />}
      />

      <EventosPageContent eventos={data.todos} />
    </div>
  );
}
