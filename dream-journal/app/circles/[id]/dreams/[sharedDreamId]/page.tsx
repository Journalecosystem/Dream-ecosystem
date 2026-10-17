import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { postCircleResponse, deleteOwnResponse, unshareDream, markSharedDreamViewed } from "@/lib/actions/circles";
import { removeResponseAsFacilitator } from "@/lib/actions/circle-moderation";
import { Button } from "@/components/ui/Button";
import { ErrorNotice } from "@/components/ui/ErrorNotice";

export default async function SharedDreamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; sharedDreamId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, sharedDreamId } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: shared } = await supabase
    .from("shared_dreams")
    .select("*, dreams(id, title, narrative)")
    .eq("id", sharedDreamId)
    .single();

  if (!shared) notFound();
  const dream = Array.isArray(shared.dreams) ? shared.dreams[0] : shared.dreams;

  const { data: circle } = await supabase
    .from("circles")
    .select("facilitator_id")
    .eq("id", id)
    .maybeSingle();
  const isFacilitator = circle?.facilitator_id === user.id;
  const isOwner = shared.shared_by === user.id;

  if (isOwner) {
    // Fire-and-forget: resets the unread badge for the person who shared
    // this dream. Never blocks rendering the page.
    await markSharedDreamViewed(sharedDreamId);
  }

  const { data: responses } = await supabase
    .from("circle_responses")
    .select("*")
    .eq("shared_dream_id", sharedDreamId)
    .order("created_at", { ascending: true });

  const action = postCircleResponse.bind(null, id, sharedDreamId);
  const unshareAction = unshareDream.bind(null, id, sharedDreamId);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/circles/${id}`} className="text-sm text-text-muted">
        ← Back to circle
      </Link>

      <ErrorNotice message={error} />
      <div className="flex items-start justify-between gap-4 mt-6 mb-2">
        <h1 className="text-2xl">{dream?.title?.trim() || "Untitled dream"}</h1>
        {(isOwner || isFacilitator) && (
          <form action={unshareAction}>
            <button type="submit" className="text-xs text-text-muted hover:text-danger shrink-0 mt-2">
              Unshare
            </button>
          </form>
        )}
      </div>
      <p className="prose-measure whitespace-pre-wrap leading-relaxed mb-8 text-text">
        {dream?.narrative}
      </p>

      <div className="border-t border-line pt-6 mb-8">
        <p className="text-sm text-text-muted mb-4">
          Responses here are always a question or an observation, never a
          verdict on what this dream means.
        </p>
        {!responses || responses.length === 0 ? (
          <p className="text-sm text-text-muted">No responses yet.</p>
        ) : (
          <ul className="space-y-3">
            {responses.map((response) => {
              const canRemove = response.responder_id === user.id || isFacilitator;
              const removeAction =
                response.responder_id === user.id
                  ? deleteOwnResponse.bind(null, id, sharedDreamId, response.id)
                  : removeResponseAsFacilitator.bind(null, id, sharedDreamId, response.id);
              return (
                <li key={response.id} className="border border-line rounded-sm p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs uppercase tracking-wide text-text-muted mb-1">
                      {response.response_type}
                    </p>
                    {canRemove && (
                      <form action={removeAction}>
                        <button type="submit" className="text-xs text-text-muted hover:text-danger shrink-0">
                          Remove
                        </button>
                      </form>
                    )}
                  </div>
                  <p className="text-sm">{response.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form action={action} className="space-y-3">
        <fieldset>
          <legend className="text-sm text-text-muted mb-2">Your response is a</legend>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="response_type" value="question" required />
              Question
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="response_type" value="observation" required />
              Observation
            </label>
          </div>
        </fieldset>
        <textarea
          name="body"
          rows={3}
          required
          placeholder="What you noticed, or what you would ask them"
          className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm focus:border-lamp resize-y"
        />
        <Button type="submit" variant="quiet">
          Post response
        </Button>
      </form>
    </main>
  );
}

