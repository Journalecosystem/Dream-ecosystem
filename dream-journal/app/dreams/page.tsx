import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DreamRow } from "@/components/dreams/DreamRow";
import { RecurringThemesPanel } from "@/components/dreams/RecurringThemesPanel";
import { inputClasses } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/app/auth/actions";
import { isAdminEmail } from "@/lib/auth/admin";
import { generateEmbedding } from "@/lib/ai/embeddings";
import type { Dream } from "@/types/database";

export default async function DreamsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    from?: string;
    to?: string;
    mode?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const wantsMeaningSearch = params.mode === "meaning" && Boolean(params.q);
  let dreams: Dream[] | null = null;
  let meaningSearchUnavailable = false;

  if (wantsMeaningSearch) {
    const embedding = await generateEmbedding(params.q!);
    if (embedding) {
      const { data } = await supabase.rpc("match_dreams", {
        query_embedding: embedding,
        match_count: 20,
      });
      // match_dreams returns a narrower shape than the full dreams row;
      // the list view only needs the fields it already selects elsewhere.
      dreams = (data ?? []) as unknown as Dream[];
    } else {
      meaningSearchUnavailable = true;
    }
  }

  if (dreams === null) {
    let query = supabase
      .from("dreams")
      .select("*")
      .order("dream_date", { ascending: false });

    if (params.q) {
      query = query.or(`narrative.ilike.%${params.q}%,title.ilike.%${params.q}%`);
    }
    if (params.type) {
      query = query.eq("dream_type", params.type);
    }
    if (params.from) {
      query = query.gte("dream_date", params.from);
    }
    if (params.to) {
      query = query.lte("dream_date", params.to);
    }

    const { data } = await query;
    dreams = data ?? [];
  }

  const hasFilters = Boolean(params.q || params.type || params.from || params.to);

  const { data: symbolRows } = await supabase.from("dream_symbols").select("value");
  const counts = new Map<string, number>();
  for (const row of symbolRows ?? []) {
    const key = row.value.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const recurringThemes = Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count]) => ({ label, count }));

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-sm text-text-muted">
          Dream Journal
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-end">
          <Link href="/formation" className="text-sm text-text-muted hover:text-text">
            Journey
          </Link>
          {isAdminEmail(user?.email) && (
            <Link href="/admin" className="text-sm text-text-muted hover:text-text">
              Admin
            </Link>
          )}
          <Link href="/vault" className="text-sm text-text-muted hover:text-text">
            Vault
          </Link>
          <Link href="/circles" className="text-sm text-text-muted hover:text-text">
            Circles
          </Link>
          <Link href="/timeline" className="text-sm text-text-muted hover:text-text">
            Timeline
          </Link>
          <Link href="/graph" className="text-sm text-text-muted hover:text-text">
            Connections
          </Link>
          <Link href="/testimonies" className="text-sm text-text-muted hover:text-text">
            Testimonies
          </Link>
          <Link href="/symbols" className="text-sm text-text-muted hover:text-text">
            Symbols
          </Link>
          <Link href="/account" className="text-sm text-text-muted hover:text-text">
            Account
          </Link>
          <form action={signOut}>
            <button className="text-sm text-text-muted hover:text-text">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl">Your dreams</h1>
        <Link href="/dreams/new">
          <Button>Record a dream</Button>
        </Link>
      </div>

      <RecurringThemesPanel themes={recurringThemes} />

      <form className="grid sm:grid-cols-4 gap-3 mb-2" method="get">
        <input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search"
          className={`${inputClasses} sm:col-span-2`}
        />
        <input
          type="text"
          name="type"
          defaultValue={params.type}
          placeholder="Dream type"
          className={inputClasses}
        />
        <div className="flex gap-2">
          <input
            type="date"
            name="from"
            defaultValue={params.from}
            className={inputClasses}
          />
        </div>
        <input
          type="date"
          name="to"
          defaultValue={params.to}
          className={`${inputClasses} sm:col-start-3`}
        />
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input type="checkbox" name="mode" value="meaning" defaultChecked={params.mode === "meaning"} />
          Search by meaning, not exact words
        </label>
        <div className="flex gap-2">
          <Button type="submit" variant="quiet">
            {wantsMeaningSearch ? "Search by meaning" : "Filter"}
          </Button>
          {hasFilters && (
            <Link href="/dreams" className="text-sm text-text-muted self-center">
              Clear
            </Link>
          )}
        </div>
      </form>

      {meaningSearchUnavailable && (
        <p className="text-xs text-text-muted mb-6">
          Meaning based search is not configured yet, showing exact word
          matches instead.
        </p>
      )}
      {wantsMeaningSearch && !meaningSearchUnavailable && (
        <p className="text-xs text-text-muted mb-6">
          Showing dreams closest in meaning, not necessarily exact wording.
          Only dreams recorded or edited since meaning search was enabled
          are included.
        </p>
      )}

      {dreams && dreams.length > 0 ? (
        <div>
          {dreams.map((dream) => (
            <DreamRow key={dream.id} dream={dream} />
          ))}
        </div>
      ) : hasFilters ? (
        <p className="text-text-muted text-sm py-12 text-center">
          Nothing matches that search.
        </p>
      ) : (
        <div className="text-center py-20 border border-dashed border-line rounded-sm">
          <p className="text-text-muted mb-4">
            You have not recorded a dream yet.
          </p>
          <Link href="/dreams/new">
            <Button>Record your first dream</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
