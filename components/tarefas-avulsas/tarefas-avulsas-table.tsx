import {
  atualizarStatusTarefaAvulsa,
  removerTarefaAvulsa,
  TarefaAvulsa,
} from "@/lib/actions/tarefas-avulsas";
import { StatusBadge } from "@/components/ui/status-badge";

type TarefasAvulsasTableProps = {
  tarefas: TarefaAvulsa[];
  variant: "abertas" | "concluidas";
};

function getStatusLabel(status: TarefaAvulsa["status"]) {
  switch (status) {
    case "pendente":
      return "Pendente";
    case "em_andamento":
      return "Em andamento";
    case "concluida":
      return "Concluída";
    default:
      return status;
  }
}

function getStatusVariant(status: TarefaAvulsa["status"]) {
  switch (status) {
    case "pendente":
      return "warning" as const;
    case "em_andamento":
      return "info" as const;
    case "concluida":
      return "success" as const;
    default:
      return "neutral" as const;
  }
}

function formatarData(data: string | null) {
  if (!data) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(`${data}T00:00:00`));
}

function isVencida(tarefa: TarefaAvulsa) {
  if (tarefa.status === "concluida") return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataLimite = new Date(`${tarefa.data_limite}T00:00:00`);
  return dataLimite.getTime() < hoje.getTime();
}

function EmptyState({ variant }: { variant: "abertas" | "concluidas" }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="text-sm font-medium text-slate-700">
        {variant === "abertas"
          ? "Nenhuma tarefa em aberto."
          : "Nenhuma tarefa concluída ainda."}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        As tarefas aparecerão aqui conforme forem cadastradas.
      </p>
    </div>
  );
}

export function TarefasAvulsasTable({
  tarefas,
  variant,
}: TarefasAvulsasTableProps) {
  if (tarefas.length === 0) {
    return <EmptyState variant={variant} />;
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Tarefa</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Data limite</th>
              <th className="px-4 py-3">Criada por</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {tarefas.map((tarefa) => {
              const vencida = isVencida(tarefa);

              return (
                <tr key={tarefa.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="max-w-[280px]">
                      <p className="font-medium text-slate-900">{tarefa.titulo}</p>
                      {tarefa.descricao ? (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {tarefa.descricao}
                        </p>
                      ) : null}
                      {tarefa.concluida_em ? (
                        <p className="mt-1 text-xs text-slate-400">
                          Concluída em{" "}
                          {new Intl.DateTimeFormat("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(new Date(tarefa.concluida_em))}
                        </p>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    {Array.isArray(tarefa.responsavel)
                      ? tarefa.responsavel[0]?.nome ?? "Sem responsável"
                      : tarefa.responsavel?.nome ?? "Sem responsável"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    <div className="space-y-1">
                      <p>{formatarData(tarefa.data_limite)}</p>
                      {vencida ? (
                        <p className="text-xs font-medium text-rose-600">
                          Vencida
                        </p>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    {Array.isArray(tarefa.criador)
                      ? tarefa.criador[0]?.nome ?? "—"
                      : tarefa.criador?.nome ?? "—"}
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge variant={getStatusVariant(tarefa.status)}>
                      {getStatusLabel(tarefa.status)}
                    </StatusBadge>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-col items-end gap-2">
                      {tarefa.status !== "em_andamento" ? (
                        <form action={atualizarStatusTarefaAvulsa}>
                          <input type="hidden" name="id" value={tarefa.id} />
                          <input
                            type="hidden"
                            name="status"
                            value="em_andamento"
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-sky-200 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
                          >
                            Em andamento
                          </button>
                        </form>
                      ) : null}

                      {tarefa.status !== "concluida" ? (
                        <form action={atualizarStatusTarefaAvulsa}>
                          <input type="hidden" name="id" value={tarefa.id} />
                          <input type="hidden" name="status" value="concluida" />
                          <button
                            type="submit"
                            className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                          >
                            Concluir
                          </button>
                        </form>
                      ) : (
                        <form action={atualizarStatusTarefaAvulsa}>
                          <input type="hidden" name="id" value={tarefa.id} />
                          <input type="hidden" name="status" value="pendente" />
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Reabrir
                          </button>
                        </form>
                      )}

                      <form action={removerTarefaAvulsa}>
                        <input type="hidden" name="id" value={tarefa.id} />
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
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {tarefas.map((tarefa) => {
          const vencida = isVencida(tarefa);

          return (
            <div
              key={tarefa.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-900">{tarefa.titulo}</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Prazo: {formatarData(tarefa.data_limite)}
                  </p>
                </div>

                <StatusBadge variant={getStatusVariant(tarefa.status)}>
                  {getStatusLabel(tarefa.status)}
                </StatusBadge>
              </div>

              {vencida ? (
                <p className="mt-2 text-sm font-medium text-rose-600">Vencida</p>
              ) : null}

              {tarefa.descricao ? (
                <p className="mt-3 text-sm text-slate-600">{tarefa.descricao}</p>
              ) : null}

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-700">Responsável:</span>{" "}
                  {Array.isArray(tarefa.responsavel)
                    ? tarefa.responsavel[0]?.nome ?? "Sem responsável"
                    : tarefa.responsavel?.nome ?? "Sem responsável"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Criada por:</span>{" "}
                  {Array.isArray(tarefa.criador)
                    ? tarefa.criador[0]?.nome ?? "—"
                    : tarefa.criador?.nome ?? "—"}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tarefa.status !== "em_andamento" ? (
                  <form action={atualizarStatusTarefaAvulsa}>
                    <input type="hidden" name="id" value={tarefa.id} />
                    <input type="hidden" name="status" value="em_andamento" />
                    <button
                      type="submit"
                      className="rounded-lg border border-sky-200 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
                    >
                      Em andamento
                    </button>
                  </form>
                ) : null}

                {tarefa.status !== "concluida" ? (
                  <form action={atualizarStatusTarefaAvulsa}>
                    <input type="hidden" name="id" value={tarefa.id} />
                    <input type="hidden" name="status" value="concluida" />
                    <button
                      type="submit"
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Concluir
                    </button>
                  </form>
                ) : (
                  <form action={atualizarStatusTarefaAvulsa}>
                    <input type="hidden" name="id" value={tarefa.id} />
                    <input type="hidden" name="status" value="pendente" />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Reabrir
                    </button>
                  </form>
                )}

                <form action={removerTarefaAvulsa}>
                  <input type="hidden" name="id" value={tarefa.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                  >
                    Remover
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}