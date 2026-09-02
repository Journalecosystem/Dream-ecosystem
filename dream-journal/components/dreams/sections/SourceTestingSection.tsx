import { upsertSourceTesting } from "@/lib/actions/source-testing";
import { Button } from "@/components/ui/Button";
import type { SourceTestingResponse } from "@/types/database";

const textareaClasses =
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm focus:border-lamp resize-y";

const QUESTIONS: { field: keyof SourceTestingResponse; label: string }[] = [
  { field: "christ_alignment", label: "Does this reading honor Jesus Christ?" },
  { field: "scriptural_alignment", label: "Does it contradict Scripture anywhere?" },
  { field: "character_alignment", label: "Does it align with the revealed character of God?" },
  { field: "fruit", label: "What kind of fruit does this interpretation produce?" },
  { field: "peace_and_wisdom", label: "Does it produce sober discernment, or fear and confusion?" },
  { field: "evidence", label: "What actual evidence supports it?" },
  { field: "personal_context", label: "Does it correspond to your current season?" },
  { field: "repetition", label: "Has this theme appeared repeatedly?" },
  { field: "confirmation", label: "Has anything outside the dream confirmed it?" },
  { field: "timing", label: "Has its significance become clearer over time?" },
  { field: "outcome", label: "What actually happened afterward, if anything yet?" },
];

export function SourceTestingSection({
  dreamId,
  interpretationId,
  response,
}: {
  dreamId: string;
  interpretationId: string | null;
  response: SourceTestingResponse | null;
}) {
  if (!interpretationId) {
    return (
      <p className="text-sm text-text-muted">
        Record an interpretation first. Source testing is applied to an
        interpretation, not to the dream on its own.
      </p>
    );
  }

  const action = upsertSourceTesting.bind(null, dreamId, interpretationId);

  return (
    <form action={action} className="space-y-5">
      <p className="text-sm text-text-muted">
        A strong emotional response is not the same as confirmation. These
        are questions for you to sit with, not to answer quickly.
      </p>
      {QUESTIONS.map(({ field, label }) => (
        <label key={field} className="block">
          <span className="block text-sm mb-1.5">{label}</span>
          <textarea
            name={field}
            rows={2}
            defaultValue={response?.[field] ?? ""}
            className={textareaClasses}
          />
        </label>
      ))}
      <Button type="submit" variant="quiet">
        Save answers
      </Button>
    </form>
  );
}
