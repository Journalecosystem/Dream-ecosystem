import { upsertProcessing } from "@/lib/actions/dreams";
import { Button } from "@/components/ui/Button";
import type { DreamProcessing } from "@/types/database";

const textareaClasses =
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-text focus:border-lamp resize-y";

export function ProcessingSection({
  dreamId,
  processing,
}: {
  dreamId: string;
  processing: DreamProcessing | null;
}) {
  const action = upsertProcessing.bind(null, dreamId);

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="block text-sm text-text-muted mb-1.5">
          What stood out, or could not be forgotten
        </span>
        <textarea
          name="unique_impressions"
          rows={3}
          defaultValue={processing?.unique_impressions ?? ""}
          className={textareaClasses}
        />
      </label>
      <label className="block">
        <span className="block text-sm text-text-muted mb-1.5">
          What Scriptures come to mind
        </span>
        <textarea
          name="scriptures_that_come_to_mind"
          rows={2}
          defaultValue={processing?.scriptures_that_come_to_mind ?? ""}
          className={textareaClasses}
        />
      </label>
      <label className="block">
        <span className="block text-sm text-text-muted mb-1.5">
          What personal experiences connect with this
        </span>
        <textarea
          name="personal_experiences_connected"
          rows={2}
          defaultValue={processing?.personal_experiences_connected ?? ""}
          className={textareaClasses}
        />
      </label>
      <label className="block">
        <span className="block text-sm text-text-muted mb-1.5">
          What current circumstances may be relevant
        </span>
        <textarea
          name="current_circumstances_relevant"
          rows={2}
          defaultValue={processing?.current_circumstances_relevant ?? ""}
          className={textareaClasses}
        />
      </label>
      <label className="block">
        <span className="block text-sm text-text-muted mb-1.5">
          Possible follow up actions, one per line
        </span>
        <textarea
          name="follow_up_actions"
          rows={3}
          placeholder="Research a symbol&#10;Pray and wait&#10;Talk with a trusted mature believer"
          defaultValue={processing?.follow_up_actions?.join("\n") ?? ""}
          className={textareaClasses}
        />
      </label>
      <Button type="submit" variant="quiet">
        Save processing
      </Button>
    </form>
  );
}
