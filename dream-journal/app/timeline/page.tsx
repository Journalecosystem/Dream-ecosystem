import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";

const STATUS_OPTIONS = [
  { value: "awaiting_interpretation", label: "Awaiting interpretation" },
  { value: "awaiting_testing", label: "Awaiting testing" },
  { value: "awaiting_fulfillment", label: "Awaiting fulfillment" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "unresolved", label: "Unresolved" },
  { value: "recurring", label: "Recurring" },
];

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  const [{ data: dreams }, { data: interpretations }, { data: testing }, { data: fulfillments }, { data: examinations }] =
    await Promise.all([
      supabase.from("dreams").select("*").order("dream_date", { ascending: false }),
      supabase.from("dream_interpretations").select("id, dream_id"),
      supabase.from("source_testing_responses").select("interpretation_id"),
      supabase.from("fulfillment_records").select("dream_id, status"),
      supabase.from("dream_examinations").select("dream_id, was_recurring"),
    ]);

  const dreamsWithInterpretation = new Set((interpretations ?? []).map((i) => i.dream_id));
  const interpretationIdsWithTesting = new Set((testing ?? []).map((t) => t.interpretation_id));
  const dreamsWithTesting = new Set(
    (interpretations ?? [])
      .filter((i) => interpretationIdsWithTesting.has(i.id))
      .map((i) => i.dream_id)
  );
  const dreamsWithFulfillment = new Set((fulfillments ?? []).map((f) => f.dream_id));
  const dreamsConfirmed = new Set(
    (fulfillments ?? []).filter((f) => f.status === "confirmed").map((f) => f.dream_id)
  );
  const dreamsUnresolved = new Set(
    (fulfillments ?? []).filter((f) => f.status === "unfulfilled").map((f) => f.dream_id)
  );
  const dreamsRecurring = new Set(
    (examinations ?? []).filter((e) => e.was_recurring).map((e) => e.dream_id)
  );

  function statusesFor(dreamId: string) {
    const list: string[] = [];
    if (!dreamsWithInterpretation.has(dreamId)) list.push("awaiting_interpretation");
    if (dreamsWithInterpretation.has(dreamId) && !dreamsWithTesting.has(dreamId))
      list.push("awaiting_testing");
    if (dreamsWithInterpretation.has(dreamId) && !dreamsWithFulfillment.has(dreamId))
      list.push("awaiting_fulfillment");
    if (dreamsConfirmed.has(dreamId)) list.push("fulfilled");
    if (dreamsUnresolved.has(dreamId)) list.push("unresolved");
    if (dreamsRecurring.has(dreamId)) list.push("recurring");
    return list;
  }

  const filtered = (dreams ?? []).filter(
    (dream) => !status || statusesFor(dream.id).includes(status)
  );

  return (
    <main id="main" className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dreams" className="text-sm text-text-muted">
        ← Your dreams
      </Link>
      <h1 className="text-2xl mt-6 mb-2">Timeline</h1>
      <p className="text-sm text-text-muted mb-8">
        Your full history, in the order it happened. Unresolved and
        awaiting dreams are shown as plainly as fulfilled ones.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/timeline"
          className={`text-xs border rounded-full px-3 py-1 ${!status ? "border-ink" : "border-line"}`}
        >
          All
        </Link>
        {STATUS_OPTIONS.map((option) => (
          <Link
            key={option.value}
            href={`/timeline?status=${option.value}`}
            className={`text-xs border rounded-full px-3 py-1 ${status === option.value ? "border-ink" : "border-line"}`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted py-12 text-center">
          Nothing in this category yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {filtered.map((dream) => (
            <li key={dream.id}>
              <Link
                href={`/dreams/${dream.id}`}
                className="flex items-baseline justify-between gap-4 py-3 border-b border-line group"
              >
                <span className="min-w-0">
                  <span className="text-text group-hover:text-lamp">
                    {dream.title?.trim() || "Untitled dream"}
                  </span>
                  <span className="text-xs text-text-muted ml-2">
                    {statusesFor(dream.id)
                      .map((s) => STATUS_OPTIONS.find((o) => o.value === s)?.label)
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </span>
                <time className="text-sm text-text-muted whitespace-nowrap">
                  {format(new Date(dream.dream_date), "MMM d, yyyy")}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
