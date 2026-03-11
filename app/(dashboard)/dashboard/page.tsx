import { getRepublicaAtual } from "@/lib/db/queries/republica";

export default async function DashboardPage() {
  const republica = await getRepublicaAtual();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      {republica ? (
        <p className="mt-2 text-slate-600">
          Bem-vindo, {republica.moradorNome}! Você está em{" "}
          <span className="font-medium text-slate-900">{republica.nome}</span>.
        </p>
      ) : (
        <p className="mt-2 text-slate-600">Carregando...</p>
      )}
    </div>
  );
}
