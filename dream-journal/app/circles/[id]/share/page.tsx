import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { shareDreamToCircle } from "@/lib/actions/circles";
import { Button } from "@/components/ui/Button";

export default async function ShareDreamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: circle } = await supabase.from("circles").select("id, title").eq("id", id).single();
  if (!circle) notFound();

  const { data: dreams } = await supabase
    .from("dreams")
    .select("id, title, dream_date, narrative")
    .order("dream_date", { ascending: false });

  const action = shareDreamToCircle.bind(null, id);

  return (
    <main id="main" className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/circles/${id}`} className="text-sm text-text-muted">
        ← {circle.title}
      </Link>
      <h1 className="text-2xl mt-6 mb-2">Share a dream</h1>
      <p className="text-sm text-text-muted mb-8">
        This is a separate, deliberate choice. Sharing here never happens
        automatically, and your dream stays private everywhere else
        regardless of what you choose here.
      </p>

      {error && (
        <p className="text-sm text-danger mb-4 border border-danger/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      {!dreams || dreams.length === 0 ? (
        <p className="text-sm text-text-muted">
          Record a dream first, then come back here to share it.
        </p>
      ) : (
        <form action={action} className="space-y-3">
          {dreams.map((dream) => (
            <label
              key={dream.id}
              className="flex items-start gap-3 border border-line rounded-sm p-3"
            >
              <input type="radio" name="dream_id" value={dream.id} required className="mt-1" />
              <span>
                <span className="block text-text">
                  {dream.title?.trim() || "Untitled dream"}
                </span>
                <span className="block text-sm text-text-muted line-clamp-2">
                  {dream.narrative.slice(0, 120)}…
                </span>
              </span>
            </label>
          ))}
          <Button type="submit">Share to this circle</Button>
        </form>
      )}
    </main>
  );
}
