import { updateNarrative } from "@/lib/actions/dreams";
import { Button } from "@/components/ui/Button";

export function NarrativeSection({
  dreamId,
  narrative,
}: {
  dreamId: string;
  narrative: string;
}) {
  const action = updateNarrative.bind(null, dreamId);

  return (
    <section className="pb-6 mb-2">
      <form action={action} className="space-y-3">
        <textarea
          name="narrative"
          defaultValue={narrative}
          rows={8}
          className="w-full rounded-sm border border-line bg-paper px-4 py-3 text-lg leading-relaxed focus:border-lamp"
        />
        <Button type="submit" variant="quiet">
          Save narrative
        </Button>
      </form>
    </section>
  );
}
