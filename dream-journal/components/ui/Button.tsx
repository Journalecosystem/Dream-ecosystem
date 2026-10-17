import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "quiet" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-paper hover:bg-ink-soft disabled:opacity-40 disabled:hover:bg-ink",
  quiet:
    "bg-transparent text-text border border-line hover:border-ink disabled:opacity-40",
  danger:
    "bg-transparent text-danger border border-danger/40 hover:bg-danger/5 disabled:opacity-40",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className = "", variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex items-center justify-center rounded-sm px-4 py-2 text-base transition-colors ${variantClasses[variant]} ${className}`}
    {...props}
  />
));
Button.displayName = "Button";
