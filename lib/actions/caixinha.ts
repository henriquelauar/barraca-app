"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CaixinhaFormState =
  | {
      error?: string;
      success?: string;
    }
  | null;

export type MoradorCaixinha = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  user_id?: string | null;
  ordem_exibicao: number | null;
};

export type ContaFixaCaixinha = {
  id: string;
  conta_modelo_id: string;
  nome: string;
  valor: number | string;
  ordem: number;
  ativo: boolean;
  mes_referencia: string;
};

type CompraMoradorRel =
  | {
      id: string;
      nome: string;
      ordem_exibicao?: number | null;
    }
  | {
      id: string;
      nome: string;
      ordem_exibicao?: number | null;
    }[]
  | null;

type CompraDivisaoRel =
  | {
      id: string;
      morador_id: string;
      morador: CompraMoradorRel;
    }[]
  | null;

export type CompraCaixinha = {
  id: string;
  nome_compra: string;
  valor: number | string;
  mes_referencia: string;
  quem_pagou_tipo: "morador" | "casa";
  quem_pagou_morador_id: string | null;
  criado_em: string;
  pagador: CompraMoradorRel;
  divisoes: CompraDivisaoRel;
};

const CONTAS_FIXAS_PADRAO: Array<{
  nome: string;
  valor: number;
  ordem: number;
}> = [
  { nome: "Aluguel casa de cima", valor: 2650.0, ordem: 1 },
  { nome: "Aluguel casa de baixo", valor: 3100.0, ordem: 2 },
  { nome: "Água casa de cima", valor: 220.74, ordem: 3 },
  { nome: "Água casa de baixo", valor: 58.44, ordem: 4 },
  { nome: "Luz casa de cima", valor: 412.88, ordem: 5 },
  { nome: "Luz casa de baixo", valor: 268.28, ordem: 6 },
  { nome: "Gás", valor: 110.0, ordem: 7 },
  { nome: "Internet", valor: 104.9, ordem: 8 },
  { nome: "IPTU", valor: 73.0, ordem: 9 },
  { nome: "Ajuda mensal", valor: 275.0, ordem: 10 },
];

function arredondar2(valor: number) {
  return Math.round(valor * 100) / 100;
}

function primeiroDiaDoMes(data = new Date()) {
  return new Date(data.getFullYear(), data.getMonth(), 1).toISOString().slice(0, 10);
}

function mesAnteriorISO(mesISO: string) {
  const [ano, mes] = mesISO.split("-").map(Number);
  const data = new Date(ano, mes - 2, 1);
  return primeiroDiaDoMes(data);
}

function extrairMorador(
  relacao?: CompraMoradorRel
): { id: string; nome: string; ordem_exibicao?: number | null } | null {
  if (!relacao) return null;
  return Array.isArray(relacao) ? relacao[0] ?? null : relacao;
}

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

async function garantirModelosContasFixas() {
  const { supabase } = await getAuthenticatedUser();

  const { data: existentes, error } = await supabase
    .from("caixinha_contas_fixas_modelo")
    .select("nome");

  if (error) {
    console.error("Erro ao buscar modelos de contas fixas:", error);
    return;
  }

  const nomesExistentes = new Set((existentes ?? []).map((item) => item.nome));

  const faltantes = CONTAS_FIXAS_PADRAO.filter(
    (conta) => !nomesExistentes.has(conta.nome)
  );

  if (!faltantes.length) return;

  const { error: insertError } = await supabase
    .from("caixinha_contas_fixas_modelo")
    .insert(
      faltantes.map((conta) => ({
        nome: conta.nome,
        ordem: conta.ordem,
        ativo: true,
      }))
    );

  if (insertError) {
    console.error("Erro ao inserir modelos de contas fixas:", insertError);
  }
}

async function garantirContasFixasDoMes(mesReferencia: string) {
  const { supabase } = await getAuthenticatedUser();

  await garantirModelosContasFixas();

  const { data: modelos, error: modelosError } = await supabase
    .from("caixinha_contas_fixas_modelo")
    .select("id, nome, ordem, ativo")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (modelosError || !modelos) {
    console.error("Erro ao buscar modelos das contas fixas:", modelosError);
    return;
  }

  const { data: existentes, error: existentesError } = await supabase
    .from("caixinha_contas_fixas_mes")
    .select("conta_modelo_id")
    .eq("mes_referencia", mesReferencia);

  if (existentesError) {
    console.error("Erro ao buscar contas fixas do mês:", existentesError);
    return;
  }

  const idsExistentes = new Set((existentes ?? []).map((item) => item.conta_modelo_id));
  const faltantes = modelos.filter((modelo) => !idsExistentes.has(modelo.id));

  if (!faltantes.length) return;

  const mesAnterior = mesAnteriorISO(mesReferencia);

  const { data: contasMesAnterior } = await supabase
    .from("caixinha_contas_fixas_mes")
    .select("conta_modelo_id, valor")
    .eq("mes_referencia", mesAnterior);

  const mapaMesAnterior = new Map(
    (contasMesAnterior ?? []).map((item) => [item.conta_modelo_id, Number(item.valor)])
  );

  const mapaPadrao = new Map(CONTAS_FIXAS_PADRAO.map((item) => [item.nome, item.valor]));

  const payload = faltantes.map((modelo) => ({
    conta_modelo_id: modelo.id,
    mes_referencia: mesReferencia,
    valor: mapaMesAnterior.get(modelo.id) ?? mapaPadrao.get(modelo.nome) ?? 0,
  }));

  const { error: insertError } = await supabase
    .from("caixinha_contas_fixas_mes")
    .insert(payload);

  if (insertError) {
    console.error("Erro ao criar fotografia das contas fixas do mês:", insertError);
  }
}

export async function listarMoradoresAtivosCaixinha(): Promise<MoradorCaixinha[]> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("moradores")
    .select("id, nome, email, ativo, user_id, ordem_exibicao")
    .eq("ativo", true)
    .order("ordem_exibicao", { ascending: true })

  if (error) {
    console.error("Erro ao listar moradores da caixinha:", error);
    return [];
  }

  return (data ?? []) as MoradorCaixinha[];
}

export async function listarContasFixasCaixinha(
  mesReferencia = primeiroDiaDoMes()
): Promise<ContaFixaCaixinha[]> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) return [];

  await garantirContasFixasDoMes(mesReferencia);

  const { data, error } = await supabase
    .from("caixinha_contas_fixas_mes")
    .select(`
      id,
      conta_modelo_id,
      valor,
      mes_referencia,
      modelo:caixinha_contas_fixas_modelo (
        id,
        nome,
        ordem,
        ativo
      )
    `)
    .eq("mes_referencia", mesReferencia)
    .order("criado_em", { ascending: true });

  if (error) {
    console.error("Erro ao listar contas fixas mensais:", error);
    return [];
  }

  return (data ?? []).map((item: any) => ({
    id: item.id,
    conta_modelo_id: item.conta_modelo_id,
    nome: Array.isArray(item.modelo) ? item.modelo[0]?.nome ?? "" : item.modelo?.nome ?? "",
    ordem: Array.isArray(item.modelo) ? item.modelo[0]?.ordem ?? 0 : item.modelo?.ordem ?? 0,
    ativo: Array.isArray(item.modelo) ? item.modelo[0]?.ativo ?? true : item.modelo?.ativo ?? true,
    valor: item.valor,
    mes_referencia: item.mes_referencia,
  })).sort((a, b) => a.ordem - b.ordem);
}

export async function listarComprasCaixinha(
  mesReferencia = primeiroDiaDoMes()
): Promise<CompraCaixinha[]> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("caixinha_compras")
    .select(`
      id,
      nome_compra,
      valor,
      mes_referencia,
      quem_pagou_tipo,
      quem_pagou_morador_id,
      criado_em,
      pagador:moradores!caixinha_compras_quem_pagou_morador_id_fkey (
        id,
        nome
      ),
      divisoes:caixinha_compra_divisoes (
        id,
        morador_id,
        morador:moradores (
          id,
          nome,
          ordem_exibicao
        )
      )
    `)
    .eq("mes_referencia", mesReferencia)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao listar compras da caixinha:", error);
    return [];
  }

  return (data ?? []) as CompraCaixinha[];
}

export async function listarComprasCaixinhaMesAtual(): Promise<CompraCaixinha[]> {
  return listarComprasCaixinha(primeiroDiaDoMes());
}

export async function atualizarContasFixasCaixinha(
  _prevState: CaixinhaFormState,
  formData: FormData
): Promise<CaixinhaFormState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { error: "Você precisa estar autenticado para editar as contas fixas." };
  }

  const mesReferencia = String(formData.get("mes_referencia") || primeiroDiaDoMes());
  const contas = await listarContasFixasCaixinha(mesReferencia);

  if (!contas.length) {
    return { error: "Nenhuma conta fixa foi encontrada para este mês." };
  }

  for (const conta of contas) {
    const raw = String(formData.get(`valor_${conta.id}`) || "").trim();
    const valor = Number(raw.replace(",", "."));

    if (!Number.isFinite(valor) || valor < 0) {
      return { error: `Valor inválido para "${conta.nome}".` };
    }

    const { error } = await supabase
      .from("caixinha_contas_fixas_mes")
      .update({ valor: arredondar2(valor) })
      .eq("id", conta.id)
      .eq("mes_referencia", mesReferencia);

    if (error) {
      console.error("Erro ao atualizar conta fixa mensal:", error);
      return { error: `Não foi possível atualizar "${conta.nome}".` };
    }
  }

  revalidatePath("/caixinha");

  return { success: "Contas fixas do mês atualizadas com sucesso." };
}

export async function adicionarCompraCaixinha(
  _prevState: CaixinhaFormState,
  formData: FormData
): Promise<CaixinhaFormState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { error: "Você precisa estar autenticado para lançar uma compra." };
  }

  const nomeCompra = String(formData.get("nome_compra") || "").trim();
  const valor = Number(String(formData.get("valor") || "").replace(",", "."));
  const quemPagouTipo = String(formData.get("quem_pagou_tipo") || "") as
    | "morador"
    | "casa";
  const quemPagouMoradorIdRaw = String(formData.get("quem_pagou_morador_id") || "").trim();
  const quemPagouMoradorId = quemPagouMoradorIdRaw || null;
  const dividirCom = formData.getAll("dividir_com").map((item) => String(item));
  const mesReferencia = String(formData.get("mes_referencia") || primeiroDiaDoMes());

  if (!nomeCompra) {
    return { error: "Informe o nome da compra." };
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    return { error: "Informe um valor válido para a compra." };
  }

  if (quemPagouTipo !== "morador" && quemPagouTipo !== "casa") {
    return { error: "Selecione quem pagou." };
  }

  if (quemPagouTipo === "morador" && !quemPagouMoradorId) {
    return { error: "Selecione qual morador pagou a compra." };
  }

  if (dividirCom.length === 0) {
    return { error: "Selecione pelo menos um morador para dividir o gasto." };
  }

  const { data: compra, error: compraError } = await supabase
    .from("caixinha_compras")
    .insert({
      nome_compra: nomeCompra,
      valor: arredondar2(valor),
      mes_referencia: mesReferencia,
      quem_pagou_tipo: quemPagouTipo,
      quem_pagou_morador_id: quemPagouTipo === "morador" ? quemPagouMoradorId : null,
      criado_por: user.id,
    })
    .select("id")
    .single();

  if (compraError || !compra) {
    console.error("Erro ao criar compra da caixinha:", compraError);
    return { error: "Não foi possível salvar a compra." };
  }

  const payloadDivisoes = dividirCom.map((moradorId) => ({
    compra_id: compra.id,
    morador_id: moradorId,
  }));

  const { error: divisaoError } = await supabase
    .from("caixinha_compra_divisoes")
    .insert(payloadDivisoes);

  if (divisaoError) {
    console.error("Erro ao salvar divisões da compra:", divisaoError);
    return { error: "A compra foi criada, mas houve erro ao salvar a divisão." };
  }

  revalidatePath("/caixinha");

  return { success: "Compra adicionada com sucesso." };
}

export async function removerCompraCaixinha(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user || !id) return;

  const { error } = await supabase
    .from("caixinha_compras")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao remover compra da caixinha:", error);
    return;
  }

  revalidatePath("/caixinha");
}