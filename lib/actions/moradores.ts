"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function listarMoradores() {
  const supabase = await createClient();

  // Busca a república do usuário logado
  const { data: moradorAtual } = await supabase
    .from("moradores")
    .select("republica_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!moradorAtual?.republica_id) {
    return [];
  }

  const { data, error } = await supabase
    .from("moradores")
    .select("*")
    .eq("republica_id", moradorAtual.republica_id)
    .order("nome");

  if (error) {
    console.error("Erro ao listar moradores:", error);
    return [];
  }

  return data ?? [];
}

export async function adicionarMorador(formData: FormData) {
  const supabase = await createClient();

  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;

  if (!nome?.trim() || !email?.trim()) {
    return { error: "Nome e e-mail são obrigatórios" };
  }

  const { data: moradorAtual } = await supabase
    .from("moradores")
    .select("republica_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!moradorAtual?.republica_id) {
    return { error: "Você precisa estar em uma república" };
  }

  const { error } = await supabase.from("moradores").insert({
    republica_id: moradorAtual.republica_id,
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um morador com este e-mail na república" };
    }
    return { error: error.message };
  }

  revalidatePath("/moradores");
  return { success: true };
}

export async function removerMorador(id: string) {
  const supabase = await createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const { data: morador } = await supabase
    .from("moradores")
    .select("republica_id, user_id")
    .eq("id", id)
    .single();

  if (!morador) return { error: "Morador não encontrado" };

  // Não pode remover a si mesmo
  if (morador.user_id === userId) {
    return { error: "Você não pode remover a si mesmo" };
  }

  const { error } = await supabase.from("moradores").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/moradores");
  return { success: true };
}
