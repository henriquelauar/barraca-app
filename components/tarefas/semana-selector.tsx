"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  inicioSemana: string;
  anteriorSemana: string;
  proximaSemana: string;
  semanaAtualInicio: string;
};

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(`${data}T00:00:00`));
}

function formatarPeriodoSemana(inicio: string) {
  const base = new Date(`${inicio}T00:00:00`);
  const fim = new Date(base);
  fim.setDate(base.getDate() + 6);

  return `${formatarData(inicio)} a ${new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(fim)}`;
}

export function SemanaSelector({
  inicioSemana,
  anteriorSemana,
  proximaSemana,
  semanaAtualInicio,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function irParaSemana(semana: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("semana", semana);
    router.push(`/tarefas?${params.toString()}`);
  }

  function irParaSemanaAtual() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("semana", semanaAtualInicio);
    router.push(`/tarefas?${params.toString()}`);
  }

  const ehSemanaAtual = inicioSemana === semanaAtualInicio;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => irParaSemana(anteriorSemana)}
      >
        ← Semana anterior
      </Button>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
        {formatarPeriodoSemana(inicioSemana)}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => irParaSemana(proximaSemana)}
      >
        Próxima semana →
      </Button>

      {!ehSemanaAtual ? (
        <Button type="button" onClick={irParaSemanaAtual}>
          Voltar para a atual
        </Button>
      ) : null}
    </div>
  );
}