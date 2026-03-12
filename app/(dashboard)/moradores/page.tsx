import { AddMoradorForm } from "@/components/moradores/add-morador-form";
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
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Moradores"
        description="Cadastro e visualização dos moradores da casa, incluindo acesso ao sistema e status de atividade."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total"
          value={totalMoradores}
          helper="Moradores cadastrados"
        />
        <StatCard
          title="Ativos"
          value={ativos}
          helper="Moradores em operação"
        />
        <StatCard
          title="Com acesso"
          value={comAcesso}
          helper="Contas vinculadas ao sistema"
        />
        <StatCard
          title="Sem acesso"
          value={semAcesso}
          helper="Ainda sem conta vinculada"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Adicionar morador"
          description="Cadastre um novo morador no sistema."
        >
          <AddMoradorForm />
        </SectionCard>

        <SectionCard
          title="Resumo rápido"
          description="Leitura rápida do estado atual do cadastro."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Cadastros ativos
              </p>
              <p className="mt-2 text-2xl font-bold text-white">{ativos}</p>
              <p className="mt-2 text-sm text-zinc-400">
                Moradores com participação ativa na rotina da casa.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Acesso ao sistema
              </p>
              <p className="mt-2 text-2xl font-bold text-white">{comAcesso}</p>
              <p className="mt-2 text-sm text-zinc-400">
                Quem já consegue usar o painel diretamente.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Lista de moradores"
        description="No desktop a leitura fica em tabela; no celular, em cards."
      >
        {moradores.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
            Nenhum morador cadastrado ainda.
          </div>
        ) : (
          <>
            <div className="hidden xl:block overflow-x-auto">
              <table className="table-dark min-w-[980px]">
                <thead>
                  <tr>
                    <th>Morador</th>
                    <th>E-mail</th>
                    <th>Acesso</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {moradores.map((morador) => {
                    const possuiAcesso = !!morador.user_id;
                    const ativo = morador.ativo !== false;

                    return (
                      <tr key={morador.id}>
                        <td className="min-w-[260px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-bold text-white">
                              {morador.nome?.slice(0, 1).toUpperCase()}
                            </div>

                            <div className="space-y-1">
                              <p className="font-semibold text-white">{morador.nome}</p>
                              <p className="text-xs text-zinc-500">
                                ID: {morador.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>{morador.email}</td>

                        <td>
                          {possuiAcesso ? (
                            <StatusBadge variant="success">Possui acesso</StatusBadge>
                          ) : (
                            <StatusBadge variant="warning">
                              Sem conta vinculada
                            </StatusBadge>
                          )}
                        </td>

                        <td>
                          {ativo ? (
                            <StatusBadge variant="success">Ativo</StatusBadge>
                          ) : (
                            <StatusBadge variant="neutral">Inativo</StatusBadge>
                          )}
                        </td>

                        <td>
                          <form action={removerMoradorAction}>
                            <input type="hidden" name="id" value={morador.id} />
                            <button
                              type="submit"
                              className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
                            >
                              Remover
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 xl:hidden">
              {moradores.map((morador) => {
                const possuiAcesso = !!morador.user_id;
                const ativo = morador.ativo !== false;

                return (
                  <div
                    key={morador.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-bold text-white">
                        {morador.nome?.slice(0, 1).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            {morador.nome}
                          </h3>
                          <p className="mt-1 break-all text-sm text-zinc-400">
                            {morador.email}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            ID: {morador.id.slice(0, 8)}...
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {possuiAcesso ? (
                            <StatusBadge variant="success">Possui acesso</StatusBadge>
                          ) : (
                            <StatusBadge variant="warning">
                              Sem conta vinculada
                            </StatusBadge>
                          )}

                          {ativo ? (
                            <StatusBadge variant="success">Ativo</StatusBadge>
                          ) : (
                            <StatusBadge variant="neutral">Inativo</StatusBadge>
                          )}
                        </div>

                        <form action={removerMoradorAction}>
                          <input type="hidden" name="id" value={morador.id} />
                          <button
                            type="submit"
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
                          >
                            Remover
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}