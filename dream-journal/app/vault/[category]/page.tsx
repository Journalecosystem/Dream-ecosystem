import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const LABELS: Record<string, string> = {
  biblical_dream_library: "Biblical dream library",
  symbol_library: "Symbol library",
  interpretation_framework: "Interpretation framework",
  case_studies: "Case studies",
  scripture_library: "Scripture library",
  prayer_resources: "Prayer resources",
  teaching_library: "Teaching library",
};

export default async function VaultCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!LABELS[category]) notFound();

  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("vault_content")
    .select("id, title, body")
    .eq("category", category)
    .eq("published", true)
    .order("title");

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/vault" className="text-sm text-text-muted">
        ← The Vault
      </Link>
      <h1 className="text-2xl mt-6 mb-8">{LABELS[category]}</h1>

      {!entries || entries.length === 0 ? (
        <p className="text-sm text-text-muted py-12 text-center">
          Nothing published in this category yet.
        </p>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/vault/${category}/${entry.id}`}
              className="block py-4 border-b border-line group"
            >
              <span className="block text-text group-hover:text-lamp mb-1">
                {entry.title}
              </span>
              <span className="block text-sm text-text-muted line-clamp-2">
                {entry.body.slice(0, 140)}…
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
