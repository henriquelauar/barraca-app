import { AddMoradorForm } from "@/components/moradores/add-morador-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { listarMoradores, removerMorador } from "@/lib/actions/moradores";

async function removerMoradorAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await removerMorador(id);
}

export default async function MoradoresPage() {
  const moradores = await listarMoradores();

  const totalMoradores = moradores.length;
  const comAcesso = moradores.filter((morador) => !!morador.user_id).length;
  const semAcesso = moradores.filter((morador) => !morador.user_id).length;
  const ativos = moradores.filter((morador) => morador.ativo !== false).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moradores"
        description="Gerencie os moradores da Barraca Armada, acompanhe quem possui acesso ao sistema e mantenha o cadastro da casa organizado."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de moradores"
          value={totalMoradores}
          helper="Cadastros registrados"
        />
        <StatCard
          title="Com acesso"
          value={comAcesso}
          helper="Moradores com conta vinculada"
        />
        <StatCard
          title="Sem acesso"
          value={semAcesso}
          helper="Moradores sem login no sistema"
        />
        <StatCard
          title="Ativos"
          value={ativos}
          helper="Moradores atualmente ativos"
        />
      </div>

      <SectionCard
        title="Adicionar morador"
        description="Cadastre um novo morador da casa. Isso não cria login automaticamente."
      >
        <AddMoradorForm />
      </SectionCard>

      <SectionCard
        title={`Lista de moradores (${moradores.length})`}
        description="Visualize os dados dos moradores e remova registros quando necessário."
      >
        {moradores.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm text-slate-500">
              Nenhum morador cadastrado ainda.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Morador
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      E-mail
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Acesso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {moradores.map((morador) => {
                    const possuiAcesso = !!morador.user_id;
                    const ativo = morador.ativo !== false;

                    return (
                      <tr
                        key={morador.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                              {morador.nome?.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {morador.nome}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {morador.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {morador.email}
                        </td>

                        <td className="px-4 py-4">
                          {possuiAcesso ? (
                            <StatusBadge variant="success">
                              Possui acesso
                            </StatusBadge>
                          ) : (
                            <StatusBadge variant="neutral">
                              Sem conta vinculada
                            </StatusBadge>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {ativo ? (
                            <StatusBadge variant="info">Ativo</StatusBadge>
                          ) : (
                            <StatusBadge variant="warning">Inativo</StatusBadge>
                          )}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <form action={removerMoradorAction}>
                            <input type="hidden" name="id" value={morador.id} />
                            <Button type="submit" variant="destructive" size="sm">
                              Remover
                            </Button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}