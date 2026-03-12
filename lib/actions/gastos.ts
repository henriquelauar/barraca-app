"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type GastoFormState =
  | {
      error?: string;
      success?: string;
    }
  | null;

type MoradorResumo = {
  morador_id: string;
  nome: string;
  total_pago: number;
  total_devido: number;
  saldo: number;
};

type TransferenciaResumo = {
  de_morador_id: string;
  de_nome: string;
  para_morador_id: string;
  para_nome: string;
  valor: number;
};

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

export type PagamentoFormState =
  | {
      error?: string;
      success?: string;
    }
  | null;

export async function listarPagamentos() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("pagamentos")
    .select(`
      id,
      valor,
      data_pagamento,
      observacao,
      de_morador:moradores!pagamentos_de_morador_id_fkey (
        id,
        nome
      ),
      para_morador:moradores!pagamentos_para_morador_id_fkey (
        id,
        nome
      )
    `)
    .order("data_pagamento", { ascending: false })
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao listar pagamentos:", error);
    return [];
  }

  return data ?? [];
}

export async function registrarPagamento(
  _prevState: PagamentoFormState,
  formData: FormData
): Promise<PagamentoFormState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const deMoradorId = String(formData.get("de_morador_id") || "").trim();
  const paraMoradorId = String(formData.get("para_morador_id") || "").trim();
  const valorRaw = String(formData.get("valor") || "").trim().replace(",", ".");
  const dataPagamento = String(formData.get("data_pagamento") || "").trim();
  const observacao = String(formData.get("observacao") || "").trim();

  if (!deMoradorId || !paraMoradorId || !valorRaw || !dataPagamento) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  if (deMoradorId === paraMoradorId) {
    return { error: "O pagador e o recebedor não podem ser a mesma pessoa." };
  }

  const valor = Number(valorRaw);

  if (Number.isNaN(valor) || valor <= 0) {
    return { error: "Informe um valor válido maior que zero." };
  }

  const { error } = await supabase.from("pagamentos").insert({
    de_morador_id: deMoradorId,
    para_morador_id: paraMoradorId,
    valor,
    data_pagamento: dataPagamento,
    observacao: observacao || null,
    criado_por: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/gastos");
  return { success: "Pagamento registrado com sucesso." };
}

export async function removerPagamento(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const { error } = await supabase.from("pagamentos").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/gastos");
  return { success: "Pagamento removido com sucesso." };
}

function dividirValorIgualmente(valorTotal: number, quantidade: number) {
  const valorEmCentavos = Math.round(valorTotal * 100);
  const base = Math.floor(valorEmCentavos / quantidade);
  const resto = valorEmCentavos % quantidade;

  return Array.from({ length: quantidade }, (_, index) => {
    const centavos = base + (index < resto ? 1 : 0);
    return centavos / 100;
  });
}

function arredondar2(valor: number) {
  return Math.round(valor * 100) / 100;
}

export async function listarMoradoresAtivosParaGastos() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("moradores")
    .select("id, nome, email, ativo")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao listar moradores:", error);
    return [];
  }

  return data ?? [];
}

export async function listarGastos() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("gastos")
    .select(`
      id,
      nome,
      descricao,
      valor_total,
      categoria,
      data_gasto,
      criado_em,
      pagador:moradores!gastos_pagador_morador_id_fkey (
        id,
        nome
      ),
      destinos:gasto_destinos (
        id,
        tipo_destino,
        morador_id,
        morador:moradores (
          id,
          nome
        )
      ),
      divisoes:gasto_divisoes (
        id,
        valor_devido,
        valor_pago,
        morador:moradores (
          id,
          nome
        )
      )
    `)
    .order("data_gasto", { ascending: false })
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao listar gastos:", error);
    return [];
  }

  return data ?? [];
}

export async function adicionarGasto(
  _prevState: GastoFormState,
  formData: FormData
): Promise<GastoFormState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const nome = String(formData.get("nome") || "").trim();
  const descricao = String(formData.get("descricao") || "").trim();
  const valorRaw = String(formData.get("valor_total") || "")
    .trim()
    .replace(",", ".");
  const categoria = String(formData.get("categoria") || "").trim();
  const dataGasto = String(formData.get("data_gasto") || "").trim();
  const pagadorMoradorId = String(formData.get("pagador_morador_id") || "").trim();
  const tipoDestino = String(formData.get("tipo_destino") || "").trim();

  const moradoresSelecionados = formData
    .getAll("destino_moradores")
    .map((value) => String(value));

  if (!nome || !valorRaw || !dataGasto || !pagadorMoradorId || !tipoDestino) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const valorTotal = Number(valorRaw);

  if (Number.isNaN(valorTotal) || valorTotal <= 0) {
    return { error: "Informe um valor válido maior que zero." };
  }

  const { data: moradoresAtivos, error: moradoresError } = await supabase
    .from("moradores")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (moradoresError) {
    return { error: "Erro ao carregar moradores." };
  }

  const todosMoradores = moradoresAtivos ?? [];

  let moradoresDestino: { id: string; nome: string }[] = [];

  if (tipoDestino === "casa") {
    moradoresDestino = todosMoradores;
  } else if (tipoDestino === "moradores") {
    moradoresDestino = todosMoradores.filter((morador) =>
      moradoresSelecionados.includes(morador.id)
    );
  } else {
    return { error: "Tipo de destino inválido." };
  }

  if (moradoresDestino.length === 0) {
    return { error: "Selecione ao menos um destino para o gasto." };
  }

  const { data: gasto, error: gastoError } = await supabase
    .from("gastos")
    .insert({
      nome,
      descricao: descricao || null,
      valor_total: valorTotal,
      categoria: categoria || null,
      data_gasto: dataGasto,
      pagador_morador_id: pagadorMoradorId,
      criado_por: user.id,
    })
    .select("id")
    .single();

  if (gastoError || !gasto) {
    return { error: gastoError?.message || "Erro ao criar gasto." };
  }

  if (tipoDestino === "casa") {
    const { error: destinoError } = await supabase.from("gasto_destinos").insert({
      gasto_id: gasto.id,
      tipo_destino: "casa",
      morador_id: null,
    });

    if (destinoError) {
      return { error: destinoError.message };
    }
  } else {
    const destinos = moradoresDestino.map((morador) => ({
      gasto_id: gasto.id,
      tipo_destino: "morador" as const,
      morador_id: morador.id,
    }));

    const { error: destinoError } = await supabase
      .from("gasto_destinos")
      .insert(destinos);

    if (destinoError) {
      return { error: destinoError.message };
    }
  }

  const valoresDivididos = dividirValorIgualmente(
    valorTotal,
    moradoresDestino.length
  );

  const divisoes = moradoresDestino.map((morador, index) => ({
    gasto_id: gasto.id,
    morador_id: morador.id,
    valor_devido: valoresDivididos[index],
    valor_pago: 0,
  }));

  const { error: divisaoError } = await supabase
    .from("gasto_divisoes")
    .insert(divisoes);

  if (divisaoError) {
    return { error: divisaoError.message };
  }

  revalidatePath("/gastos");
  return { success: "Gasto adicionado com sucesso." };
}

export async function removerGasto(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const { error } = await supabase.from("gastos").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/gastos");
  return { success: "Gasto removido com sucesso." };
}

export async function listarResumoSaldos(): Promise<MoradorResumo[]> {
    const { supabase, user } = await getAuthenticatedUser();
  
    if (!user) return [];
  
    const { data: moradores, error: moradoresError } = await supabase
      .from("moradores")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome", { ascending: true });
  
    if (moradoresError || !moradores) {
      console.error("Erro ao listar moradores para resumo:", moradoresError);
      return [];
    }
  
    const mapa = new Map<string, MoradorResumo>();
  
    for (const morador of moradores) {
      mapa.set(morador.id, {
        morador_id: morador.id,
        nome: morador.nome,
        total_pago: 0,
        total_devido: 0,
        saldo: 0,
      });
    }
  
    const { data: gastos, error: gastosError } = await supabase
      .from("gastos")
      .select(`
        id,
        valor_total,
        pagador:moradores!gastos_pagador_morador_id_fkey (
          id,
          nome
        ),
        divisoes:gasto_divisoes (
          id,
          valor_devido,
          morador:moradores (
            id,
            nome
          )
        )
      `);
  
    if (gastosError || !gastos) {
      console.error("Erro ao listar gastos para resumo:", gastosError);
    } else {
      for (const gasto of gastos) {
        const pagador = Array.isArray(gasto.pagador) ? gasto.pagador[0] : gasto.pagador;
  
        if (pagador?.id && mapa.has(pagador.id)) {
          const item = mapa.get(pagador.id)!;
          item.total_pago = arredondar2(item.total_pago + Number(gasto.valor_total));
        }
  
        for (const divisao of gasto.divisoes ?? []) {
          const morador = Array.isArray(divisao.morador)
            ? divisao.morador[0]
            : divisao.morador;
  
          if (morador?.id && mapa.has(morador.id)) {
            const item = mapa.get(morador.id)!;
            item.total_devido = arredondar2(
              item.total_devido + Number(divisao.valor_devido)
            );
          }
        }
      }
    }
  
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from("pagamentos")
      .select("de_morador_id, para_morador_id, valor");
  
    if (pagamentosError) {
      console.error("Erro ao listar pagamentos para resumo:", pagamentosError);
    } else {
      for (const pagamento of pagamentos ?? []) {
        if (mapa.has(pagamento.de_morador_id)) {
          const devedor = mapa.get(pagamento.de_morador_id)!;
          devedor.saldo = arredondar2(devedor.saldo + Number(pagamento.valor));
        }
  
        if (mapa.has(pagamento.para_morador_id)) {
          const credor = mapa.get(pagamento.para_morador_id)!;
          credor.saldo = arredondar2(credor.saldo - Number(pagamento.valor));
        }
      }
    }
  
    const resumo = Array.from(mapa.values()).map((item) => ({
      ...item,
      saldo: arredondar2(item.total_pago - item.total_devido + item.saldo),
    }));
  
    resumo.sort((a, b) => b.saldo - a.saldo);
  
    return resumo;
  }

export async function listarTransferenciasResumo(): Promise<TransferenciaResumo[]> {
  const resumo = await listarResumoSaldos();

  const credores = resumo
    .filter((item) => item.saldo > 0.009)
    .map((item) => ({
      morador_id: item.morador_id,
      nome: item.nome,
      valor: arredondar2(item.saldo),
    }));

  const devedores = resumo
    .filter((item) => item.saldo < -0.009)
    .map((item) => ({
      morador_id: item.morador_id,
      nome: item.nome,
      valor: arredondar2(Math.abs(item.saldo)),
    }));

  const transferencias: TransferenciaResumo[] = [];

  let i = 0;
  let j = 0;

  while (i < devedores.length && j < credores.length) {
    const devedor = devedores[i];
    const credor = credores[j];
    const valor = arredondar2(Math.min(devedor.valor, credor.valor));

    if (valor > 0) {
      transferencias.push({
        de_morador_id: devedor.morador_id,
        de_nome: devedor.nome,
        para_morador_id: credor.morador_id,
        para_nome: credor.nome,
        valor,
      });
    }

    devedor.valor = arredondar2(devedor.valor - valor);
    credor.valor = arredondar2(credor.valor - valor);

    if (devedor.valor <= 0.009) i++;
    if (credor.valor <= 0.009) j++;
  }

  return transferencias;
}