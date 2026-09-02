import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { acceptGuidelinesAndJoin } from "@/lib/actions/circles";
import { Button } from "@/components/ui/Button";

export default async function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: circle } = await supabase.from("circles").select("*").eq("id", id).single();
  if (!circle) notFound();

  const { data: membership } = await supabase
    .from("circle_memberships")
    .select("*")
    .eq("circle_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const isMember =
    membership && membership.guidelines_accepted_version === circle.guidelines_version;

  if (!isMember) {
    const joinAction = acceptGuidelinesAndJoin.bind(null, id, circle.guidelines_version);
    return (
      <main className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/circles" className="text-sm text-text-muted">
          ← Dream Circles
        </Link>
        <h1 className="text-2xl mt-6 mb-6">{circle.title}</h1>

        <section className="border border-line rounded-sm p-5 space-y-3 mb-6">
          <p className="text-sm font-medium">Before you join</p>
          <ul className="text-sm text-text-muted space-y-2 list-disc pl-5">
            <li>
              Keep what is shared here confidential. Do not repeat someone
              else&apos;s dream outside this circle.
            </li>
            <li>
              You may only respond with a question or an observation, never
              a verdict on what someone else&apos;s dream means.
            </li>
            <li>Sharing here is always your own choice, made deliberately.</li>
            <li>
              Approach every dream, your own and others&apos;, with humility.
              Confidence is not the same as certainty.
            </li>
          </ul>
        </section>

        <form action={joinAction}>
          <Button type="submit">I have read this. Join the circle.</Button>
        </form>
      </main>
    );
  }

  const { data: shared } = await supabase
    .from("shared_dreams")
    .select("id, shared_at, dreams(id, title)")
    .eq("circle_id", id)
    .order("shared_at", { ascending: false });

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/circles" className="text-sm text-text-muted">
        ← Dream Circles
      </Link>
      <div className="flex items-center justify-between mt-6 mb-8">
        <h1 className="text-2xl">{circle.title}</h1>
        <Link href={`/circles/${id}/share`}>
          <Button variant="quiet">Share a dream here</Button>
        </Link>
      </div>

      {!shared || shared.length === 0 ? (
        <p className="text-sm text-text-muted py-12 text-center">
          Nothing shared here yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {shared.map((entry) => {
            const dream = Array.isArray(entry.dreams) ? entry.dreams[0] : entry.dreams;
            return (
              <li key={entry.id}>
                <Link
                  href={`/circles/${id}/dreams/${entry.id}`}
                  className="block py-3 border-b border-line hover:text-lamp"
                >
                  {dream?.title?.trim() || "Untitled dream"}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
