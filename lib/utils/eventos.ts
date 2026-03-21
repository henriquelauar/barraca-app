import type { EventoTipo } from "@/lib/actions/eventos";
export type EventoCategoria = "eventos" | "compromissos";


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

export function getEventoCategoria(tipo: string): EventoCategoria {
  if (
    tipo === "hospedagem_republica" ||
    tipo === "aluguel_espaco_festa"
  ) {
    return "compromissos";
  }

  return "eventos";
}

export function getEventoTipoLabel(tipo: string) {
  switch (tipo) {
    case "social":
      return "Social";
    case "formatura":
      return "Formatura";
    case "reuniao":
      return "Reuniao";
    case "escolha":
      return "Escolha";
    case "almoco":
      return "Almoco";
    case "aniversario":
      return "Aniversario";
    case "hospedagem_republica":
      return "Hospedagem na republica";
    case "aluguel_espaco_festa":
      return "Aluguel do espaco";
    default:
      return "Outro";
  }
}

export function getEventoTipoBadgeVariant(tipo: string) {
  switch (tipo) {
    case "social":
      return "info" as const;
    case "formatura":
      return "warning" as const;
    case "reuniao":
      return "neutral" as const;
    case "escolha":
      return "danger" as const;
    case "almoco":
      return "success" as const;
    case "aniversario":
      return "info" as const;
    case "hospedagem_republica":
      return "success" as const;
    case "aluguel_espaco_festa":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export function getEventoTipoCalendarClass(tipo: string) {
  switch (tipo) {
    case "social":
      return "border-sky-500/20 bg-sky-500/10 text-sky-300";
    case "formatura":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "reuniao":
      return "border-zinc-700 bg-zinc-800 text-zinc-300";
    case "escolha":
      return "border-rose-500/20 bg-rose-500/10 text-rose-300";
    case "almoco":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "aniversario":
      return "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300";
    case "hospedagem_republica":
      return "border-teal-500/20 bg-teal-500/10 text-teal-300";
    case "aluguel_espaco_festa":
      return "border-orange-500/20 bg-orange-500/10 text-orange-300";
    default:
      return "border-zinc-700 bg-zinc-800 text-zinc-300";
  }
}
