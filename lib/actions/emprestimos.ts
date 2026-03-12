"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EmprestimoTipo = "emprestei" | "peguei_emprestado";
export type EmprestimoStatus = "em_aberto" | "devolvido";

export type Emprestimo = {
  id: string;
  nome_item: string;
  tipo: EmprestimoTipo;
  data_emprestimo: string;
  status: EmprestimoStatus;
  pessoa_nome: string;
  pessoa_republica: string | null;
  observacao: string | null;
  data_devolucao: string | null;
  criado_por: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type EmprestimosPageData = {
  emAberto: Emprestimo[];
  devolvidos: Emprestimo[];
  stats: {
    total: number;
    emAberto: number;
    devolvidos: number;
    emprestei: number;
    pegueiEmprestado: number;
  };
};

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
} | null;

const TIPOS_VALIDOS: EmprestimoTipo[] = ["emprestei", "peguei_emprestado"];

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

function validarInput(input: {
  nome_item: string;
  tipo: string;
  data_emprestimo: string;
  pessoa_nome: string;
}) {
  const errors: Record<string, string[]> = {};

  if (!input.nome_item.trim()) {
    errors.nome_item = ["Informe o nome do item."];
  }

  if (!TIPOS_VALIDOS.includes(input.tipo as EmprestimoTipo)) {
    errors.tipo = ["Selecione um tipo válido."];
  }

  if (!input.data_emprestimo) {
    errors.data_emprestimo = ["Informe a data do empréstimo."];
  }

  if (!input.pessoa_nome.trim()) {
    errors.pessoa_nome = ["Informe o nome da pessoa."];
  }

  return errors;
}

export async function listarEmprestimosPagina(): Promise<EmprestimosPageData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("emprestimos")
    .select("*")
    .order("data_emprestimo", { ascending: false })
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao listar empréstimos:", error);

    return {
      emAberto: [],
      devolvidos: [],
      stats: {
        total: 0,
        emAberto: 0,
        devolvidos: 0,
        emprestei: 0,
        pegueiEmprestado: 0,
      },
    };
  }

  const emprestimos = (data ?? []) as Emprestimo[];

  const emAberto = emprestimos.filter((item) => item.status === "em_aberto");
  const devolvidos = emprestimos.filter((item) => item.status === "devolvido");

  return {
    emAberto,
    devolvidos,
    stats: {
      total: emprestimos.length,
      emAberto: emAberto.length,
      devolvidos: devolvidos.length,
      emprestei: emprestimos.filter((item) => item.tipo === "emprestei").length,
      pegueiEmprestado: emprestimos.filter(
        (item) => item.tipo === "peguei_emprestado"
      ).length,
    },
  };
}

export async function criarEmprestimo(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return {
      success: false,
      message: "Você precisa estar autenticado para registrar um empréstimo.",
    };
  }

  const nome_item = String(formData.get("nome_item") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim();
  const data_emprestimo = String(formData.get("data_emprestimo") ?? "").trim();
  const pessoa_nome = String(formData.get("pessoa_nome") ?? "").trim();
  const pessoa_republica = String(formData.get("pessoa_republica") ?? "").trim();
  const observacao = String(formData.get("observacao") ?? "").trim();

  const errors = validarInput({
    nome_item,
    tipo,
    data_emprestimo,
    pessoa_nome,
  });

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Revise os campos do formulário.",
      errors,
    };
  }

  const criado_por = await getMoradorAtualId(user.id);

  const { error } = await supabase.from("emprestimos").insert({
    nome_item,
    tipo,
    data_emprestimo,
    status: "em_aberto",
    pessoa_nome,
    pessoa_republica: pessoa_republica || null,
    observacao: observacao || null,
    criado_por,
  });

  if (error) {
    console.error("Erro ao criar empréstimo:", error);

    return {
      success: false,
      message: error.message ?? "Não foi possível registrar o empréstimo.",
    };
  }

  revalidatePath("/emprestimos");

  return {
    success: true,
    message: "Empréstimo registrado com sucesso.",
  };
}

export async function marcarEmprestimoComoDevolvido(
  formData: FormData
): Promise<void> {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const hoje = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("emprestimos")
    .update({
      status: "devolvido",
      data_devolucao: hoje,
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao marcar empréstimo como devolvido:", error);
    return;
  }

  revalidatePath("/emprestimos");
}

export async function reabrirEmprestimo(formData: FormData): Promise<void> {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const { error } = await supabase
    .from("emprestimos")
    .update({
      status: "em_aberto",
      data_devolucao: null,
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao reabrir empréstimo:", error);
    return;
  }

  revalidatePath("/emprestimos");
}

export async function removerEmprestimo(formData: FormData): Promise<void> {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const { error } = await supabase
    .from("emprestimos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao remover empréstimo:", error);
    return;
  }

  revalidatePath("/emprestimos");
}