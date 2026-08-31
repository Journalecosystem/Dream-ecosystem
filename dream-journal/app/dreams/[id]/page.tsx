import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { ExpandableSection } from "@/components/dreams/sections/ExpandableSection";
import { NarrativeSection } from "@/components/dreams/sections/NarrativeSection";
import { ExaminationSection } from "@/components/dreams/sections/ExaminationSection";
import { PeopleSection } from "@/components/dreams/sections/PeopleSection";
import { SymbolsSection } from "@/components/dreams/sections/SymbolsSection";
import { ProcessingSection } from "@/components/dreams/sections/ProcessingSection";
import { DreamTypeSection } from "@/components/dreams/sections/DreamTypeSection";

export default async function DreamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: dream }, { data: examination }, { data: people }, { data: symbols }, { data: processing }] =
    await Promise.all([
      supabase.from("dreams").select("*").eq("id", id).single(),
      supabase.from("dream_examinations").select("*").eq("dream_id", id).maybeSingle(),
      supabase.from("dream_people").select("*").eq("dream_id", id).order("name"),
      supabase.from("dream_symbols").select("*").eq("dream_id", id).order("category"),
      supabase.from("dream_processing").select("*").eq("dream_id", id).maybeSingle(),
    ]);

  if (!dream) notFound();

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dreams" className="text-sm text-text-muted">
          ← Your dreams
        </Link>
        <Link href={`/dreams/${id}/edit`} className="text-sm text-text-muted hover:text-text">
          Edit details
        </Link>
      </div>

      <p className="text-sm text-text-muted mb-1">
        {format(new Date(dream.dream_date), "EEEE, MMMM d, yyyy")}
      </p>
      <h1 className="text-2xl mb-8">
        {dream.title?.trim() || "Untitled dream"}
      </h1>

      <NarrativeSection dreamId={dream.id} narrative={dream.narrative} />

      <ExpandableSection
        title="Examination"
        summary={examination ? "Recorded" : "Not yet recorded"}
      >
        <ExaminationSection dreamId={dream.id} examination={examination ?? null} />
      </ExpandableSection>

      <ExpandableSection
        title="People and relationships"
        summary={people && people.length > 0 ? `${people.length} recorded` : undefined}
      >
        <PeopleSection dreamId={dream.id} people={people ?? []} />
      </ExpandableSection>

      <ExpandableSection
        title="Environmental and symbolic details"
        summary={symbols && symbols.length > 0 ? `${symbols.length} recorded` : undefined}
      >
        <SymbolsSection dreamId={dream.id} symbols={symbols ?? []} />
      </ExpandableSection>

      <ExpandableSection
        title="Processing"
        summary={processing ? "Recorded" : "Not yet recorded"}
      >
        <ProcessingSection dreamId={dream.id} processing={processing ?? null} />
      </ExpandableSection>

      <ExpandableSection
        title="Dream type"
        summary={dream.dream_type ?? "Not yet classified"}
      >
        <DreamTypeSection dreamId={dream.id} dreamType={dream.dream_type} />
      </ExpandableSection>
    </main>
  );
}
