import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddMoradorForm } from "@/components/moradores/add-morador-form";
import { listarMoradores, removerMorador } from "@/lib/actions/moradores";

async function removerMoradorAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (id) await removerMorador(id);
}

export default async function MoradoresPage() {
  const moradores = await listarMoradores();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Moradores</h1>
        <p className="mt-1 text-slate-600">
          Gerencie os moradores da sua república
        </p>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Adicionar morador
        </h2>
        <AddMoradorForm />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Lista de moradores ({moradores.length})
        </h2>
        {moradores.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            Nenhum morador cadastrado. Adicione o primeiro acima.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {moradores.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between py-4 first:pt-0"
              >
                <div>
                  <p className="font-medium text-slate-900">{m.nome}</p>
                  <p className="text-sm text-slate-500">{m.email}</p>
                </div>
                <form action={removerMoradorAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Remover
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
