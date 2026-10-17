import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function average(values: number[]): number | null {
  const filtered = values.filter((v): v is number => typeof v === "number");
  if (filtered.length === 0) return null;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

// Consecutive-day streak computed purely from dream_date values already on
// the dreams table — no new schema, no background job. "Current" counts
// backward from today or yesterday (so recording earlier today doesn't
// reset to zero at midnight); "longest" scans the whole history.
function computeStreaks(dates: string[]): { current: number; longest: number } {
  const uniqueDays = Array.from(new Set(dates)).sort();
  if (uniqueDays.length === 0) return { current: 0, longest: 0 };

  const dayMs = 24 * 60 * 60 * 1000;
  const asTime = (d: string) => new Date(`${d}T00:00:00Z`).getTime();

  let longest = 1;
  let run = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const gap = (asTime(uniqueDays[i]) - asTime(uniqueDays[i - 1])) / dayMs;
    run = gap === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterdayStr = new Date(today.getTime() - dayMs).toISOString().slice(0, 10);
  const last = uniqueDays[uniqueDays.length - 1];

  let current = 0;
  if (last === todayStr || last === yesterdayStr) {
    current = 1;
    for (let i = uniqueDays.length - 1; i > 0; i--) {
      const gap = (asTime(uniqueDays[i]) - asTime(uniqueDays[i - 1])) / dayMs;
      if (gap === 1) current += 1;
      else break;
    }
  }

  return { current, longest };
}

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
    { data: examinations },
    { data: dreamMetrics },
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
    supabase.from("dream_examinations").select("sleep_quality"),
    supabase.from("dreams").select("dream_date, clarity_level, confidence_in_memory"),
  ]);

  const avgSleepQuality = average((examinations ?? []).map((e) => e.sleep_quality as number));
  const avgClarity = average((dreamMetrics ?? []).map((d) => d.clarity_level as number));
  const avgConfidence = average(
    (dreamMetrics ?? []).map((d) => d.confidence_in_memory as number)
  );
  const streaks = computeStreaks((dreamMetrics ?? []).map((d) => d.dream_date as string));

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
    <main id="main" className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dreams" className="text-sm text-text-muted">
        ← Your dreams
      </Link>
      <h1 className="text-2xl mt-6 mb-2">Your journey</h1>
      <p className="text-sm text-text-muted mb-10">
        This describes what you have actually done, not a score to chase.
      </p>

      {(dreamCount ?? 0) > 0 && (
        <section className="mb-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-line rounded-sm p-3">
            <p className="text-xs text-text-muted mb-1">Current streak</p>
            <p className="text-xl">{streaks.current} day{streaks.current === 1 ? "" : "s"}</p>
          </div>
          <div className="border border-line rounded-sm p-3">
            <p className="text-xs text-text-muted mb-1">Longest streak</p>
            <p className="text-xl">{streaks.longest} day{streaks.longest === 1 ? "" : "s"}</p>
          </div>
          <div className="border border-line rounded-sm p-3">
            <p className="text-xs text-text-muted mb-1">Avg. sleep quality</p>
            <p className="text-xl">{avgSleepQuality ? avgSleepQuality.toFixed(1) : "—"}<span className="text-sm text-text-muted">/5</span></p>
          </div>
          <div className="border border-line rounded-sm p-3">
            <p className="text-xs text-text-muted mb-1">Avg. recall confidence</p>
            <p className="text-xl">{avgConfidence ? avgConfidence.toFixed(1) : "—"}<span className="text-sm text-text-muted">/5</span></p>
          </div>
          {avgClarity && (
            <div className="border border-line rounded-sm p-3 col-span-2 sm:col-span-4">
              <p className="text-xs text-text-muted mb-1">Average dream clarity, self-rated</p>
              <p className="text-xl">{avgClarity.toFixed(1)}<span className="text-sm text-text-muted">/5</span></p>
            </div>
          )}
        </section>
      )}

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
