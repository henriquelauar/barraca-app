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

function formatarDataHora(data: string | null) {
  if (!data) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

function isVencida(tarefa: TarefaAvulsa) {
  if (tarefa.status === "concluida") return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataLimite = new Date(`${tarefa.data_limite}T00:00:00`);
  return dataLimite.getTime() < hoje.getTime();
}

function getMoradorNome(
  morador:
    | { id: string; nome: string }
    | { id: string; nome: string }[]
    | null
    | undefined
) {
  if (!morador) return "Sem responsável";
  return Array.isArray(morador) ? morador[0]?.nome ?? "Sem responsável" : morador.nome;
}

function getCriadorNome(
  morador:
    | { id: string; nome: string }
    | { id: string; nome: string }[]
    | null
    | undefined
) {
  if (!morador) return "—";
  return Array.isArray(morador) ? morador[0]?.nome ?? "—" : morador.nome;
}

function EmptyState({ variant }: { variant: "abertas" | "concluidas" }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
      <p className="font-medium text-zinc-300">
        {variant === "abertas"
          ? "Nenhuma tarefa em aberto."
          : "Nenhuma tarefa concluída ainda."}
      </p>
      <p className="mt-2">As tarefas aparecerão aqui conforme forem cadastradas.</p>
    </div>
  );
}

function ActionButtons({ tarefa }: { tarefa: TarefaAvulsa }) {
  return (
    <div className="flex flex-wrap gap-2">

      {tarefa.status !== "concluida" ? (
        <form action={atualizarStatusTarefaAvulsa}>
          <input type="hidden" name="id" value={tarefa.id} />
          <button
            type="submit"
            name="status"
            value="concluida"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20"
          >
            Concluir
          </button>
        </form>
      ) : (
        <form action={atualizarStatusTarefaAvulsa}>
          <input type="hidden" name="id" value={tarefa.id} />
          <button
            type="submit"
            name="status"
            value="pendente"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 text-sm font-semibold text-amber-300 hover:bg-amber-500/20"
          >
            Reabrir
          </button>
        </form>
      )}

      <form action={removerTarefaAvulsa}>
        <input type="hidden" name="id" value={tarefa.id} />
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

export function TarefasAvulsasTable({
  tarefas,
  variant,
}: TarefasAvulsasTableProps) {
  if (tarefas.length === 0) {
    return <EmptyState variant={variant} />;
  }

  return (
    <>
      <div className="hidden xl:block overflow-x-auto">
        <table className="table-dark min-w-[1180px]">
          <thead>
            <tr>
              <th>Tarefa</th>
              <th>Responsável</th>
              <th>Data limite</th>
              <th>Criada por</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tarefas.map((tarefa) => {
              const vencida = isVencida(tarefa);

              return (
                <tr key={tarefa.id}>
                  <td className="min-w-[320px]">
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{tarefa.titulo}</p>

                      {tarefa.descricao ? (
                        <p className="text-sm text-zinc-500">{tarefa.descricao}</p>
                      ) : null}

                      {tarefa.concluida_em ? (
                        <p className="text-xs text-zinc-500">
                          Concluída em {formatarDataHora(tarefa.concluida_em)}
                        </p>
                      ) : null}
                    </div>
                  </td>

                  <td>{getMoradorNome(tarefa.responsavel)}</td>

                  <td>
                    <div className="flex flex-wrap gap-2">
                      <span>{formatarData(tarefa.data_limite)}</span>
                      {vencida ? <StatusBadge variant="danger">Vencida</StatusBadge> : null}
                    </div>
                  </td>

                  <td>{getCriadorNome(tarefa.criador)}</td>

                  <td>
                    <StatusBadge variant={getStatusVariant(tarefa.status)}>
                      {getStatusLabel(tarefa.status)}
                    </StatusBadge>
                  </td>

                  <td>
                    <ActionButtons tarefa={tarefa} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 xl:hidden">
        {tarefas.map((tarefa) => {
          const vencida = isVencida(tarefa);

          return (
            <div
              key={tarefa.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
            >
              <div className="flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge variant={getStatusVariant(tarefa.status)}>
                      {getStatusLabel(tarefa.status)}
                    </StatusBadge>
                    {vencida ? <StatusBadge variant="danger">Vencida</StatusBadge> : null}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {tarefa.titulo}
                    </h3>

                    {tarefa.descricao ? (
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {tarefa.descricao}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                        Prazo
                      </p>
                      <p className="mt-1 text-sm text-zinc-200">
                        {formatarData(tarefa.data_limite)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                        Responsável
                      </p>
                      <p className="mt-1 text-sm text-zinc-200">
                        {getMoradorNome(tarefa.responsavel)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                        Criada por
                      </p>
                      <p className="mt-1 text-sm text-zinc-200">
                        {getCriadorNome(tarefa.criador)}
                      </p>
                    </div>

                    {tarefa.concluida_em ? (
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                          Conclusão
                        </p>
                        <p className="mt-1 text-sm text-zinc-200">
                          {formatarDataHora(tarefa.concluida_em)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <ActionButtons tarefa={tarefa} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}