"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EventoTipo =
  | "social"
  | "formatura"
  | "reuniao"
  | "escolha"
  | "almoco"
  | "aniversario"
  | "outro";

export type PresencaStatus = "pendente" | "vai" | "nao_vai";

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
} | null;

type MoradorResumo = {
  id: string;
  nome: string;
};

type EventoPresencaComMorador = {
  id: string;
  evento_id: string;
  morador_id: string;
  status: PresencaStatus;
  observacao: string | null;
  respondido_em: string | null;
  criado_em: string;
  atualizado_em: string;
  morador:
    | MoradorResumo
    | MoradorResumo[]
    | null;
};

export type EventoComPresencas = {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: EventoTipo;
  data_inicio: string;
  data_fim: string | null;
  local: string | null;
  criado_por: string | null;
  criado_em: string;
  atualizado_em: string;
  presencas:
    | EventoPresencaComMorador[]
    | null;
};

export type EventosPageData = {
  proximos: EventoComPresencas[];
  passados: EventoComPresencas[];
  eventosDoMes: EventoComPresencas[];
  stats: {
    total: number;
    proximos: number;
    passados: number;
    hoje: number;
    noMes: number;
    pendentesResposta: number;
  };
};

const TIPOS_VALIDOS: EventoTipo[] = [
  "social",
  "formatura",
  "reuniao",
  "escolha",
  "almoco",
  "aniversario",
  "outro",
];

const STATUS_VALIDOS: PresencaStatus[] = ["pendente", "vai", "nao_vai"];

function getNow() {
  return new Date();
}

function getInicioDoDia(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getFimDoDia(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getInicioDoMes(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function getFimDoMes(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function normalizarPresencas(
  presencas: EventoComPresencas["presencas"]
): EventoPresencaComMorador[] {
  if (!presencas) return [];

  return presencas.map((item) => {
    const morador = Array.isArray(item.morador)
      ? item.morador[0] ?? null
      : item.morador;

    return {
      ...item,
      morador,
    };
  });
}

function isHoje(dateStr: string) {
  const data = new Date(dateStr);
  const hoje = new Date();

  return (
    data.getFullYear() === hoje.getFullYear() &&
    data.getMonth() === hoje.getMonth() &&
    data.getDate() === hoje.getDate()
  );
}

function validarEventoInput(input: {
  titulo: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
}) {
  const errors: Record<string, string[]> = {};

  if (!input.titulo.trim()) {
    errors.titulo = ["Informe o título do evento."];
  }

  if (!TIPOS_VALIDOS.includes(input.tipo as EventoTipo)) {
    errors.tipo = ["Selecione um tipo de evento válido."];
  }

  if (!input.data_inicio) {
    errors.data_inicio = ["Informe a data e hora de início."];
  }

  if (
    input.data_inicio &&
    input.data_fim &&
    new Date(input.data_fim).getTime() < new Date(input.data_inicio).getTime()
  ) {
    errors.data_fim = ["A data final não pode ser anterior ao início."];
  }

  return errors;
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

async function getMoradorAtualId(userId: string | undefined) {
  if (!userId) return null;

  const supabase = await createClient();

  const { data } = await supabase
    .from("moradores")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.id ?? null;
}

export async function listarEventosPagina(): Promise<EventosPageData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("eventos")
    .select(`
      id,
      titulo,
      descricao,
      tipo,
      data_inicio,
      data_fim,
      local,
      criado_por,
      criado_em,
      atualizado_em,
      presencas:evento_presencas (
        id,
        evento_id,
        morador_id,
        status,
        observacao,
        respondido_em,
        criado_em,
        atualizado_em,
        morador:moradores!evento_presencas_morador_id_fkey (
          id,
          nome
        )
      )
    `)
    .order("data_inicio", { ascending: true });

  if (error) {
    console.error("Erro ao listar eventos:", error);
    return {
      proximos: [],
      passados: [],
      eventosDoMes: [],
      stats: {
        total: 0,
        proximos: 0,
        passados: 0,
        hoje: 0,
        noMes: 0,
        pendentesResposta: 0,
      },
    };
  }

  const eventos = ((data ?? []) as EventoComPresencas[]).map((evento) => ({
    ...evento,
    presencas: normalizarPresencas(evento.presencas),
  }));

  const agora = getNow();
  const inicioHoje = getInicioDoDia(agora);
  const inicioMes = getInicioDoMes(agora);
  const fimMes = getFimDoMes(agora);

  const proximos = eventos.filter(
    (evento) => new Date(evento.data_inicio).getTime() >= inicioHoje.getTime()
  );

  const passados = eventos
    .filter(
      (evento) => new Date(evento.data_inicio).getTime() < inicioHoje.getTime()
    )
    .sort(
      (a, b) =>
        new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()
    );

  const eventosDoMes = eventos.filter((evento) => {
    const dataInicio = new Date(evento.data_inicio).getTime();
    return (
      dataInicio >= inicioMes.getTime() &&
      dataInicio <= fimMes.getTime()
    );
  });

  const hoje = eventos.filter((evento) => isHoje(evento.data_inicio)).length;

  const pendentesResposta = proximos.reduce((acc, evento) => {
    const presencas = normalizarPresencas(evento.presencas);
    return (
      acc +
      presencas.filter((presenca) => presenca.status === "pendente").length
    );
  }, 0);

  return {
    proximos,
    passados,
    eventosDoMes,
    stats: {
      total: eventos.length,
      proximos: proximos.length,
      passados: passados.length,
      hoje,
      noMes: eventosDoMes.length,
      pendentesResposta,
    },
  };
}

export async function criarEvento(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message: "Você precisa estar autenticado para criar um evento.",
    };
  }

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim();
  const data_inicio = String(formData.get("data_inicio") ?? "").trim();
  const data_fim = String(formData.get("data_fim") ?? "").trim();
  const local = String(formData.get("local") ?? "").trim();

  const errors = validarEventoInput({
    titulo,
    tipo,
    data_inicio,
    data_fim,
  });

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Revise os campos do formulário.",
      errors,
    };
  }

  const moradorAtualId = await getMoradorAtualId(user.id);

  const { data: eventoCriado, error: insertError } = await supabase
    .from("eventos")
    .insert({
      titulo,
      descricao: descricao || null,
      tipo,
      data_inicio: new Date(data_inicio).toISOString(),
      data_fim: data_fim ? new Date(data_fim).toISOString() : null,
      local: local || null,
      criado_por: moradorAtualId,
    })
    .select("id")
    .single();

  if (insertError || !eventoCriado) {
    console.error("Erro ao criar evento:", insertError);
    return {
      success: false,
      message: insertError?.message ?? "Não foi possível criar o evento.",
    };
  }

  const { data: moradores, error: moradoresError } = await supabase
    .from("moradores")
    .select("id")
    .order("nome", { ascending: true });

  if (moradoresError) {
    console.error("Erro ao buscar moradores para presença:", moradoresError);
    return {
      success: false,
      message:
        "O evento foi criado, mas não foi possível preparar a lista de presença.",
    };
  }

  if ((moradores ?? []).length > 0) {
    const payloadPresencas = moradores!.map((morador) => ({
      evento_id: eventoCriado.id,
      morador_id: morador.id,
      status: "pendente" as PresencaStatus,
      observacao: null,
      respondido_em: null,
    }));

    const { error: presencasError } = await supabase
      .from("evento_presencas")
      .insert(payloadPresencas);

    if (presencasError) {
      console.error("Erro ao criar presenças do evento:", presencasError);
      return {
        success: false,
        message:
          "O evento foi criado, mas houve erro ao gerar as presenças iniciais.",
      };
    }
  }

  revalidatePath("/eventos");

  return {
    success: true,
    message: "Evento criado com sucesso.",
  };
}

export async function atualizarPresencaEvento(
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message: "Você precisa estar autenticado para responder presença.",
    };
  }

  const eventoId = String(formData.get("evento_id") ?? "").trim();
  const moradorId = String(formData.get("morador_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as PresencaStatus;

  if (!eventoId || !moradorId) {
    return {
      success: false,
      message: "Dados de presença incompletos.",
    };
  }

  if (!STATUS_VALIDOS.includes(status)) {
    return {
      success: false,
      message: "Status de presença inválido.",
    };
  }

  const { error } = await supabase
    .from("evento_presencas")
    .update({
      status,
      respondido_em: status === "pendente" ? null : new Date().toISOString(),
    })
    .eq("evento_id", eventoId)
    .eq("morador_id", moradorId);

  if (error) {
    console.error("Erro ao atualizar presença:", error);
    return {
      success: false,
      message: error.message ?? "Não foi possível atualizar a presença.",
    };
  }

  revalidatePath("/eventos");

  return {
    success: true,
    message: "Presença atualizada com sucesso.",
  };
}

export async function removerEvento(formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message: "Você precisa estar autenticado para remover um evento.",
    };
  }

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return {
      success: false,
      message: "Evento inválido.",
    };
  }

  const { error } = await supabase
    .from("eventos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao remover evento:", error);
    return {
      success: false,
      message: error.message ?? "Não foi possível remover o evento.",
    };
  }

  revalidatePath("/eventos");

  return {
    success: true,
    message: "Evento removido com sucesso.",
  };
}