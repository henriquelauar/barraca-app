import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { TarefaCell } from "@/components/tarefas/tarefa-cell";
import { CicloSelector } from "@/components/tarefas/ciclo-selector";
import { SemanaSelector } from "@/components/tarefas/semana-selector";
import {
  listarCiclosRotativos,
  listarEscalaRotativaPorCiclo,
  listarExecucoesDaSemana,
  listarResumoSemana,
  listarTarefasPorCategoria,
} from "@/lib/actions/tarefas";

type TarefaItem = {
  id: string;
  ciclo?: string | null;
  dia_semana?: number | null;
  hora_inicio?: string | null;
  hora_fim?: string | null;
  observacao?: string | null;
  tarefa:
    | {
        id: string;
        nome: string;
        categoria: string;
      }
    | {
        id: string;
        nome: string;
        categoria: string;
      }[]
    | null;
  morador:
    | {
        id: string;
        nome: string;
      }
    | {
        id: string;
        nome: string;
      }[]
    | null;
};

type Execucao = {
  id: string;
  atribuicao_id: string;
  status: "pendente" | "concluida" | "nao_feita";
  data_referencia: string;
  semana_inicio: string;
  concluido_em?: string | null;
  concluido_por?: string | null;
};

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(`${data}T00:00:00`));
}

function formatarPeriodoSemana(inicio: string, fim: string) {
  return `${formatarData(inicio)} a ${formatarData(fim)}`;
}

function renderNome(
  obj: { nome: string } | { nome: string }[] | null | undefined
) {
  if (!obj) return "Sem responsável";
  if (Array.isArray(obj)) return obj[0]?.nome ?? "Sem responsável";
  return obj.nome;
}

function renderTarefa(
  obj:
    | { nome: string; categoria: string }
    | { nome: string; categoria: string }[]
    | null
    | undefined
) {
  if (!obj) return null;
  if (Array.isArray(obj)) return obj[0] ?? null;
  return obj;
}

function formatarHorario(hora: string | null | undefined) {
  if (!hora) return "";
  return hora.slice(0, 5);
}

function getDateForWeekday(semanaInicio: string, diaSemana: number) {
  const base = new Date(`${semanaInicio}T00:00:00`);
  const offset = diaSemana === 0 ? 6 : diaSemana - 1;
  base.setDate(base.getDate() + offset);
  return base.toISOString().slice(0, 10);
}

function findExecucao(
  execucoes: Execucao[],
  atribuicaoId: string,
  dataReferencia: string
) {
  return (
    execucoes.find(
      (item) =>
        item.atribuicao_id === atribuicaoId &&
        item.data_referencia === dataReferencia
    ) ?? null
  );
}

function groupByTaskAndDay(items: TarefaItem[]) {
  const map = new Map<string, TarefaItem[]>();

  for (const item of items) {
    const tarefa = renderTarefa(item.tarefa);
    const key = `${tarefa?.nome ?? "Tarefa"}::${item.dia_semana ?? -1}`;

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(item);
  }

  return map;
}

function getCellItems(
  grouped: Map<string, TarefaItem[]>,
  tarefaNome: string,
  diaSemana: number
) {
  return grouped.get(`${tarefaNome}::${diaSemana}`) ?? [];
}

function SemanaCell({
  items,
  execucoes,
  dataReferencia,
  horario = false,
}: {
  items: TarefaItem[];
  execucoes: Execucao[];
  dataReferencia: string;
  horario?: boolean;
}) {
  if (items.length === 0) {
    return <span className="text-sm text-zinc-600">—</span>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const execucao = findExecucao(execucoes, item.id, dataReferencia);

        return (
          <TarefaCell
            key={`${item.id}-${dataReferencia}`}
            atribuicaoId={item.id}
            dataReferencia={dataReferencia}
            responsavel={renderNome(item.morador)}
            statusAtual={execucao?.status ?? null}
            horario={
              horario
                ? `${formatarHorario(item.hora_inicio)}–${formatarHorario(item.hora_fim)}`
                : null
            }
          />
        );
      })}
    </div>
  );
}

function MobileTaskBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-zinc-400">{subtitle}</p>
        ) : null}
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default async function TarefasPage({
  searchParams,
}: {
  searchParams?: Promise<{ ciclo?: string; semana?: string }>;
}) {
  const params = (await searchParams) ?? {};

  const [grupos, resumo, execucoes, ciclos] = await Promise.all([
    listarTarefasPorCategoria(),
    listarResumoSemana(params.semana),
    listarExecucoesDaSemana(params.semana),
    listarCiclosRotativos(),
  ]);

  const cicloAtual =
    params.ciclo && ciclos.includes(params.ciclo)
      ? params.ciclo
      : ciclos[0] || "";

  const escalaRotativa = cicloAtual
    ? ((await listarEscalaRotativaPorCiclo(cicloAtual)) as TarefaItem[])
    : [];

  const fixas = grupos.fixas as TarefaItem[];
  const pets = grupos.pets as TarefaItem[];
  const horarios = grupos.horarios as TarefaItem[];

  const tarefasGerais = [
    "Área Externa",
    "Banheiro Suíte",
    "Banheiro Social Baixo",
    "Sala / Corredor Baixo",
    "Cozinha / Lavabo",
    "Sala / Varanda Cima",
    "Banheiro Social Cima",
  ];

  const groupedFixas = groupByTaskAndDay(fixas);
  const groupedPets = groupByTaskAndDay(pets);
  const groupedHorarios = groupByTaskAndDay(horarios);

  const diasGerais = [
    { label: "Segunda", value: 1 },
    { label: "Quarta", value: 3 },
    { label: "Sexta", value: 5 },
  ];

  const diasSemana = [
    { label: "Domingo", value: 0 },
    { label: "Segunda", value: 1 },
    { label: "Terça", value: 2 },
    { label: "Quarta", value: 3 },
    { label: "Quinta", value: 4 },
    { label: "Sexta", value: 5 },
    { label: "Sábado", value: 6 },
  ];

  const moradoresRotativa = escalaRotativa
    .map((item) => ({
      atribuicaoId: item.id,
      moradorNome: renderNome(item.morador),
      tarefaNome: renderTarefa(item.tarefa)?.nome ?? "Tarefa",
    }))
    .sort((a, b) => a.moradorNome.localeCompare(b.moradorNome, "pt-BR"));

  const tarefasHojeCount = execucoes.filter(
    (item) => item.data_referencia === resumo.hoje
  ).length;

  const concluidasSemana = execucoes.filter(
    (item) => item.status === "concluida"
  ).length;

  const pendentesSemana = execucoes.filter(
    (item) => item.status === "pendente"
  ).length;

  const naoFeitasSemana = execucoes.filter(
    (item) => item.status === "nao_feita"
  ).length;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Tarefas"
        description="Visual semanal das atividades da casa, tarefas rotativas, pets e horários. Agora com foco em leitura rápida, contraste e uso no celular."
        action={
          <div className="w-full md:w-auto">
            <CicloSelector ciclos={ciclos} cicloAtual={cicloAtual} />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Semana"
          value={formatarPeriodoSemana(resumo.inicioSemana, resumo.fimSemana)}
          helper="Período exibido no painel"
        />
        <StatCard
          title="Tarefas hoje"
          value={tarefasHojeCount}
          helper={`Referência de hoje: ${formatarData(resumo.hoje)}`}
        />
        <StatCard
          title="Concluídas"
          value={concluidasSemana}
          helper={`${pendentesSemana} pendentes na semana`}
        />
        <StatCard
          title="Não feitas"
          value={naoFeitasSemana}
          helper="Use esse número para atacar os gargalos da rotina"
        />
      </div>

      <SemanaSelector
        inicioSemana={resumo.inicioSemana}
        anteriorSemana={resumo.anteriorSemana}
        proximaSemana={resumo.proximaSemana}
        semanaAtualInicio={resumo.semanaAtualInicio}
      />

      <SectionCard
        title="Tarefas gerais"
        description="Limpeza e manutenção recorrente da casa. No desktop fica em tabela. No celular, em blocos empilhados."
      >
        <div className="hidden lg:block overflow-x-auto">
          <table className="table-dark min-w-[980px]">
            <thead>
              <tr>
                <th>Tarefa</th>
                {diasGerais.map((dia) => (
                  <th key={dia.value}>{dia.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tarefasGerais.map((tarefaNome) => (
                <tr key={tarefaNome}>
                  <td className="w-[220px] font-semibold text-white">{tarefaNome}</td>
                  {diasGerais.map((dia) => {
                    const items = getCellItems(groupedFixas, tarefaNome, dia.value);
                    const dataReferencia = getDateForWeekday(
                      resumo.inicioSemana,
                      dia.value
                    );

                    return (
                      <td key={`${tarefaNome}-${dia.value}`} className="min-w-[260px]">
                        <SemanaCell
                          items={items}
                          execucoes={execucoes}
                          dataReferencia={dataReferencia}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 lg:hidden">
          {tarefasGerais.map((tarefaNome) => (
            <MobileTaskBlock
              key={tarefaNome}
              title={tarefaNome}
              subtitle="Responsáveis por dia da semana"
            >
              {diasGerais.map((dia) => {
                const items = getCellItems(groupedFixas, tarefaNome, dia.value);
                const dataReferencia = getDateForWeekday(
                  resumo.inicioSemana,
                  dia.value
                );

                return (
                  <div key={`${tarefaNome}-${dia.value}`} className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      {dia.label}
                    </p>
                    <SemanaCell
                      items={items}
                      execucoes={execucoes}
                      dataReferencia={dataReferencia}
                    />
                  </div>
                );
              })}
            </MobileTaskBlock>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Escala rotativa"
        description="Distribuição atual do ciclo rotativo da casa."
      >
        {ciclos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
            Nenhum ciclo rotativo cadastrado ainda.
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="table-dark min-w-[900px]">
                <thead>
                  <tr>
                    <th>Morador</th>
                    <th>Tarefa</th>
                    <th>Status hoje</th>
                  </tr>
                </thead>
                <tbody>
                  {moradoresRotativa.map((item) => {
                    const execucao = findExecucao(
                      execucoes,
                      item.atribuicaoId,
                      resumo.hoje
                    );

                    return (
                      <tr key={item.atribuicaoId}>
                        <td className="font-semibold text-white">{item.moradorNome}</td>
                        <td>{item.tarefaNome}</td>
                        <td className="min-w-[320px]">
                          <TarefaCell
                            atribuicaoId={item.atribuicaoId}
                            dataReferencia={resumo.hoje}
                            responsavel={item.moradorNome}
                            statusAtual={execucao?.status ?? null}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 lg:hidden">
              {moradoresRotativa.map((item) => {
                const execucao = findExecucao(
                  execucoes,
                  item.atribuicaoId,
                  resumo.hoje
                );

                return (
                  <MobileTaskBlock
                    key={item.atribuicaoId}
                    title={item.moradorNome}
                    subtitle={item.tarefaNome}
                  >
                    <TarefaCell
                      atribuicaoId={item.atribuicaoId}
                      dataReferencia={resumo.hoje}
                      responsavel={item.moradorNome}
                      statusAtual={execucao?.status ?? null}
                    />
                  </MobileTaskBlock>
                );
              })}
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard
        title="Pets"
        description="Rotinas diárias da Donatella."
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Cocô Donatella</h3>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {diasSemana.map((dia) => {
                const items = getCellItems(groupedPets, "Cocô Donatella", dia.value);
                const dataReferencia = getDateForWeekday(
                  resumo.inicioSemana,
                  dia.value
                );

                return (
                  <div
                    key={`coco-${dia.value}`}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      {dia.label}
                    </p>
                    <SemanaCell
                      items={items}
                      execucoes={execucoes}
                      dataReferencia={dataReferencia}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Passear Donatella</h3>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {diasSemana.map((dia) => {
                const items = getCellItems(
                  groupedPets,
                  "Passear Donatella",
                  dia.value
                );
                const dataReferencia = getDateForWeekday(
                  resumo.inicioSemana,
                  dia.value
                );

                return (
                  <div
                    key={`passeio-${dia.value}`}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      {dia.label}
                    </p>
                    <SemanaCell
                      items={items}
                      execucoes={execucoes}
                      dataReferencia={dataReferencia}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Lavar roupa"
        description="Separação por turnos ao longo da semana."
      >
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {diasSemana.map((dia) => {
            const itemsDia = getCellItems(groupedHorarios, "Lavar Roupa", dia.value);

            const turno1 = itemsDia.filter(
              (item) =>
                formatarHorario(item.hora_inicio) === "00:00" &&
                formatarHorario(item.hora_fim).startsWith("14:")
            );

            const turno2 = itemsDia.filter(
              (item) =>
                formatarHorario(item.hora_inicio).startsWith("14:") &&
                formatarHorario(item.hora_fim)
            );

            const dataReferencia = getDateForWeekday(
              resumo.inicioSemana,
              dia.value
            );

            return (
              <div
                key={`roupa-${dia.value}`}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
              >
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  {dia.label}
                </p>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-white">00h–14h</p>
                    <SemanaCell
                      items={turno1}
                      execucoes={execucoes}
                      dataReferencia={dataReferencia}
                      horario
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-white">14h–24h</p>
                    <SemanaCell
                      items={turno2}
                      execucoes={execucoes}
                      dataReferencia={dataReferencia}
                      horario
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}