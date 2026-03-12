import { listarTarefasAvulsasPagina } from "@/lib/actions/tarefas-avulsas";
import { TarefaAvulsaFormModal } from "@/components/tarefas-avulsas/tarefa-avulsa-form-modal";
import { TarefasAvulsasTable } from "@/components/tarefas-avulsas/tarefas-avulsas-table";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";

export default async function Page() {
  const data = await listarTarefasAvulsasPagina();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarefas avulsas"
        description="Controle de tarefas pontuais da casa."
        action={<TarefaAvulsaFormModal moradores={data.moradores} />}
      />

      <SectionCard
        title="Tarefas em aberto"
        description="Tarefas pendentes ou em andamento."
      >
        <TarefasAvulsasTable tarefas={data.abertas} variant="abertas" />
      </SectionCard>

      <SectionCard
        title="Histórico de concluídas"
        description="Tarefas finalizadas, preservando o histórico."
      >
        <TarefasAvulsasTable tarefas={data.concluidas} variant="concluidas" />
      </SectionCard>
    </div>
  );
}