import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTestimony } from "@/lib/actions/testimonies";
import { Button } from "@/components/ui/Button";

const textareaClasses =
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm focus:border-lamp resize-y";

export default async function NewTestimonyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: dream } = await supabase.from("dreams").select("id, title").eq("id", id).single();
  if (!dream) notFound();

  const { data: fulfillments } = await supabase
    .from("fulfillment_records")
    .select("id, status, event_description, event_date")
    .eq("dream_id", id)
    .order("created_at", { ascending: false });

  if (!fulfillments || fulfillments.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-10">
        <Link href={`/dreams/${id}`} className="text-sm text-text-muted">
          ← Back to dream
        </Link>
        <p className="text-sm text-text-muted mt-8">
          A testimony is built from a recorded outcome. Record what happened
          first, then come back here.
        </p>
      </main>
    );
  }

  const action = createTestimony.bind(null, id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/dreams/${id}`} className="text-sm text-text-muted">
        ← Back to dream
      </Link>
      <h1 className="text-2xl mt-6 mb-2">Record a testimony</h1>
      <p className="text-sm text-text-muted mb-8">
        This stays private to you. It preserves not just what happened, but
        what you learned.
      </p>

      {error && (
        <p className="text-sm text-danger mb-4 border border-danger/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <form action={action} className="space-y-5">
        <fieldset>
          <legend className="text-sm text-text-muted mb-2">
            Which recorded outcome is this testimony built on
          </legend>
          <div className="space-y-2">
            {fulfillments.map((f) => (
              <label key={f.id} className="flex items-start gap-2 text-sm border border-line rounded-sm p-3">
                <input type="radio" name="fulfillment_id" value={f.id} required className="mt-1" />
                <span>
                  {f.event_description || "Recorded outcome"}
                  {f.event_date && (
                    <span className="text-text-muted"> · {f.event_date}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">Summary</span>
          <textarea name="summary" rows={3} className={textareaClasses} />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              Similarities
            </span>
            <textarea name="similarities" rows={3} className={textareaClasses} />
          </label>
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              Differences
            </span>
            <textarea name="differences" rows={3} className={textareaClasses} />
          </label>
        </div>
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">
            What you learned
          </span>
          <textarea name="lessons_learned" rows={3} className={textareaClasses} />
        </label>

        <Button type="submit">Save testimony</Button>
      </form>
    </main>
  );
}
