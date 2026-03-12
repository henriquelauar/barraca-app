import { EmprestimoFormModal } from "@/components/emprestimos/emprestimo-form-modal";
import { EmprestimosTable } from "@/components/emprestimos/emprestimos-table";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { listarEmprestimosPagina } from "@/lib/actions/emprestimos";

export default async function EmprestimosPage() {
  const data = await listarEmprestimosPagina();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Empréstimos"
        description="Controle de itens emprestados e pegos emprestados pela casa."
        action={<EmprestimoFormModal />}
      />

      <SectionCard
        title="Empréstimos em aberto"
        description="Itens que ainda precisam ser devolvidos ou recebidos de volta."
      >
        <EmprestimosTable emprestimos={data.emAberto} variant="em_aberto" />
      </SectionCard>

      <SectionCard
        title="Empréstimos devolvidos"
        description="Histórico de empréstimos já encerrados."
      >
        <EmprestimosTable emprestimos={data.devolvidos} variant="devolvidos" />
      </SectionCard>
    </div>
  );
}