import { updateDreamType } from "@/lib/actions/dreams";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";

const SUGGESTIONS = [
  "Prophetic",
  "Vision",
  "Warning",
  "Directional",
  "Instructional",
  "Encouraging",
  "Revelatory",
  "Processing",
  "Recurring",
  "Symbolic",
  "Other",
];

export function DreamTypeSection({
  dreamId,
  dreamType,
}: {
  dreamId: string;
  dreamType: string | null;
}) {
  const action = updateDreamType.bind(null, dreamId);

  return (
    <form action={action} className="space-y-3">
      <p className="text-sm text-text-muted">
        This is your first impression, not a conclusion. Change it any time
        as your understanding develops.
      </p>
      <input
        list="dream-type-suggestions"
        name="dream_type"
        defaultValue={dreamType ?? ""}
        placeholder="How would you classify it right now"
        className={inputClasses}
      />
      <datalist id="dream-type-suggestions">
        {SUGGESTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      <Button type="submit" variant="quiet">
        Save classification
      </Button>
    </form>
  );
}
