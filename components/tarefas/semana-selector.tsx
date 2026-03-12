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
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Semana em exibição
        </p>
        <p className="text-sm font-semibold text-white sm:text-base">
          {formatarPeriodoSemana(inicioSemana)}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={() => irParaSemana(anteriorSemana)}>
          ← Semana anterior
        </Button>

        {!ehSemanaAtual ? (
          <Button variant="ghost" onClick={irParaSemanaAtual}>
            Semana atual
          </Button>
        ) : null}

        <Button variant="outline" onClick={() => irParaSemana(proximaSemana)}>
          Próxima semana →
        </Button>
      </div>
    </div>
  );
}