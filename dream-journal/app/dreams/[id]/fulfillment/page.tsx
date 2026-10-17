import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createFulfillmentRecord } from "@/lib/actions/fulfillment";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";

const textareaClasses =
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm focus:border-lamp resize-y";

export default async function FulfillmentPage({
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

  const { data: interpretations } = await supabase
    .from("dream_interpretations")
    .select("id, version")
    .eq("dream_id", id)
    .order("version", { ascending: false });

  const action = createFulfillmentRecord.bind(null, id);

  return (
    <main id="main" className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/dreams/${id}`} className="text-sm text-text-muted">
        ← Back to dream
      </Link>
      <h1 className="text-2xl mt-6 mb-2">Record an outcome</h1>
      <p className="text-sm text-text-muted mb-8">
        You decide what this means, if anything. Nothing here is labeled a
        fulfillment automatically.
      </p>

      {error && (
        <p className="text-sm text-danger mb-4 border border-danger/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <form action={action} className="space-y-5">
        {interpretations && interpretations.length > 0 && (
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              Related interpretation, if any
            </span>
            <select name="interpretation_id" className={inputClasses}>
              <option value="">Not tied to a specific interpretation</option>
              {interpretations.map((i) => (
                <option key={i.id} value={i.id}>
                  Version {i.version}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">
            What happened
          </span>
          <textarea name="event_description" rows={4} className={textareaClasses} />
        </label>

        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">
            When it happened
          </span>
          <input type="date" name="event_date" className={inputClasses} />
        </label>

        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">
            What corresponded, what did not, what is still unclear
          </span>
          <textarea name="correspondence_notes" rows={4} className={textareaClasses} />
        </label>

        <fieldset>
          <legend className="text-sm text-text-muted mb-2">Status</legend>
          <div className="space-y-2">
            {[
              ["possible_confirmation", "Possible confirmation"],
              ["possible_fulfillment", "Possible fulfillment"],
              ["confirmed", "Confirmed personal outcome"],
              ["unfulfilled", "Unfulfilled or unresolved"],
            ].map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input type="radio" name="status" value={value} required />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <Button type="submit">Save outcome</Button>
      </form>
    </main>
  );
}
