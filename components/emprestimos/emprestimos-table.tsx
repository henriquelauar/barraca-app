import {
  Emprestimo,
  marcarEmprestimoComoDevolvido,
  reabrirEmprestimo,
  removerEmprestimo,
} from "@/lib/actions/emprestimos";
import { StatusBadge } from "@/components/ui/status-badge";

type EmprestimosTableProps = {
  emprestimos: Emprestimo[];
  variant: "em_aberto" | "devolvidos";
};

function getTipoLabel(tipo: Emprestimo["tipo"]) {
  return tipo === "emprestei" ? "Emprestei" : "Peguei emprestado";
}

function getTipoVariant(tipo: Emprestimo["tipo"]) {
  return tipo === "emprestei" ? ("info" as const) : ("warning" as const);
}

function getStatusLabel(status: Emprestimo["status"]) {
  return status === "devolvido" ? "Devolvido" : "Em aberto";
}

function getStatusVariant(status: Emprestimo["status"]) {
  return status === "devolvido" ? ("success" as const) : ("neutral" as const);
}

function formatarData(data: string | null) {
  if (!data) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(`${data}T00:00:00`));
}

function EmptyState({ variant }: { variant: "em_aberto" | "devolvidos" }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
      <p className="font-medium text-zinc-300">
        {variant === "em_aberto"
          ? "Nenhum empréstimo em aberto."
          : "Nenhum empréstimo devolvido ainda."}
      </p>
      <p className="mt-2">Os registros aparecerão aqui conforme forem cadastrados.</p>
    </div>
  );
}

function ActionButtons({ item }: { item: Emprestimo }) {
  return (
    <div className="flex flex-wrap gap-2">
      {item.status === "em_aberto" ? (
        <form action={marcarEmprestimoComoDevolvido}>
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20"
          >
            Marcar devolvido
          </button>
        </form>
      ) : (
        <form action={reabrirEmprestimo}>
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 text-sm font-semibold text-amber-300 hover:bg-amber-500/20"
          >
            Reabrir
          </button>
        </form>
      )}

      <form action={removerEmprestimo}>
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
        >
          Remover
        </button>
      </form>
    </div>
  );
}

export function EmprestimosTable({
  emprestimos,
  variant,
}: EmprestimosTableProps) {
  if (emprestimos.length === 0) {
    return <EmptyState variant={variant} />;
  }

  return (
    <>
      <div className="hidden xl:block overflow-x-auto">
        <table className="table-dark min-w-[1100px]">
          <thead>
            <tr>
              <th>Item</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Pessoa</th>
              <th>República</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {emprestimos.map((item) => (
              <tr key={item.id}>
                <td className="min-w-[280px]">
                  <div className="space-y-1">
                    <p className="font-semibold text-white">{item.nome_item}</p>

                    {item.observacao ? (
                      <p className="text-sm text-zinc-500">{item.observacao}</p>
                    ) : null}

                    {item.data_devolucao ? (
                      <p className="text-xs text-zinc-500">
                        Devolvido em {formatarData(item.data_devolucao)}
                      </p>
                    ) : null}
                  </div>
                </td>

                <td>
                  <StatusBadge variant={getTipoVariant(item.tipo)}>
                    {getTipoLabel(item.tipo)}
                  </StatusBadge>
                </td>

                <td>{formatarData(item.data_emprestimo)}</td>
                <td>{item.pessoa_nome}</td>
                <td>{item.pessoa_republica || "—"}</td>

                <td>
                  <StatusBadge variant={getStatusVariant(item.status)}>
                    {getStatusLabel(item.status)}
                  </StatusBadge>
                </td>

                <td>
                  <ActionButtons item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 xl:hidden">
        {emprestimos.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
          >
            <div className="flex flex-col gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge variant={getTipoVariant(item.tipo)}>
                    {getTipoLabel(item.tipo)}
                  </StatusBadge>
                  <StatusBadge variant={getStatusVariant(item.status)}>
                    {getStatusLabel(item.status)}
                  </StatusBadge>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">
                    {item.nome_item}
                  </h3>

                  {item.observacao ? (
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {item.observacao}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      Data
                    </p>
                    <p className="mt-1 text-sm text-zinc-200">
                      {formatarData(item.data_emprestimo)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      Pessoa
                    </p>
                    <p className="mt-1 text-sm text-zinc-200">{item.pessoa_nome}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      República
                    </p>
                    <p className="mt-1 text-sm text-zinc-200">
                      {item.pessoa_republica || "—"}
                    </p>
                  </div>

                  {item.data_devolucao ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                        Devolução
                      </p>
                      <p className="mt-1 text-sm text-zinc-200">
                        {formatarData(item.data_devolucao)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <ActionButtons item={item} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}