type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info";

type StatusBadgeProps = {
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
};

const variants: Record<StatusBadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  info: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
};

export function StatusBadge({
  children,
  variant = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}