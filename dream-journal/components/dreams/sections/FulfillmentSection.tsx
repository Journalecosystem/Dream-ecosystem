import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import type { FulfillmentRecord } from "@/types/database";

const STATUS_LABELS: Record<string, string> = {
  possible_confirmation: "Possible confirmation",
  possible_fulfillment: "Possible fulfillment",
  confirmed: "Confirmed personal outcome",
  unfulfilled: "Unfulfilled or unresolved",
};

export function FulfillmentSection({
  dreamId,
  records,
}: {
  dreamId: string;
  records: FulfillmentRecord[];
}) {
  return (
    <div className="space-y-6">
      {records.length > 0 ? (
        <ul className="space-y-4">
          {records.map((record) => (
            <li key={record.id} className="border border-line rounded-sm p-4">
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-sm">
                  {record.status ? STATUS_LABELS[record.status] : "Recorded"}
                </p>
                {record.event_date && (
                  <time className="text-xs text-text-muted">
                    {format(new Date(record.event_date), "MMM d, yyyy")}
                  </time>
                )}
              </div>
              {record.event_description && (
                <p className="text-sm mb-1">{record.event_description}</p>
              )}
              {record.correspondence_notes && (
                <p className="text-sm text-text-muted">{record.correspondence_notes}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">
          A dream is not finished being useful once it is interpreted. Come
          back here any time, even years later, if something happens that
          connects to it.
        </p>
      )}

      <Link href={`/dreams/${dreamId}/fulfillment`}>
        <Button variant="quiet">Record an outcome</Button>
      </Link>

      {records.some((r) => r.status === "confirmed") && (
        <Link href={`/dreams/${dreamId}/testimony`} className="block">
          <Button variant="quiet">Record a testimony</Button>
        </Link>
      )}
    </div>
  );
}
