import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { acceptGuidelinesAndJoin, leaveCircle, unshareDream } from "@/lib/actions/circles";
import { listMembersForFacilitator, removeMember } from "@/lib/actions/circle-moderation";
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
    .select("id, shared_at, shared_by, dreams(id, title)")
    .eq("circle_id", id)
    .order("shared_at", { ascending: false });

  const isFacilitator = circle.facilitator_id === user.id;
  const members = isFacilitator ? await listMembersForFacilitator(id) : [];
  const leaveAction = leaveCircle.bind(null, id);

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
            const canRemove = entry.shared_by === user.id || isFacilitator;
            const unshareAction = entry.shared_by === user.id
              ? unshareDream.bind(null, id, entry.id)
              : undefined;
            return (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-3 border-b border-line">
                <Link
                  href={`/circles/${id}/dreams/${entry.id}`}
                  className="min-w-0 flex-1 hover:text-lamp truncate"
                >
                  {dream?.title?.trim() || "Untitled dream"}
                </Link>
                {canRemove && unshareAction && (
                  <form action={unshareAction}>
                    <button type="submit" className="text-xs text-text-muted hover:text-danger shrink-0">
                      Unshare
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isFacilitator && (
        <section className="mt-10 pt-6 border-t border-line">
          <h2 className="text-base mb-4">Members (facilitator view)</h2>
          {members.length === 0 ? (
            <p className="text-sm text-text-muted">No members yet.</p>
          ) : (
            <ul className="space-y-1">
              {members.map((member) => {
                const removeAction = removeMember.bind(null, id, member.membershipId);
                const isSelf = member.userId === user.id;
                return (
                  <li
                    key={member.membershipId}
                    className="flex items-center justify-between gap-3 py-2 border-b border-line text-sm"
                  >
                    <span className="min-w-0 truncate text-text-muted">
                      {member.email}
                      {isSelf && " (you)"}
                    </span>
                    {!isSelf && (
                      <form action={removeAction}>
                        <button type="submit" className="text-xs text-text-muted hover:text-danger shrink-0">
                          Remove
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <div className="mt-10 pt-6 border-t border-line">
        <form action={leaveAction}>
          <button type="submit" className="text-sm text-text-muted hover:text-danger">
            Leave this circle
          </button>
        </form>
      </div>
    </main>
  );
}
