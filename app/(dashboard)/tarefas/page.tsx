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

    if (!map.has(key)) map.set(key, []);
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
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const execucao = findExecucao(execucoes, item.id, dataReferencia);

        return (
          <TarefaCell
            key={item.id}
            atribuicaoId={item.id}
            dataReferencia={dataReferencia}
            responsavel={renderNome(item.morador)}
            statusAtual={execucao?.status ?? null}
            horario={
              horario && item.hora_inicio && item.hora_fim
                ? `${formatarHorario(item.hora_inicio)} às ${formatarHorario(
                    item.hora_fim
                  )}`
                : null
            }
          />
        );
      })}
    </div>
  );
}

export default async function TarefasPage({
  searchParams,
}: {
  searchParams?: { ciclo?: string; semana?: string };
}) {
  const [grupos, resumo, execucoes, ciclos] = await Promise.all([
    listarTarefasPorCategoria(),
    listarResumoSemana(searchParams?.semana),
    listarExecucoesDaSemana(searchParams?.semana),
    listarCiclosRotativos(),
  ]);

  const cicloAtual =
    searchParams?.ciclo && ciclos.includes(searchParams.ciclo)
      ? searchParams.ciclo
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
    <div className="space-y-6">
      <PageHeader
        title="Tarefas"
        description="Visualização semanal da Barraca Armada com histórico por semana e atualização direta na tabela."
      />


      <SectionCard
        title="Navegação semanal"
        description="Alterne entre a semana atual e semanas anteriores para consultar o histórico."
      >
        <SemanaSelector
          inicioSemana={resumo.inicioSemana}
          anteriorSemana={resumo.anteriorSemana}
          proximaSemana={resumo.proximaSemana}
          semanaAtualInicio={resumo.semanaAtualInicio}
        />
      </SectionCard>


      <SectionCard
        title="Geral"
        description="Tabela operacional da semana para as tarefas fixas da casa."
      >
        <div className="module-bar-amber mb-5" />

        <div className="data-table-wrapper">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="data-table">
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
                    <td className="font-medium text-slate-900">{tarefaNome}</td>
                    {diasGerais.map((dia) => (
                      <td key={dia.value} className="align-top">
                        <SemanaCell
                          items={getCellItems(groupedFixas, tarefaNome, dia.value)}
                          execucoes={execucoes}
                          dataReferencia={getDateForWeekday(
                            resumo.inicioSemana,
                            dia.value
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>
      <SectionCard
        title="Escala rotativa semanal"
        description="Visualização por ciclo, no estilo da planilha da casa."
        action={
          ciclos.length > 0 ? (
            <CicloSelector ciclos={ciclos} cicloAtual={cicloAtual} />
          ) : null
        }
      >
        <div className="module-bar-amber mb-5" />

        {ciclos.length === 0 ? (
          <div className="empty-state">
            Nenhum ciclo rotativo cadastrado ainda.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Morador</th>
                    <th>{cicloAtual}</th>
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
                        <td className="font-medium text-slate-900">
                          {item.moradorNome}
                        </td>
                        <td className="align-top">
                          <TarefaCell
                            atribuicaoId={item.atribuicaoId}
                            dataReferencia={resumo.hoje}
                            responsavel={item.tarefaNome}
                            statusAtual={execucao?.status ?? null}
                          />
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

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Cocô Donatella"
          description="Escala semanal da Donatella."
        >
          <div className="module-bar-amber mb-5" />

          <div className="data-table-wrapper">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dia</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {diasSemana.map((dia) => {
                    const items = getCellItems(
                      groupedPets,
                      "Cocô Donatella",
                      dia.value
                    );

                    return (
                      <tr key={dia.value}>
                        <td className="font-medium text-slate-900">
                          {dia.label}
                        </td>
                        <td className="align-top">
                          <SemanaCell
                            items={items}
                            execucoes={execucoes}
                            dataReferencia={getDateForWeekday(
                              resumo.inicioSemana,
                              dia.value
                            )}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Passear Donatella"
          description="Escala semanal de passeio."
        >
          <div className="module-bar-amber mb-5" />

          <div className="data-table-wrapper">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dia</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {diasSemana.map((dia) => {
                    const items = getCellItems(
                      groupedPets,
                      "Passear Donatella",
                      dia.value
                    );

                    return (
                      <tr key={dia.value}>
                        <td className="font-medium text-slate-900">
                          {dia.label}
                        </td>
                        <td className="align-top">
                          <SemanaCell
                            items={items}
                            execucoes={execucoes}
                            dataReferencia={getDateForWeekday(
                              resumo.inicioSemana,
                              dia.value
                            )}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Lavar Roupa"
        description="Escala semanal por faixa de horário."
      >
        <div className="module-bar-amber mb-5" />

        <div className="data-table-wrapper">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>00h–14h</th>
                  <th>14h–24h</th>
                </tr>
              </thead>

              <tbody>
                {diasSemana.map((dia) => {
                  const itemsDia = getCellItems(
                    groupedHorarios,
                    "Lavar Roupa",
                    dia.value
                  );

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
                    <tr key={dia.value}>
                      <td className="font-medium text-slate-900">{dia.label}</td>
                      <td className="align-top">
                        <SemanaCell
                          items={turno1}
                          execucoes={execucoes}
                          dataReferencia={dataReferencia}
                          horario
                        />
                      </td>
                      <td className="align-top">
                        <SemanaCell
                          items={turno2}
                          execucoes={execucoes}
                          dataReferencia={dataReferencia}
                          horario
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}