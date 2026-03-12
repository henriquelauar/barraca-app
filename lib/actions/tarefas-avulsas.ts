"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TarefaAvulsaStatus = "pendente" | "em_andamento" | "concluida";

export type MoradorResumo = {
  id: string;
  nome: string;
};

export type TarefaAvulsa = {
  id: string;
  titulo: string;
  descricao: string | null;
  data_limite: string;
  status: TarefaAvulsaStatus;
  criado_por: string | null;
  responsavel_morador_id: string | null;
  concluida_em: string | null;
  criado_em: string;
  atualizado_em: string;
  criador:
    | MoradorResumo
    | MoradorResumo[]
    | null;
  responsavel:
    | MoradorResumo
    | MoradorResumo[]
    | null;
};

export type TarefasAvulsasPageData = {
  abertas: TarefaAvulsa[];
  concluidas: TarefaAvulsa[];
  moradores: MoradorResumo[];
  stats: {
    total: number;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
    vencidas: number;
  };
};

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
} | null;

const STATUS_VALIDOS: TarefaAvulsaStatus[] = [
  "pendente",
  "em_andamento",
  "concluida",
];

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

async function getMoradorAtualId(userId?: string) {
  if (!userId) return null;

  const supabase = await createClient();

  const { data } = await supabase
    .from("moradores")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.id ?? null;
}

function normalizarMorador(
  morador: MoradorResumo | MoradorResumo[] | null
): MoradorResumo | null {
  if (!morador) return null;
  return Array.isArray(morador) ? morador[0] ?? null : morador;
}

function normalizarTarefa(tarefa: TarefaAvulsa): TarefaAvulsa {
  return {
    ...tarefa,
    criador: normalizarMorador(tarefa.criador),
    responsavel: normalizarMorador(tarefa.responsavel),
  };
}

function validarInput(input: {
  titulo: string;
  data_limite: string;
}) {
  const errors: Record<string, string[]> = {};

  if (!input.titulo.trim()) {
    errors.titulo = ["Informe o nome da tarefa."];
  }

  if (!input.data_limite) {
    errors.data_limite = ["Informe a data limite."];
  }

  return errors;
}

function isVencida(tarefa: TarefaAvulsa) {
  if (tarefa.status === "concluida") return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataLimite = new Date(`${tarefa.data_limite}T00:00:00`);
  return dataLimite.getTime() < hoje.getTime();
}

export async function listarTarefasAvulsasPagina(): Promise<TarefasAvulsasPageData> {
  const supabase = await createClient();

  const [{ data: tarefasData, error: tarefasError }, { data: moradoresData, error: moradoresError }] =
    await Promise.all([
      supabase
        .from("tarefas_avulsas")
        .select(`
          id,
          titulo,
          descricao,
          data_limite,
          status,
          criado_por,
          responsavel_morador_id,
          concluida_em,
          criado_em,
          atualizado_em,
          criador:moradores!tarefas_avulsas_criado_por_fkey (
            id,
            nome
          ),
          responsavel:moradores!tarefas_avulsas_responsavel_morador_id_fkey (
            id,
            nome
          )
        `)
        .order("data_limite", { ascending: true })
        .order("criado_em", { ascending: false }),

      supabase
        .from("moradores")
        .select("id, nome")
        .order("nome", { ascending: true }),
    ]);

  if (tarefasError) {
    console.error("Erro ao listar tarefas avulsas:", tarefasError);
  }

  if (moradoresError) {
    console.error("Erro ao listar moradores:", moradoresError);
  }

  const tarefas = ((tarefasData ?? []) as TarefaAvulsa[]).map(normalizarTarefa);
  const moradores = (moradoresData ?? []) as MoradorResumo[];

  const abertas = tarefas.filter((item) => item.status !== "concluida");
  const concluidas = tarefas.filter((item) => item.status === "concluida");

  return {
    abertas,
    concluidas,
    moradores,
    stats: {
      total: tarefas.length,
      pendentes: tarefas.filter((item) => item.status === "pendente").length,
      emAndamento: tarefas.filter((item) => item.status === "em_andamento").length,
      concluidas: concluidas.length,
      vencidas: abertas.filter(isVencida).length,
    },
  };
}

export async function criarTarefaAvulsa(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return {
      success: false,
      message: "Você precisa estar autenticado para criar uma tarefa.",
    };
  }

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const data_limite = String(formData.get("data_limite") ?? "").trim();
  const responsavel_morador_id = String(
    formData.get("responsavel_morador_id") ?? ""
  ).trim();

  const errors = validarInput({
    titulo,
    data_limite,
  });

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Revise os campos do formulário.",
      errors,
    };
  }

  const criado_por = await getMoradorAtualId(user.id);

  const { error } = await supabase.from("tarefas_avulsas").insert({
    titulo,
    descricao: descricao || null,
    data_limite,
    status: "pendente",
    criado_por,
    responsavel_morador_id: responsavel_morador_id || null,
  });

  if (error) {
    console.error("Erro ao criar tarefa avulsa:", error);
    return {
      success: false,
      message: error.message ?? "Não foi possível criar a tarefa.",
    };
  }

  revalidatePath("/tarefas-avulsas");

  return {
    success: true,
    message: "Tarefa criada com sucesso.",
  };
}

export async function atualizarStatusTarefaAvulsa(
  formData: FormData
): Promise<void> {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) return;

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as TarefaAvulsaStatus;

  if (!id || !STATUS_VALIDOS.includes(status)) return;

  const payload: {
    status: TarefaAvulsaStatus;
    concluida_em: string | null;
  } = {
    status,
    concluida_em: status === "concluida" ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from("tarefas_avulsas")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar status da tarefa avulsa:", error);
    return;
  }

  revalidatePath("/tarefas-avulsas");
}

export async function removerTarefaAvulsa(formData: FormData): Promise<void> {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const { error } = await supabase
    .from("tarefas_avulsas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao remover tarefa avulsa:", error);
    return;
  }

  revalidatePath("/tarefas-avulsas");
}