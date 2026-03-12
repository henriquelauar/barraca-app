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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const variants: Record<StatusBadgeVariant, string> = {
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  danger: "border-rose-500/20 bg-rose-500/10 text-rose-300",
  neutral: "border-zinc-700 bg-zinc-800 text-zinc-300",
  info: "border-sky-500/20 bg-sky-500/10 text-sky-300",
};

export function StatusBadge({
  children,
  variant = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}