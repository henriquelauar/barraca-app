import type {
  CompraCaixinha,
  ContaFixaCaixinha,
  MoradorCaixinha,
} from "@/lib/actions/caixinha";

function arredondar2(valor: number) {
  return Math.round(valor * 100) / 100;
}

function extrairMorador(
  relacao?:
    | { id: string; nome: string }
    | { id: string; nome: string }[]
    | null
) {
  if (!relacao) return null;
  return Array.isArray(relacao) ? relacao[0] ?? null : relacao;
}

export function calcularResumoCaixinha(params: {
  moradores: MoradorCaixinha[];
  contasFixas: ContaFixaCaixinha[];
  compras: CompraCaixinha[];
}) {
  const { moradores, contasFixas, compras } = params;

  const moradoresAtivos = moradores.filter((morador) => morador.ativo);

  const resumoMap = new Map<
    string,
    {
      morador_id: string;
      nome: string;
      ordem_exibicao: number;
      valor_base: number;
      reajuste: number;
      valor_final: number;
    }
  >();

  for (const morador of moradoresAtivos) {
    resumoMap.set(morador.id, {
      morador_id: morador.id,
      nome: morador.nome,
      ordem_exibicao: morador.ordem_exibicao ?? 999,
      valor_base: 0,
      reajuste: 0,
      valor_final: 0,
    });
  }

  const totalFixo = contasFixas.reduce((acc, conta) => acc + Number(conta.valor), 0);

  if (moradoresAtivos.length > 0) {
    const cotaFixa = totalFixo / moradoresAtivos.length;

    for (const morador of moradoresAtivos) {
      const item = resumoMap.get(morador.id);
      if (item) {
        item.valor_base += cotaFixa;
      }
    }
  }

  let totalVariavel = 0;

  for (const compra of compras) {
    const valorCompra = Number(compra.valor);
    totalVariavel += valorCompra;

    const divisoes = Array.isArray(compra.divisoes) ? compra.divisoes : [];
    const participantes = divisoes
      .map((item) => extrairMorador(item.morador))
      .filter(
        (morador): morador is { id: string; nome: string } => Boolean(morador?.id)
      );

    if (participantes.length > 0) {
      const cota = valorCompra / participantes.length;

      for (const participante of participantes) {
        const item = resumoMap.get(participante.id);
        if (item) {
          item.valor_base += cota;
        }
      }
    }

    if (compra.quem_pagou_tipo === "morador" && compra.quem_pagou_morador_id) {
      const item = resumoMap.get(compra.quem_pagou_morador_id);
      if (item) {
        item.reajuste += valorCompra;
      }
    }
  }

  const resumo = Array.from(resumoMap.values())
    .map((item) => ({
      ...item,
      valor_base: arredondar2(item.valor_base),
      reajuste: arredondar2(item.reajuste),
      valor_final: arredondar2(item.valor_base - item.reajuste),
    }))
    .sort((a, b) => {
      if (a.ordem_exibicao !== b.ordem_exibicao) {
        return a.ordem_exibicao - b.ordem_exibicao;
      }

      return a.nome.localeCompare(b.nome, "pt-BR");
    });

  return {
    total_fixo: arredondar2(totalFixo),
    total_variavel: arredondar2(totalVariavel),
    total_geral: arredondar2(totalFixo + totalVariavel),
    resumo,
  };
}