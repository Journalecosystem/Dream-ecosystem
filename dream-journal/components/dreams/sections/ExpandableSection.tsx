import { type ReactNode } from "react";

export function ExpandableSection({
  title,
  defaultOpen = false,
  summary,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  summary?: string;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="border-b border-line py-5 group"
    >
      <summary className="flex items-center justify-between gap-4 cursor-pointer list-none min-h-12 [&::-webkit-details-marker]:hidden">
        <span className="text-base font-semibold">{title}</span>
        <span className="flex items-center gap-3">
          {summary && (
            <span className="text-sm text-text-muted">{summary}</span>
          )}
          <span className="text-text transition-transform group-open:rotate-45 text-xl font-bold leading-none" aria-hidden="true">
            +
          </span>
        </span>
      </summary>
      <div className="pt-5">{children}</div>
    </details>
  );
}
