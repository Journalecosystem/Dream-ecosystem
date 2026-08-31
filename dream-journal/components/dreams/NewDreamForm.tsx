"use client";

import { useState } from "react";
import { createDream } from "@/lib/actions/dreams";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";

export function NewDreamForm() {
  const [showDetails, setShowDetails] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={createDream} className="space-y-6">
      <textarea
        name="narrative"
        required
        autoFocus
        rows={10}
        placeholder="What happened in the dream? Write it as you remember it, in whatever order it comes back to you."
        className="w-full rounded-sm border border-line bg-paper px-4 py-3 text-lg leading-relaxed placeholder:text-text-muted focus:border-lamp"
      />

      {!showDetails ? (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="text-sm text-text-muted underline"
        >
          Add a title, date, or how it felt
        </button>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-line">
          <label className="block sm:col-span-2 pt-4">
            <span className="block text-sm text-text-muted mb-1.5">
              Title
            </span>
            <input
              type="text"
              name="title"
              placeholder="Optional"
              className={inputClasses}
            />
          </label>
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              Date
            </span>
            <input
              type="date"
              name="dream_date"
              defaultValue={today}
              className={inputClasses}
            />
          </label>
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              How you felt on waking
            </span>
            <input
              type="text"
              name="emotional_state"
              placeholder="Optional"
              className={inputClasses}
            />
          </label>
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              Clarity (1 to 5)
            </span>
            <input
              type="number"
              name="clarity_level"
              min={1}
              max={5}
              className={inputClasses}
            />
          </label>
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              Confidence in memory (1 to 5)
            </span>
            <input
              type="number"
              name="confidence_in_memory"
              min={1}
              max={5}
              className={inputClasses}
            />
          </label>
        </div>
      )}

      {/* Hidden date field ensures a value is submitted even if details are never expanded. */}
      {!showDetails && <input type="hidden" name="dream_date" value={today} />}

      <Button type="submit" className="px-6 py-3">
        Save dream
      </Button>
    </form>
  );
}
