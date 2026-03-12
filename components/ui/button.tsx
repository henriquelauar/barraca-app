import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-amber-500 text-zinc-950 hover:bg-amber-400 disabled:bg-amber-500/60",
  outline:
    "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800",
  ghost:
    "bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white",
  destructive:
    "bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-600/60",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

export function Button({
  children,
  className,
  variant = "default",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-70",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}