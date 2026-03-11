/**
 * Lógica de divisão de gastos — Etapa 2
 * Calcula quanto cada beneficiário deve ao pagador.
 * beneficiarioIds = pessoas que se beneficiaram (excluir o pagador)
 * incluirPagador = se true, divide por (beneficiarios + 1)
 */

export interface DivisaoResultado {
  moradorId: string;
  valorDevido: number;
}

export function calcularDivisao(
  valorTotal: number,
  beneficiarioIds: string[],
  incluirPagador: boolean,
  pagadorId?: string
): DivisaoResultado[] {
  // Exclui o pagador dos devedores (não deve a si mesmo)
  const devedores = pagadorId
    ? beneficiarioIds.filter((id) => id !== pagadorId)
    : beneficiarioIds;

  const totalPessoas = incluirPagador ? devedores.length + 1 : devedores.length;

  if (totalPessoas === 0) return [];

  const valorPorPessoa = Math.round((valorTotal / totalPessoas) * 100) / 100;

  return devedores.map((id) => ({
    moradorId: id,
    valorDevido: valorPorPessoa,
  }));
}
