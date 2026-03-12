"use client";

import { useFormState, useFormStatus } from "react-dom";
import { marcarTarefaStatus } from "@/lib/actions/tarefas";
import { Button } from "@/components/ui/button";

function SubmitButton({
  label,
  value,
}: {
  label: string;
  value: "concluida" | "pendente" | "nao_feita";
}) {
  const { pending } = useFormStatus();

  const variant =
    value === "concluida"
      ? "default"
      : value === "nao_feita"
      ? "destructive"
      : "outline";

  return (
    <Button type="submit" disabled={pending} size="sm" variant={variant}>
      {pending ? "Salvando..." : label}
    </Button>
  );
}

export function TarefaStatusForm({
  atribuicaoId,
  dataReferencia,
}: {
  atribuicaoId: string;
  dataReferencia: string;
}) {
  const [, formAction] = useFormState(marcarTarefaStatus, null);

  return (
    <div className="flex flex-wrap gap-2">
      <form action={formAction}>
        <input type="hidden" name="atribuicao_id" value={atribuicaoId} />
        <input type="hidden" name="data_referencia" value={dataReferencia} />
        <input type="hidden" name="status" value="concluida" />
        <SubmitButton label="Concluir" value="concluida" />
      </form>

      <form action={formAction}>
        <input type="hidden" name="atribuicao_id" value={atribuicaoId} />
        <input type="hidden" name="data_referencia" value={dataReferencia} />
        <input type="hidden" name="status" value="pendente" />
        <SubmitButton label="Pendente" value="pendente" />
      </form>

      <form action={formAction}>
        <input type="hidden" name="atribuicao_id" value={atribuicaoId} />
        <input type="hidden" name="data_referencia" value={dataReferencia} />
        <input type="hidden" name="status" value="nao_feita" />
        <SubmitButton label="Não feita" value="nao_feita" />
      </form>
    </div>
  );
}