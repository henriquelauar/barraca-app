"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TarefaExecucaoState =
  | {
      error?: string;
      success?: string;
    }
  | null;

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

function getHojeDate() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getHojeISO() {
  return toISODate(getHojeDate());
}

function getDiaSemanaAtual() {
  return getHojeDate().getDay(); // 0=domingo ... 6=sábado
}

function getInicioSemana(date = getHojeDate()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 domingo, 1 segunda...
  const diff = day === 0 ? -6 : 1 - day; // segunda-feira como início
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getFimSemana(date = getHojeDate()) {
  const inicio = getInicioSemana(date);
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  fim.setHours(0, 0, 0, 0);
  return fim;
}

export async function listarResumoSemanaAtual() {
  const hoje = getHojeDate();
  const inicioSemana = getInicioSemana(hoje);
  const fimSemana = getFimSemana(hoje);

  return {
    hoje: toISODate(hoje),
    inicioSemana: toISODate(inicioSemana),
    fimSemana: toISODate(fimSemana),
    diaSemanaAtual: getDiaSemanaAtual(),
  };
}

export async function listarCiclosRotativos() {
    const { supabase, user } = await getAuthenticatedUser();
  
    if (!user) return [];
  
    const { data, error } = await supabase
      .from("tarefa_atribuicoes")
      .select("ciclo, tarefa:tarefas(categoria)")
      .not("ciclo", "is", null);
  
    if (error) {
      console.error("Erro ao listar ciclos rotativos:", error);
      return [];
    }
  
    const ciclos = (data ?? [])
      .filter(
        (item) =>
          item.ciclo &&
          !Array.isArray(item.tarefa) &&
          item.tarefa?.categoria === "rotativa_semanal"
      )
      .map((item) => item.ciclo as string);
  
    return Array.from(new Set(ciclos));
  }
  
  export async function listarEscalaRotativaPorCiclo(ciclo: string) {
    const { supabase, user } = await getAuthenticatedUser();
  
    if (!user || !ciclo) return [];
  
    const { data, error } = await supabase
      .from("tarefa_atribuicoes")
      .select(`
        id,
        ciclo,
        observacao,
        tarefa:tarefas (
          id,
          nome,
          categoria
        ),
        morador:moradores (
          id,
          nome
        )
      `)
      .eq("ciclo", ciclo);
  
    if (error) {
      console.error("Erro ao listar escala rotativa por ciclo:", error);
      return [];
    }
  
    return (data ?? []).filter(
      (item) =>
        !Array.isArray(item.tarefa) &&
        item.tarefa?.categoria === "rotativa_semanal"
    );
  }

  function parseISODate(value: string) {
    const date = new Date(`${value}T00:00:00`);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  
  function addDays(date: Date, amount: number) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + amount);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }
  
  export async function listarResumoSemana(semanaInicioParam?: string) {
    const inicioBase = semanaInicioParam
      ? parseISODate(semanaInicioParam)
      : getInicioSemana();
  
    const inicioSemana = getInicioSemana(inicioBase);
    const fimSemana = addDays(inicioSemana, 6);
    const hoje = getHojeDate();
  
    return {
      hoje: toISODate(hoje),
      inicioSemana: toISODate(inicioSemana),
      fimSemana: toISODate(fimSemana),
      anteriorSemana: toISODate(addDays(inicioSemana, -7)),
      proximaSemana: toISODate(addDays(inicioSemana, 7)),
      semanaAtualInicio: toISODate(getInicioSemana()),
    };
  }
  
  export async function listarExecucoesDaSemana(semanaInicioParam?: string) {
    const { supabase, user } = await getAuthenticatedUser();
  
    if (!user) return [];
  
    const semanaInicio = semanaInicioParam
      ? toISODate(getInicioSemana(parseISODate(semanaInicioParam)))
      : toISODate(getInicioSemana());
  
    const { data, error } = await supabase
      .from("tarefa_execucoes")
      .select(`
        id,
        atribuicao_id,
        status,
        data_referencia,
        semana_inicio,
        concluido_em,
        concluido_por
      `)
      .eq("semana_inicio", semanaInicio);
  
    if (error) {
      console.error("Erro ao listar execuções da semana:", error);
      return [];
    }
  
    return data ?? [];
  }

export async function listarTarefasHoje() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) return [];

  const hoje = getHojeISO();
  const diaSemana = getDiaSemanaAtual();
  const semanaInicio = toISODate(getInicioSemana());

  const { data, error } = await supabase
    .from("tarefa_atribuicoes")
    .select(`
      id,
      ciclo,
      dia_semana,
      hora_inicio,
      hora_fim,
      observacao,
      tarefa:tarefas (
        id,
        nome,
        categoria
      ),
      morador:moradores (
        id,
        nome
      ),
      execucao:tarefa_execucoes (
        id,
        status,
        data_referencia,
        semana_inicio,
        concluido_em
      )
    `)
    .eq("dia_semana", diaSemana);

  if (error) {
    console.error("Erro ao listar tarefas de hoje:", error);
    return [];
  }

  return (data ?? []).map((item) => {
    const execucoes = Array.isArray(item.execucao) ? item.execucao : [];
    const execucaoHoje = execucoes.find(
      (e) => e.data_referencia === hoje && e.semana_inicio === semanaInicio
    );

    return {
      ...item,
      execucao_hoje: execucaoHoje ?? null,
    };
  });
}

export async function listarTarefasPorCategoria() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      rotativas: [],
      fixas: [],
      pets: [],
      horarios: [],
      mensais: [],
    };
  }

  const { data, error } = await supabase
    .from("tarefa_atribuicoes")
    .select(`
      id,
      ciclo,
      dia_semana,
      hora_inicio,
      hora_fim,
      observacao,
      tarefa:tarefas (
        id,
        nome,
        categoria
      ),
      morador:moradores (
        id,
        nome
      )
    `)
    .order("ciclo", { ascending: true })
    .order("dia_semana", { ascending: true });

  if (error) {
    console.error("Erro ao listar tarefas por categoria:", error);
    return {
      rotativas: [],
      fixas: [],
      pets: [],
      horarios: [],
      mensais: [],
    };
  }

  const items = data ?? [];

  return {
    rotativas: items.filter(
      (item) =>
        !Array.isArray(item.tarefa) &&
        item.tarefa?.categoria === "rotativa_semanal"
    ),
    fixas: items.filter(
      (item) =>
        !Array.isArray(item.tarefa) &&
        item.tarefa?.categoria === "fixa_dia_semana"
    ),
    pets: items.filter(
      (item) =>
        !Array.isArray(item.tarefa) &&
        item.tarefa?.categoria === "rotina_pet"
    ),
    horarios: items.filter(
      (item) =>
        !Array.isArray(item.tarefa) &&
        item.tarefa?.categoria === "faixa_horario"
    ),
    mensais: items.filter(
      (item) =>
        !Array.isArray(item.tarefa) &&
        item.tarefa?.categoria === "mensal"
    ),
  };
}

export async function listarExecucoesDaSemanaAtual() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) return [];

  const semanaInicio = toISODate(getInicioSemana());

  const { data, error } = await supabase
    .from("tarefa_execucoes")
    .select(`
      id,
      atribuicao_id,
      status,
      data_referencia,
      semana_inicio,
      concluido_em,
      concluido_por
    `)
    .eq("semana_inicio", semanaInicio);

  if (error) {
    console.error("Erro ao listar execuções da semana:", error);
    return [];
  }

  return data ?? [];
}

export async function marcarTarefaStatus(
  _prevState: TarefaExecucaoState,
  formData: FormData
): Promise<TarefaExecucaoState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const atribuicaoId = String(formData.get("atribuicao_id") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const dataReferencia =
    String(formData.get("data_referencia") || "").trim() || getHojeISO();

  if (!atribuicaoId || !status) {
    return { error: "Dados incompletos." };
  }

  if (!["pendente", "concluida", "nao_feita"].includes(status)) {
    return { error: "Status inválido." };
  }

  const dataRef = new Date(`${dataReferencia}T00:00:00`);
  const semanaInicio = toISODate(getInicioSemana(dataRef));

  const { data: moradorAtual, error: moradorError } = await supabase
    .from("moradores")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (moradorError) {
    return { error: moradorError.message };
  }

  const payload = {
    atribuicao_id: atribuicaoId,
    status,
    data_referencia: dataReferencia,
    semana_inicio: semanaInicio,
    concluido_em: status === "concluida" ? new Date().toISOString() : null,
    concluido_por: status === "concluida" ? moradorAtual?.id ?? null : null,
  };

  const { error } = await supabase.from("tarefa_execucoes").upsert(payload, {
    onConflict: "atribuicao_id,data_referencia",
  });

  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/tarefas");
  return { success: "Status da tarefa atualizado." };
}