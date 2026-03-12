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
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="text-sm font-medium text-slate-700">
        {variant === "em_aberto"
          ? "Nenhum empréstimo em aberto."
          : "Nenhum empréstimo devolvido ainda."}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Os registros aparecerão aqui conforme forem cadastrados.
      </p>
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
    <div className="space-y-4">
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Pessoa</th>
              <th className="px-4 py-3">República</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {emprestimos.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="px-4 py-4">
                  <div className="max-w-[280px]">
                    <p className="font-medium text-slate-900">
                      {item.nome_item}
                    </p>
                    {item.observacao ? (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {item.observacao}
                      </p>
                    ) : null}
                    {item.data_devolucao ? (
                      <p className="mt-1 text-xs text-slate-400">
                        Devolvido em {formatarData(item.data_devolucao)}
                      </p>
                    ) : null}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <StatusBadge variant={getTipoVariant(item.tipo)}>
                    {getTipoLabel(item.tipo)}
                  </StatusBadge>
                </td>

                <td className="px-4 py-4 text-sm text-slate-700">
                  {formatarData(item.data_emprestimo)}
                </td>

                <td className="px-4 py-4 text-sm text-slate-700">
                  {item.pessoa_nome}
                </td>

                <td className="px-4 py-4 text-sm text-slate-700">
                  {item.pessoa_republica || "—"}
                </td>

                <td className="px-4 py-4">
                  <StatusBadge variant={getStatusVariant(item.status)}>
                    {getStatusLabel(item.status)}
                  </StatusBadge>
                </td>

                <td className="px-4 py-4">
                  <div className="flex flex-col items-end gap-2">
                    {item.status === "em_aberto" ? (
                      <form action={marcarEmprestimoComoDevolvido}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                        >
                          Marcar devolvido
                        </button>
                      </form>
                    ) : (
                      <form action={reabrirEmprestimo}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Reabrir
                        </button>
                      </form>
                    )}

                    <form action={removerEmprestimo}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Remover
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {emprestimos.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-slate-900">
                  {item.nome_item}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  {formatarData(item.data_emprestimo)}
                </p>
              </div>

              <StatusBadge variant={getStatusVariant(item.status)}>
                {getStatusLabel(item.status)}
              </StatusBadge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge variant={getTipoVariant(item.tipo)}>
                {getTipoLabel(item.tipo)}
              </StatusBadge>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-700">Pessoa:</span>{" "}
                {item.pessoa_nome}
              </p>
              <p>
                <span className="font-medium text-slate-700">República:</span>{" "}
                {item.pessoa_republica || "—"}
              </p>
              {item.observacao ? (
                <p>
                  <span className="font-medium text-slate-700">
                    Observação:
                  </span>{" "}
                  {item.observacao}
                </p>
              ) : null}
              {item.data_devolucao ? (
                <p>
                  <span className="font-medium text-slate-700">
                    Data de devolução:
                  </span>{" "}
                  {formatarData(item.data_devolucao)}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.status === "em_aberto" ? (
                <form action={marcarEmprestimoComoDevolvido}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                  >
                    Marcar devolvido
                  </button>
                </form>
              ) : (
                <form action={reabrirEmprestimo}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Reabrir
                  </button>
                </form>
              )}

              <form action={removerEmprestimo}>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                >
                  Remover
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}