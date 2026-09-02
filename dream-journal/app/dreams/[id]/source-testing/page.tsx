import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SourceTestingSection } from "@/components/dreams/sections/SourceTestingSection";

export default async function SourceTestingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: dream } = await supabase.from("dreams").select("id, title").eq("id", id).single();
  if (!dream) notFound();

  const { data: interpretations } = await supabase
    .from("dream_interpretations")
    .select("*")
    .eq("dream_id", id)
    .order("version", { ascending: false });

  const current = interpretations?.[0] ?? null;

  const { data: response } = current
    ? await supabase
        .from("source_testing_responses")
        .select("*")
        .eq("interpretation_id", current.id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/dreams/${id}`} className="text-sm text-text-muted">
        ← Back to dream
      </Link>
      <h1 className="text-2xl mt-6 mb-8">
        Source testing{dream.title ? `: ${dream.title}` : ""}
      </h1>
      <SourceTestingSection
        dreamId={id}
        interpretationId={current?.id ?? null}
        response={response ?? null}
      />
    </main>
  );
}
