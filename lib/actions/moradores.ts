"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MoradorFormState =
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

export async function listarMoradores() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("moradores")
    .select("id, user_id, nome, email, ativo, criado_em")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao listar moradores:", error);
    return [];
  }

  return data ?? [];
}

export async function adicionarMorador(
  _prevState: MoradorFormState,
  formData: FormData
): Promise<MoradorFormState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!nome || !email) {
    return { error: "Nome e e-mail são obrigatórios." };
  }

  const { error } = await supabase.from("moradores").insert({
    nome,
    email,
    ativo: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um morador com este e-mail." };
    }

    return { error: error.message };
  }

  revalidatePath("/moradores");
  return { success: "Morador adicionado com sucesso." };
}

export async function removerMorador(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const { data: morador, error: buscarError } = await supabase
    .from("moradores")
    .select("id, user_id, nome")
    .eq("id", id)
    .single();

  if (buscarError || !morador) {
    return { error: "Morador não encontrado." };
  }

  if (morador.user_id === user.id) {
    return { error: "Você não pode remover a si mesmo." };
  }

  const { error } = await supabase.from("moradores").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/moradores");
  return { success: "Morador removido com sucesso." };
}