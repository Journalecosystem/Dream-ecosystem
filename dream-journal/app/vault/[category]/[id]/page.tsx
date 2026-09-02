import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function VaultEntryPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("vault_content")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .single();

  if (!entry) notFound();

  // If the user has a personal meaning recorded for a symbol that matches
  // this entry's title, their own meaning is shown first and primary,
  // with this reference content clearly secondary.
  let personalMeaning: string | null = null;
  if (entry.category === "symbol_library") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: meanings } = await supabase
        .from("personal_symbol_meanings")
        .select("symbol, personal_meaning")
        .eq("user_id", user.id);
      const match = (meanings ?? []).find((m) =>
        entry.title.toLowerCase().includes(m.symbol.toLowerCase())
      );
      personalMeaning = match?.personal_meaning ?? null;
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/vault/${category}`} className="text-sm text-text-muted">
        ← Back
      </Link>

      {personalMeaning && (
        <section className="mt-6 mb-8 border border-lamp-soft bg-lamp-soft/20 rounded-sm p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted mb-2">
            What this has meant to you
          </p>
          <p className="text-text">{personalMeaning}</p>
        </section>
      )}

      <h1 className="text-2xl mt-6 mb-4">{entry.title}</h1>
      <p className="text-xs uppercase tracking-wide text-text-muted mb-6">
        Reference content, one perspective among others
      </p>
      <p className="prose-measure whitespace-pre-wrap leading-relaxed mb-8">
        {entry.body}
      </p>

      {entry.scripture_references && entry.scripture_references.length > 0 && (
        <div className="border-t border-line pt-6">
          <p className="text-sm text-text-muted mb-2">Related Scripture</p>
          <ul className="text-sm space-y-1">
            {entry.scripture_references.map((ref: string) => (
              <li key={ref}>{ref}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
