import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TestimonyPrivacyControl } from "@/components/dreams/TestimonyPrivacyControl";
import { ErrorNotice } from "@/components/ui/ErrorNotice";

export default async function TestimoniesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: testimonies } = await supabase
    .from("testimonies")
    .select("*, dreams(id, title, dream_date)")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dreams" className="text-sm text-text-muted">
        ← Your dreams
      </Link>
      <ErrorNotice message={error} />
      <h1 className="text-2xl mt-6 mb-2">Testimonies</h1>
      <p className="text-sm text-text-muted mb-8">
        What you have learned, not just what happened.
      </p>

      {!testimonies || testimonies.length === 0 ? (
        <p className="text-sm text-text-muted py-12 text-center">
          Once you record a fulfillment outcome for a dream, you can build a
          testimony from it here.
        </p>
      ) : (
        <ul className="space-y-6">
          {testimonies.map((testimony) => {
            const dream = Array.isArray(testimony.dreams)
              ? testimony.dreams[0]
              : testimony.dreams;
            return (
              <li key={testimony.id} className="border-b border-line pb-6">
                {dream && (
                  <Link
                    href={`/dreams/${dream.id}`}
                    className="text-sm text-text-muted underline"
                  >
                    {dream.title?.trim() || dream.dream_date}
                  </Link>
                )}
                {testimony.summary && <p className="mt-2">{testimony.summary}</p>}
                {testimony.lessons_learned && (
                  <p className="text-sm text-text-muted mt-2">
                    Learned: {testimony.lessons_learned}
                  </p>
                )}
                <TestimonyPrivacyControl
                  testimonyId={testimony.id}
                  isPrivate={testimony.is_private}
                  shareToken={testimony.share_token}
                />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

