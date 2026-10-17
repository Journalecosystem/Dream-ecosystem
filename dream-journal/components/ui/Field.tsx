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
      <span className="block text-base font-semibold text-text mb-2">{label}</span>
      {children}
      {hint && <span className="block text-sm text-text-muted mt-2">{hint}</span>}
    </label>
  );
}

// Thick, dark border (3:1 or better against the page) so the edge of every
// field can be found, and a larger target for tapping into it.
export const inputClasses =
  "w-full rounded-sm border-2 border-line-strong bg-paper px-4 py-3 min-h-12 text-text placeholder:text-text-muted focus:border-ink";
