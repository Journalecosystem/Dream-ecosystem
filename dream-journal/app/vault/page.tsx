import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { VaultCategory } from "@/types/database";

const CATEGORIES: { value: VaultCategory; label: string; description: string }[] = [
  { value: "biblical_dream_library", label: "Biblical dream library", description: "Dreams and visions across Scripture" },
  { value: "symbol_library", label: "Symbol library", description: "Biblical, cultural, and historical context" },
  { value: "interpretation_framework", label: "Interpretation framework", description: "How to examine a dream responsibly" },
  { value: "case_studies", label: "Case studies", description: "How understanding develops over time" },
  { value: "scripture_library", label: "Scripture library", description: "Passages connected to dream themes" },
  { value: "prayer_resources", label: "Prayer resources", description: "For wisdom, remembrance, and peace" },
  { value: "teaching_library", label: "Teaching library", description: "Longer studies and teaching" },
];

export default async function VaultPage() {
  const supabase = await createClient();
  const { data: counts } = await supabase.from("vault_content").select("category").eq("published", true);
  const countByCategory = new Map<string, number>();
  for (const row of counts ?? []) {
    countByCategory.set(row.category, (countByCategory.get(row.category) ?? 0) + 1);
  }

  return (
    <main id="main" className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dreams" className="text-sm text-text-muted">
        ← Your dreams
      </Link>
      <h1 className="text-2xl mt-6 mb-2">The Vault</h1>
      <p className="text-sm text-text-muted mb-10">
        Teaching, not a lookup table. Reference here alongside your own
        recorded meanings, never in place of them.
      </p>

      <div className="space-y-1">
        {CATEGORIES.map((category) => {
          const count = countByCategory.get(category.value) ?? 0;
          return (
            <Link
              key={category.value}
              href={`/vault/${category.value}`}
              className="flex items-baseline justify-between py-4 border-b border-line group"
            >
              <span>
                <span className="block text-text group-hover:text-lamp">
                  {category.label}
                </span>
                <span className="block text-sm text-text-muted">
                  {category.description}
                </span>
              </span>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {count} {count === 1 ? "entry" : "entries"}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
