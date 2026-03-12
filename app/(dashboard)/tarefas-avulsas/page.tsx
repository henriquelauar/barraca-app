import { listarTarefasAvulsasPagina } from "@/lib/actions/tarefas-avulsas";
import { TarefaAvulsaFormModal } from "@/components/tarefas-avulsas/tarefa-avulsa-form-modal";
import { TarefasAvulsasTable } from "@/components/tarefas-avulsas/tarefas-avulsas-table";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";

export default async function Page() {
  const data = await listarTarefasAvulsasPagina();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Tarefas avulsas"
        description="Tarefas pontuais da casa com controle de prazo, responsável e status."
        action={<TarefaAvulsaFormModal moradores={data.moradores} />}
      />

      <SectionCard
        title="Tarefas em aberto"
        description="Pendências da casa que ainda exigem ação."
      >
        <TarefasAvulsasTable tarefas={data.abertas} variant="abertas" />
      </SectionCard>

      <SectionCard
        title="Tarefas concluídas"
        description="Histórico recente das tarefas já encerradas."
      >
        <TarefasAvulsasTable tarefas={data.concluidas} variant="concluidas" />
      </SectionCard>
    </div>
  );
}