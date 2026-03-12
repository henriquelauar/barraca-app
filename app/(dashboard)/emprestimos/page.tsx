import { EmprestimoFormModal } from "@/components/emprestimos/emprestimo-form-modal";
import { EmprestimosTable } from "@/components/emprestimos/emprestimos-table";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { listarEmprestimosPagina } from "@/lib/actions/emprestimos";

export default async function EmprestimosPage() {
  const data = await listarEmprestimosPagina();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Empréstimos"
        description="Controle de itens que a casa emprestou ou pegou emprestado."
        action={<EmprestimoFormModal />}
      />

      <SectionCard
        title="Em aberto"
        description="Itens que ainda não foram devolvidos."
      >
        <EmprestimosTable emprestimos={data.emAberto} variant="em_aberto" />
      </SectionCard>

      <SectionCard
        title="Histórico de devolvidos"
        description="Itens já devolvidos, preservando o histórico."
      >
        <EmprestimosTable
          emprestimos={data.devolvidos}
          variant="devolvidos"
        />
      </SectionCard>
    </div>
  );
}