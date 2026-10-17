import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createInterpretation } from "@/lib/actions/interpretations";
import { suggestScriptureReferences } from "@/lib/ai/scripture-suggestions";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";
import { ErrorNotice } from "@/components/ui/ErrorNotice";

const textareaClasses =
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-text focus:border-lamp resize-y";

export default async function InterpretDreamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: dream }, { data: symbols }, { data: people }] = await Promise.all([
    supabase.from("dreams").select("*").eq("id", id).single(),
    supabase.from("dream_symbols").select("*").eq("dream_id", id),
    supabase.from("dream_people").select("*").eq("dream_id", id),
  ]);

  if (!dream) notFound();

  const [suggestions, action] = await Promise.all([
    suggestScriptureReferences(dream.narrative),
    Promise.resolve(createInterpretation.bind(null, id)),
  ]);

  return (
    <main id="main" className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/dreams/${id}`} className="text-sm text-text-muted">
        ← Back to dream
      </Link>

      <h1 className="text-2xl mt-6 mb-2">New interpretation</h1>
      <ErrorNotice message={error} />
      <p className="text-sm text-text-muted mb-8">
        This is saved as a new version. Your earlier understanding of this
        dream, if any, stays visible in its history.
      </p>

      <section className="border border-line rounded-sm p-4 mb-8 space-y-3">
        <p className="text-xs uppercase tracking-wide text-text-muted">
          Dream facts, for reference
        </p>
        <p className="text-sm whitespace-pre-wrap">{dream.narrative}</p>
        {people && people.length > 0 && (
          <p className="text-sm text-text-muted">
            People: {people.map((p) => p.name).filter(Boolean).join(", ")}
          </p>
        )}
        {symbols && symbols.length > 0 && (
          <p className="text-sm text-text-muted">
            Details noted: {symbols.map((s) => s.value).join(", ")}
          </p>
        )}
      </section>

      {suggestions.length > 0 && (
        <section className="border border-lamp-soft bg-lamp-soft/20 rounded-sm p-4 mb-8">
          <p className="text-xs uppercase tracking-wide text-text-muted mb-2">
            Scripture worth reading alongside this, one possibility among others
          </p>
          <ul className="text-sm space-y-1">
            {suggestions.map((ref) => (
              <li key={ref}>{ref}</li>
            ))}
          </ul>
        </section>
      )}

      <form action={action} className="space-y-6">
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">
            A possible interpretation, held loosely
          </span>
          <textarea
            name="possible_meaning"
            rows={4}
            placeholder="One possibility is... Consider whether..."
            className={textareaClasses}
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              Evidence for this reading
            </span>
            <textarea name="evidence_for" rows={3} className={textareaClasses} />
          </label>
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              Evidence against it
            </span>
            <textarea name="evidence_against" rows={3} className={textareaClasses} />
          </label>
        </div>
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">
            Confidence right now (1 to 5)
          </span>
          <input
            type="number"
            name="confidence_level"
            min={1}
            max={5}
            className={`${inputClasses} max-w-[6rem]`}
          />
        </label>
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">
            What remains unresolved
          </span>
          <textarea name="unresolved_questions" rows={3} className={textareaClasses} />
        </label>
        <Button type="submit">Save interpretation</Button>
      </form>
    </main>
  );
}
