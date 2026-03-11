import { createClient } from "@/lib/supabase/server";

export async function getRepublicaAtual() {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user?.id) return null;

  const { data: morador } = await supabase
    .from("moradores")
    .select("republica_id, nome")
    .eq("user_id", user.user.id)
    .single();

  if (!morador?.republica_id) return null;

  const { data: republica } = await supabase
    .from("republicas")
    .select("id, nome")
    .eq("id", morador.republica_id)
    .single();

  return republica
    ? { ...republica, moradorNome: morador.nome }
    : null;
}
