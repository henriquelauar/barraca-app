import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.25)] md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {title}
        </h1>

        {description ? (
          <p className="max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="md:flex-shrink-0">{action}</div> : null}
    </div>
  );
}