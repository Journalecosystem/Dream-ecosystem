import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function FormationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { count: dreamCount },
    { count: examinationCount },
    { count: processingCount },
    { count: interpretationCount },
    { count: testingCount },
    { count: fulfillmentCount },
    { count: testimonyCount },
    { count: sharedCount },
  ] = await Promise.all([
    supabase.from("dreams").select("id", { count: "exact", head: true }),
    supabase.from("dream_examinations").select("id", { count: "exact", head: true }),
    supabase.from("dream_processing").select("id", { count: "exact", head: true }),
    supabase.from("dream_interpretations").select("id", { count: "exact", head: true }),
    supabase.from("source_testing_responses").select("id", { count: "exact", head: true }),
    supabase.from("fulfillment_records").select("id", { count: "exact", head: true }),
    supabase.from("testimonies").select("id", { count: "exact", head: true }),
    user
      ? supabase.from("shared_dreams").select("id", { count: "exact", head: true }).eq("shared_by", user.id)
      : Promise.resolve({ count: 0 }),
  ]);

  const stages = [
    { label: "Remember", done: (dreamCount ?? 0) > 0, note: `${dreamCount ?? 0} dream${dreamCount === 1 ? "" : "s"} recorded` },
    { label: "Record", done: (dreamCount ?? 0) >= 3, note: "Recording dreams as a habit, not a one time thing" },
    { label: "Observe", done: (examinationCount ?? 0) > 0, note: "Separating what happened from what it might mean" },
    { label: "Examine", done: (examinationCount ?? 0) > 0 && (processingCount ?? 0) > 0, note: "Investigating context, not just content" },
    { label: "Discern", done: (interpretationCount ?? 0) > 0, note: "Exploring possible sources and meanings" },
    { label: "Test", done: (testingCount ?? 0) > 0, note: "Applying the source testing framework" },
    { label: "Respond", done: (processingCount ?? 0) > 0, note: "Following through on what a dream calls for" },
    { label: "Track", done: (fulfillmentCount ?? 0) > 0, note: "Recording what happened afterward" },
    { label: "Recognize", done: (fulfillmentCount ?? 0) >= 2, note: "Reviewing patterns across more than one outcome" },
    { label: "Steward", done: (testimonyCount ?? 0) > 0 || (sharedCount ?? 0) > 0, note: "Carrying what you have learned responsibly, alone or in community" },
  ];

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dreams" className="text-sm text-text-muted">
        ← Your dreams
      </Link>
      <h1 className="text-2xl mt-6 mb-2">Your journey</h1>
      <p className="text-sm text-text-muted mb-10">
        This describes what you have actually done, not a score to chase.
      </p>

      <ul className="space-y-5">
        {stages.map((stage) => (
          <li key={stage.label} className="flex items-start gap-4">
            <span
              className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                stage.done ? "bg-lamp" : "bg-line"
              }`}
            />
            <span>
              <span className="block text-text">{stage.label}</span>
              <span className="block text-sm text-text-muted">{stage.note}</span>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
