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
import { InterpretationSection } from "@/components/dreams/sections/InterpretationSection";
import { SourceTestingSection } from "@/components/dreams/sections/SourceTestingSection";
import { FulfillmentSection } from "@/components/dreams/sections/FulfillmentSection";
import { ErrorNotice } from "@/components/ui/ErrorNotice";

export default async function DreamDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; open?: string }>;
}) {
  const { id } = await params;
  // `error` and `open` come back from a failed save: the message is shown at
  // the top and the section the person was working in stays expanded.
  const { error, open } = await searchParams;
  const supabase = await createClient();

  const [{ data: dream }, { data: examination }, { data: people }, { data: symbols }, { data: processing }, { data: interpretations }] =
    await Promise.all([
      supabase.from("dreams").select("*").eq("id", id).single(),
      supabase.from("dream_examinations").select("*").eq("dream_id", id).maybeSingle(),
      supabase.from("dream_people").select("*").eq("dream_id", id).order("name"),
      supabase.from("dream_symbols").select("*").eq("dream_id", id).order("category"),
      supabase.from("dream_processing").select("*").eq("dream_id", id).maybeSingle(),
      supabase
        .from("dream_interpretations")
        .select("*")
        .eq("dream_id", id)
        .order("version", { ascending: false }),
    ]);

  if (!dream) notFound();

  const currentInterpretation = interpretations?.[0] ?? null;
  const [{ data: sourceTesting }, { data: fulfillmentRecords }] = await Promise.all([
    currentInterpretation
      ? supabase
          .from("source_testing_responses")
          .select("*")
          .eq("interpretation_id", currentInterpretation.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("fulfillment_records")
      .select("*")
      .eq("dream_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <main id="main" className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dreams" className="text-sm text-text-muted">
          ← Your dreams
        </Link>
        <Link href={`/dreams/${id}/edit`} className="text-sm text-text-muted hover:text-text">
          Edit details
        </Link>
      </div>

      <ErrorNotice message={error} />

      <p className="text-sm text-text-muted mb-1">
        {format(new Date(dream.dream_date), "EEEE, MMMM d, yyyy")}
        {dream.capture_method === "voice" && <span> · captured by voice</span>}
      </p>
      <h1 className="text-2xl mb-8">
        {dream.title?.trim() || "Untitled dream"}
      </h1>

      <NarrativeSection dreamId={dream.id} narrative={dream.narrative} />

      <ExpandableSection
        title="Examination"
        defaultOpen={open === "examination"}
        summary={examination ? "Recorded" : "Not yet recorded"}
      >
        <ExaminationSection dreamId={dream.id} examination={examination ?? null} />
      </ExpandableSection>

      <ExpandableSection
        title="People and relationships"
        defaultOpen={open === "people"}
        summary={people && people.length > 0 ? `${people.length} recorded` : undefined}
      >
        <PeopleSection dreamId={dream.id} people={people ?? []} />
      </ExpandableSection>

      <ExpandableSection
        title="Environmental and symbolic details"
        defaultOpen={open === "symbols"}
        summary={symbols && symbols.length > 0 ? `${symbols.length} recorded` : undefined}
      >
        <SymbolsSection dreamId={dream.id} symbols={symbols ?? []} />
      </ExpandableSection>

      <ExpandableSection
        title="Processing"
        defaultOpen={open === "processing"}
        summary={processing ? "Recorded" : "Not yet recorded"}
      >
        <ProcessingSection dreamId={dream.id} processing={processing ?? null} />
      </ExpandableSection>

      <ExpandableSection
        title="Interpretation"
        defaultOpen={open === "interpretation"}
        summary={interpretations && interpretations.length > 0 ? `Version ${interpretations[0].version}` : "Not started"}
      >
        <InterpretationSection dreamId={dream.id} interpretations={interpretations ?? []} />
      </ExpandableSection>

      <ExpandableSection
        title="Source testing"
        defaultOpen={open === "source-testing"}
        summary={sourceTesting ? "Recorded" : undefined}
      >
        <SourceTestingSection
          dreamId={dream.id}
          interpretationId={currentInterpretation?.id ?? null}
          response={sourceTesting ?? null}
        />
      </ExpandableSection>

      <ExpandableSection
        title="Fulfillment"
        defaultOpen={open === "fulfillment"}
        summary={fulfillmentRecords && fulfillmentRecords.length > 0 ? `${fulfillmentRecords.length} recorded` : undefined}
      >
        <FulfillmentSection dreamId={dream.id} records={fulfillmentRecords ?? []} />
      </ExpandableSection>

      <ExpandableSection
        title="Dream type"
        defaultOpen={open === "dream-type"}
        summary={dream.dream_type ?? "Not yet classified"}
      >
        <DreamTypeSection dreamId={dream.id} dreamType={dream.dream_type} />
      </ExpandableSection>
    </main>
  );
}
