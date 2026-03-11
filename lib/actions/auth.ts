"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nome = formData.get("nome") as string;
  const nomeRepublica = formData.get("nome_republica") as string;

  if (!email || !password || !nome) {
    return { error: "E-mail, senha e nome são obrigatórios" };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Erro ao criar conta" };
  }

  // Sempre criar república e vincular morador (nome da república ou padrão)
  const nomeRepublicaFinal = nomeRepublica?.trim() || `República de ${nome.trim()}`;
  const { data: republica, error: repError } = await supabase
    .from("republicas")
    .insert({ nome: nomeRepublicaFinal })
    .select("id")
    .single();

  if (!repError && republica) {
    await supabase.from("moradores").insert({
      user_id: authData.user.id,
      republica_id: republica.id,
      nome: nome.trim(),
      email,
    });
  }

  redirect("/login?message=Conta criada! Verifique seu e-mail para confirmar.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
