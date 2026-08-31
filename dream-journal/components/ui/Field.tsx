import { type ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-text-muted mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-text-muted mt-1">{hint}</span>}
    </label>
  );
}

export const inputClasses =
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-text placeholder:text-text-muted focus:border-lamp";
