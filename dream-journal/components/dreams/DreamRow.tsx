import Link from "next/link";
import { format } from "date-fns";
import type { Dream } from "@/types/database";

export function DreamRow({ dream }: { dream: Dream }) {
  const heading = dream.title?.trim() || truncate(dream.narrative, 80);

  return (
    <Link
      href={`/dreams/${dream.id}`}
      className="flex items-baseline justify-between gap-6 py-4 border-b border-line group"
    >
      <div className="min-w-0">
        <p className="text-text group-hover:text-lamp truncate">{heading}</p>
        {dream.dream_type && (
          <p className="text-xs text-text-muted mt-1">{dream.dream_type}</p>
        )}
      </div>
      <time className="text-sm text-text-muted whitespace-nowrap">
        {format(new Date(dream.dream_date), "MMM d, yyyy")}
      </time>
    </Link>
  );
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length).trim()}…` : value;
}
