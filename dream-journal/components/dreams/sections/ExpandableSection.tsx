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
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="text-base">{title}</span>
        <span className="flex items-center gap-3">
          {summary && (
            <span className="text-xs text-text-muted">{summary}</span>
          )}
          <span className="text-text-muted transition-transform group-open:rotate-45 text-lg leading-none">
            +
          </span>
        </span>
      </summary>
      <div className="pt-5">{children}</div>
    </details>
  );
}
