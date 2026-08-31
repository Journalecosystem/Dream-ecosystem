import { upsertExamination } from "@/lib/actions/dreams";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";
import type { DreamExamination } from "@/types/database";

const SLEEP_PREP_OPTIONS = [
  "Prayer",
  "Bible reading",
  "Worship",
  "Journaling",
  "Conversation",
  "Fasting",
  "Other",
];

const LAST_ENGAGEMENT_OPTIONS = [
  "Music",
  "Movie",
  "Social media",
  "Book",
  "Conversation",
  "Thought",
  "Work",
  "News",
  "Other",
];

export function ExaminationSection({
  dreamId,
  examination,
}: {
  dreamId: string;
  examination: DreamExamination | null;
}) {
  const action = upsertExamination.bind(null, dreamId);
  const prep = examination?.sleep_preparation ?? [];
  const engagement = examination?.last_engagement ?? [];

  return (
    <form action={action} className="space-y-6">
      <fieldset>
        <legend className="text-sm text-text-muted mb-2">
          How you prepared for sleep
        </legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {SLEEP_PREP_OPTIONS.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="sleep_preparation"
                value={option}
                defaultChecked={prep.includes(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm text-text-muted mb-2">
          Your last engagement before sleep
        </legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {LAST_ENGAGEMENT_OPTIONS.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="last_engagement"
                value={option}
                defaultChecked={engagement.includes(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">
            Sleep quality (1 to 5)
          </span>
          <input
            type="number"
            name="sleep_quality"
            min={1}
            max={5}
            defaultValue={examination?.sleep_quality ?? undefined}
            className={inputClasses}
          />
        </label>
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">
            How you felt waking up
          </span>
          <input
            type="text"
            name="waking_emotional_state"
            defaultValue={examination?.waking_emotional_state ?? ""}
            className={inputClasses}
          />
        </label>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="was_recurring"
            defaultChecked={examination?.was_recurring ?? false}
          />
          This dream was recurring
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="was_interrupted"
            defaultChecked={examination?.was_interrupted ?? false}
          />
          Sleep was interrupted
        </label>
      </div>

      <Button type="submit" variant="quiet">
        Save examination
      </Button>
    </form>
  );
}
