import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { upsertPersonalSymbolMeaning } from "@/lib/actions/symbols";
import { Button } from "@/components/ui/Button";

type SymbolGroup = {
  value: string;
  occurrences: { dreamId: string; dreamTitle: string | null; dreamDate: string }[];
};

export default async function SymbolsPage() {
  const supabase = await createClient();

  const [{ data: symbolRows }, { data: meanings }] = await Promise.all([
    supabase
      .from("dream_symbols")
      .select("value, dream_id, dreams(id, title, dream_date)"),
    supabase.from("personal_symbol_meanings").select("*").order("symbol"),
  ]);

  const groups = new Map<string, SymbolGroup>();
  for (const row of symbolRows ?? []) {
    const key = row.value.trim().toLowerCase();
    const dream = Array.isArray(row.dreams) ? row.dreams[0] : row.dreams;
    if (!groups.has(key)) {
      groups.set(key, { value: row.value.trim(), occurrences: [] });
    }
    if (dream) {
      groups.get(key)!.occurrences.push({
        dreamId: dream.id,
        dreamTitle: dream.title,
        dreamDate: dream.dream_date,
      });
    }
  }

  const meaningByKey = new Map(
    (meanings ?? []).map((m) => [m.symbol.trim().toLowerCase(), m])
  );

  const entries = Array.from(groups.values()).sort(
    (a, b) => b.occurrences.length - a.occurrences.length
  );

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dreams" className="text-sm text-text-muted">
        ← Your dreams
      </Link>
      <h1 className="text-2xl mt-6 mb-2">Your symbols</h1>
      <p className="text-sm text-text-muted mb-10">
        What a symbol means depends on your own experience, not a universal
        dictionary. Your own meaning is what matters here.
      </p>

      {entries.length === 0 ? (
        <p className="text-text-muted text-sm py-12 text-center">
          Symbols and details you record against dreams will appear here.
        </p>
      ) : (
        <div className="space-y-8">
          {entries.map((entry) => {
            const meaning = meaningByKey.get(entry.value.toLowerCase());
            const action = upsertPersonalSymbolMeaning;
            return (
              <div key={entry.value} className="border-b border-line pb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-lg">{entry.value}</h2>
                  <span className="text-xs text-text-muted">
                    Appears in {entry.occurrences.length}{" "}
                    {entry.occurrences.length === 1 ? "dream" : "dreams"}
                  </span>
                </div>

                <form action={action} className="space-y-2 mb-3">
                  <input type="hidden" name="symbol" value={entry.value} />
                  <textarea
                    name="personal_meaning"
                    rows={2}
                    placeholder="What this has meant to you"
                    defaultValue={meaning?.personal_meaning ?? ""}
                    className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm focus:border-lamp resize-y"
                  />
                  <Button type="submit" variant="quiet">
                    Save meaning
                  </Button>
                </form>

                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {entry.occurrences.map((occurrence, index) => (
                    <Link
                      key={`${occurrence.dreamId}-${index}`}
                      href={`/dreams/${occurrence.dreamId}`}
                      className="text-xs text-text-muted underline"
                    >
                      {occurrence.dreamTitle?.trim() || occurrence.dreamDate}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
