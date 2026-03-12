import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
};

export function StatCard({ title, value, helper, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {helper ? <p className="text-xs text-slate-400">{helper}</p> : null}
        </div>

        {icon ? (
          <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}