import Link from "next/link";

type Theme = { label: string; count: number };

export function RecurringThemesPanel({ themes }: { themes: Theme[] }) {
  if (themes.length === 0) return null;

  return (
    <div className="mb-8 border border-line rounded-sm p-4">
      <p className="text-xs uppercase tracking-wide text-text-muted mb-3">
        Recurring across your dreams, pattern recognition, not prophecy
      </p>
      <div className="flex flex-wrap gap-2">
        {themes.map((theme) => (
          <Link
            key={theme.label}
            href={`/dreams?q=${encodeURIComponent(theme.label)}`}
            className="text-xs border border-line rounded-full px-3 py-1 hover:border-lamp"
          >
            {theme.label} · {theme.count}
          </Link>
        ))}
      </div>
      <Link href="/symbols" className="text-xs text-text-muted underline mt-3 inline-block">
        View your full symbol library
      </Link>
    </div>
  );
}
