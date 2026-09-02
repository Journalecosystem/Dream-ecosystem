import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { DreamInterpretation } from "@/types/database";

export function InterpretationSection({
  dreamId,
  interpretations,
}: {
  dreamId: string;
  interpretations: DreamInterpretation[];
}) {
  const [current, ...history] = interpretations;

  return (
    <div className="space-y-6">
      {current ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Version {current.version}, current
            </p>
            {current.confidence_level && (
              <p className="text-xs text-text-muted">
                Confidence {current.confidence_level} of 5
              </p>
            )}
          </div>
          {current.possible_meaning && (
            <p className="text-text">{current.possible_meaning}</p>
          )}
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {current.evidence_for && (
              <div>
                <p className="text-text-muted mb-1">Evidence for</p>
                <p>{current.evidence_for}</p>
              </div>
            )}
            {current.evidence_against && (
              <div>
                <p className="text-text-muted mb-1">Evidence against</p>
                <p>{current.evidence_against}</p>
              </div>
            )}
          </div>
          {current.unresolved_questions && (
            <div className="text-sm">
              <p className="text-text-muted mb-1">Still unresolved</p>
              <p>{current.unresolved_questions}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-text-muted">
          No interpretation recorded yet. This is a process of discernment,
          not something to rush.
        </p>
      )}

      <Link href={`/dreams/${dreamId}/interpret`}>
        <Button variant="quiet">
          {current ? "Record a new understanding" : "Begin interpreting"}
        </Button>
      </Link>

      {history.length > 0 && (
        <details className="pt-2">
          <summary className="text-sm text-text-muted cursor-pointer">
            Earlier versions ({history.length})
          </summary>
          <ul className="mt-4 space-y-4">
            {history.map((version) => (
              <li key={version.id} className="border-l-2 border-line pl-4 text-sm">
                <p className="text-xs text-text-muted mb-1">
                  Version {version.version}
                </p>
                {version.possible_meaning && <p>{version.possible_meaning}</p>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
