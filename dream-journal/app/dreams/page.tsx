import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DreamRow } from "@/components/dreams/DreamRow";
import { inputClasses } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/app/auth/actions";

export default async function DreamsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

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

  const { data: dreams } = await query;
  const hasFilters = Boolean(params.q || params.type || params.from || params.to);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-sm text-text-muted">
          Dream Journal
        </Link>
        <div className="flex items-center gap-4">
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

      <form className="grid sm:grid-cols-4 gap-3 mb-8" method="get">
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
        <div className="flex gap-2">
          <Button type="submit" variant="quiet">
            Filter
          </Button>
          {hasFilters && (
            <Link href="/dreams" className="text-sm text-text-muted self-center">
              Clear
            </Link>
          )}
        </div>
      </form>

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
