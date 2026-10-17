import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "quiet" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-paper border-2 border-ink hover:bg-ink-soft hover:border-ink-soft disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-ink",
  quiet:
    "bg-paper text-text border-2 border-line-strong hover:border-ink disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "bg-paper text-danger border-2 border-danger hover:bg-danger hover:text-paper disabled:opacity-50 disabled:cursor-not-allowed",
};

// Targets are at least 48px tall (3rem), the comfortable minimum for
// touch and for anyone with limited precision, and the label is semibold
// so it reads as something you can press.
export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className = "", variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex items-center justify-center rounded-sm px-5 py-3 min-h-12 text-base font-semibold transition-colors ${variantClasses[variant]} ${className}`}
    {...props}
  />
));
Button.displayName = "Button";
