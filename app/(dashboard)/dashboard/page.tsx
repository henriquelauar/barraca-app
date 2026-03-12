import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";

type Morador = {
  id: string;
  nome: string;
  ativo?: boolean | null;
};

type Evento = {
  id: string;
  titulo: string;
  tipo: string;
  data_inicio: string;
  local: string | null;
};

type EventoPresenca = {
  evento_id: string;
  status: "pendente" | "vai" | "nao_vai";
};

type TarefaAvulsa = {
  id: string;
  titulo: string;
  descricao: string | null;
  data_limite: string;
  status: "pendente" | "em_andamento" | "concluida";
  responsavel_morador_id: string | null;
};

type Emprestimo = {
  id: string;
  nome_item: string;
  tipo: "emprestei" | "peguei_emprestado";
  data_emprestimo: string;
  status: "em_aberto" | "devolvido";
  pessoa_nome: string;
  pessoa_republica: string | null;
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    dateStyle: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getEventoTipoLabel(tipo: string) {
  switch (tipo) {
    case "social":
      return "Social";
    case "manutencao":
      return "Manutenção";
    case "reuniao":
      return "Reunião";
    case "financeiro":
      return "Financeiro";
    case "limpeza":
      return "Limpeza";
    case "aniversario":
      return "Aniversário";
    default:
      return "Outro";
  }
}

function getEventoTipoVariant(tipo: string) {
  switch (tipo) {
    case "social":
      return "info" as const;
    case "manutencao":
      return "warning" as const;
    case "reuniao":
      return "neutral" as const;
    case "financeiro":
      return "danger" as const;
    case "limpeza":
      return "success" as const;
    case "aniversario":
      return "info" as const;
    default:
      return "neutral" as const;
  }
}

function getTarefaStatusLabel(status: TarefaAvulsa["status"]) {
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

function getTarefaStatusVariant(status: TarefaAvulsa["status"]) {
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

function getEmprestimoTipoLabel(tipo: Emprestimo["tipo"]) {
  return tipo === "emprestei" ? "Emprestei" : "Peguei emprestado";
}

function getEmprestimoTipoVariant(tipo: Emprestimo["tipo"]) {
  return tipo === "emprestei" ? ("info" as const) : ("warning" as const);
}

function getPresencasResumo(eventoId: string, presencas: EventoPresenca[]) {
  return presencas
    .filter((item) => item.evento_id === eventoId)
    .reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { vai: 0, nao_vai: 0, pendente: 0 }
    );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const hoje = startOfToday();

  const [
    moradoresResult,
    eventosResult,
    presencasResult,
    tarefasResult,
    emprestimosResult,
  ] = await Promise.all([
    supabase
      .from("moradores")
      .select("id, nome, ativo")
      .order("nome", { ascending: true }),
    supabase
      .from("eventos")
      .select("id, titulo, tipo, data_inicio, local")
      .gte("data_inicio", hoje.toISOString())
      .order("data_inicio", { ascending: true })
      .limit(5),
    supabase.from("evento_presencas").select("evento_id, status"),
    supabase
      .from("tarefas_avulsas")
      .select("id, titulo, descricao, data_limite, status, responsavel_morador_id")
      .order("data_limite", { ascending: true }),
    supabase
      .from("emprestimos")
      .select("id, nome_item, tipo, data_emprestimo, status, pessoa_nome, pessoa_republica")
      .eq("status", "em_aberto")
      .order("data_emprestimo", { ascending: true })
      .limit(5),
  ]);

  const moradores = (moradoresResult.data ?? []) as Morador[];
  const eventos = (eventosResult.data ?? []) as Evento[];
  const presencas = (presencasResult.data ?? []) as EventoPresenca[];
  const tarefas = (tarefasResult.data ?? []) as TarefaAvulsa[];
  const emprestimos = (emprestimosResult.data ?? []) as Emprestimo[];

  const moradoresAtivos = moradores.filter((item) => item.ativo !== false);
  const tarefasAbertas = tarefas.filter((item) => item.status !== "concluida");
  const tarefasVencidas = tarefasAbertas.filter((item) => {
    const limite = new Date(`${item.data_limite}T00:00:00`);
    return limite.getTime() < hoje.getTime();
  });

  const tarefasEmAndamento = tarefas.filter(
    (item) => item.status === "em_andamento"
  );

  const eventosHoje = eventos.filter((evento) => {
    const data = new Date(evento.data_inicio);
    return (
      data.getFullYear() === hoje.getFullYear() &&
      data.getMonth() === hoje.getMonth() &&
      data.getDate() === hoje.getDate()
    );
  });

  const precisaAtencao = [
    ...tarefasVencidas.slice(0, 3).map((item) => ({
      id: item.id,
      tipo: "tarefa_vencida" as const,
      titulo: item.titulo,
      detalhe: `Prazo em ${formatDate(item.data_limite)}`,
    })),
    ...eventosHoje.slice(0, 2).map((item) => ({
      id: item.id,
      tipo: "evento_hoje" as const,
      titulo: item.titulo,
      detalhe: `Hoje às ${new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(item.data_inicio))}`,
    })),
    ...emprestimos.slice(0, 2).map((item) => ({
      id: item.id,
      tipo: "emprestimo_aberto" as const,
      titulo: item.nome_item,
      detalhe: `${getEmprestimoTipoLabel(item.tipo)} • ${item.pessoa_nome}`,
    })),
  ].slice(0, 6);

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Dashboard"
        description="Resumo geral da casa com foco no que precisa de atenção, próximos eventos, tarefas em aberto e empréstimos pendentes."
      />

      {/* <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Precisa de atenção"
          description="Itens urgentes para você bater o olho e agir rápido."
        >
          {precisaAtencao.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
              Nada urgente no momento. Sem tarefas vencidas, sem eventos hoje e sem pendências críticas visíveis.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {precisaAtencao.map((item) => (
                <div
                  key={`${item.tipo}-${item.id}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                >
                  <div className="mb-3">
                    {item.tipo === "tarefa_vencida" ? (
                      <StatusBadge variant="danger">Tarefa vencida</StatusBadge>
                    ) : null}
                    {item.tipo === "evento_hoje" ? (
                      <StatusBadge variant="warning">Evento hoje</StatusBadge>
                    ) : null}
                    {item.tipo === "emprestimo_aberto" ? (
                      <StatusBadge variant="info">Empréstimo em aberto</StatusBadge>
                    ) : null}
                  </div>

                  <h3 className="text-base font-semibold text-white">{item.titulo}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.detalhe}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

      </div> */}

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Próximos eventos"
          description="Agenda imediata da república."
        >
          {eventos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
              Nenhum evento próximo.
            </div>
          ) : (
            <div className="space-y-4">
              {eventos.map((evento) => {
                const resumo = getPresencasResumo(evento.id, presencas);

                return (
                  <div
                    key={evento.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-white">
                          {evento.titulo}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {formatDateTime(evento.data_inicio)}
                          {evento.local ? ` • ${evento.local}` : ""}
                        </p>
                      </div>

                      <StatusBadge variant={getEventoTipoVariant(evento.tipo)}>
                        {getEventoTipoLabel(evento.tipo)}
                      </StatusBadge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <StatusBadge variant="success">{resumo.vai} vão</StatusBadge>
                      <StatusBadge variant="danger">{resumo.nao_vai} não vão</StatusBadge>
                      <StatusBadge variant="warning">
                        {resumo.pendente} pendentes
                      </StatusBadge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Tarefas avulsas em aberto"
          description="Pendências operacionais da semana."
        >
          {tarefasAbertas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
              Nenhuma tarefa em aberto.
            </div>
          ) : (
            <div className="space-y-4">
              {tarefasAbertas.slice(0, 5).map((tarefa) => {
                const responsavel = moradores.find(
                  (morador) => morador.id === tarefa.responsavel_morador_id
                );

                const vencida = (() => {
                  const limite = new Date(`${tarefa.data_limite}T00:00:00`);
                  return limite.getTime() < hoje.getTime();
                })();

                return (
                  <div
                    key={tarefa.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-white">
                          {tarefa.titulo}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          Prazo: {formatDate(tarefa.data_limite)}
                        </p>
                        {tarefa.descricao ? (
                          <p className="text-sm leading-6 text-zinc-500">
                            {tarefa.descricao}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <StatusBadge variant={getTarefaStatusVariant(tarefa.status)}>
                          {getTarefaStatusLabel(tarefa.status)}
                        </StatusBadge>
                        {vencida ? (
                          <StatusBadge variant="danger">Vencida</StatusBadge>
                        ) : null}
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-zinc-400">
                      Responsável:{" "}
                      <span className="font-medium text-zinc-200">
                        {responsavel?.nome ?? "Sem responsável"}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Empréstimos em aberto"
        description="Itens que ainda precisam ser devolvidos ou recebidos."
      >
        {emprestimos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
            Nenhum empréstimo em aberto.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {emprestimos.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {item.nome_item}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      {item.pessoa_nome}
                      {item.pessoa_republica ? ` • ${item.pessoa_republica}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Desde {formatDate(item.data_emprestimo)}
                    </p>
                  </div>

                  <StatusBadge variant={getEmprestimoTipoVariant(item.tipo)}>
                    {getEmprestimoTipoLabel(item.tipo)}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}