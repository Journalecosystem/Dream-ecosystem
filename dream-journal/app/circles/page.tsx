import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CirclesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: circles }, { data: memberships }] = await Promise.all([
    supabase.from("circles").select("*").order("title"),
    user
      ? supabase.from("circle_memberships").select("circle_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const memberCircleIds = new Set((memberships ?? []).map((m) => m.circle_id));

  return (
    <main id="main" className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dreams" className="text-sm text-text-muted">
        ← Your dreams
      </Link>
      <h1 className="text-2xl mt-6 mb-2">Dream Circles</h1>
      <p className="text-sm text-text-muted mb-10">
        Share, observe, ask, discern, test, pray, wait. No one here
        pronounces a verdict over your dream.
      </p>

      <div className="space-y-1">
        {(circles ?? []).map((circle) => (
          <Link
            key={circle.id}
            href={`/circles/${circle.id}`}
            className="flex items-baseline justify-between py-4 border-b border-line group"
          >
            <span>
              <span className="block text-text group-hover:text-lamp">
                {circle.title}
              </span>
              {circle.description && (
                <span className="block text-sm text-text-muted">
                  {circle.description}
                </span>
              )}
            </span>
            {memberCircleIds.has(circle.id) && (
              <span className="text-xs text-text-muted whitespace-nowrap">Joined</span>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
