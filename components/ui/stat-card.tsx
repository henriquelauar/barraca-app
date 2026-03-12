import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
};

export function StatCard({
  title,
  value,
  helper,
  icon,
}: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            {value}
          </p>
          {helper ? (
            <p className="text-sm leading-6 text-zinc-400">{helper}</p>
          ) : null}
        </div>

        {icon ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 text-zinc-300">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}