export function isHoje(dateStr: string) {
  const hoje = new Date();
  const data = new Date(dateStr);

  return (
    data.getFullYear() === hoje.getFullYear() &&
    data.getMonth() === hoje.getMonth() &&
    data.getDate() === hoje.getDate()
  );
}

export function getResumoPresencas(
  presencas: { status: "pendente" | "vai" | "nao_vai" }[]
) {
  return presencas.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { pendente: 0, vai: 0, nao_vai: 0 }
  );
}