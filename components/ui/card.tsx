import { HTMLAttributes } from "react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}