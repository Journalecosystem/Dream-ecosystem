import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

// Deliberately not backed by an RLS policy (see migration 0006's comment on
// testimonies.share_token): this route uses the service-role client and
// filters explicitly by is_private = false, so a testimony only becomes
// reachable here once its owner unchecks "Keep this private", and only to
// someone who already has the exact link. There is no listing or search
// surface for this route.
export default async function SharedTestimonyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: testimony } = await admin
    .from("testimonies")
    .select("summary, similarities, differences, lessons_learned, is_private, created_at")
    .eq("share_token", token)
    .eq("is_private", false)
    .maybeSingle();

  if (!testimony) notFound();

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-xs text-text-muted mb-8">
        A testimony shared with you as a read-only link. Nothing here
        identifies whose it is unless they have told you separately.
      </p>

      {testimony.summary && (
        <section className="mb-6">
          <h2 className="text-sm text-text-muted mb-1.5">Summary</h2>
          <p>{testimony.summary}</p>
        </section>
      )}
      {testimony.similarities && (
        <section className="mb-6">
          <h2 className="text-sm text-text-muted mb-1.5">Similarities</h2>
          <p>{testimony.similarities}</p>
        </section>
      )}
      {testimony.differences && (
        <section className="mb-6">
          <h2 className="text-sm text-text-muted mb-1.5">Differences</h2>
          <p>{testimony.differences}</p>
        </section>
      )}
      {testimony.lessons_learned && (
        <section>
          <h2 className="text-sm text-text-muted mb-1.5">What was learned</h2>
          <p>{testimony.lessons_learned}</p>
        </section>
      )}
    </main>
  );
}
