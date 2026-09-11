"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function DeleteDreamControl({ action }: { action: () => void | Promise<void> }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button type="button" variant="danger" onClick={() => setConfirming(true)}>
        Delete this dream
      </Button>
    );
  }

  return (
    <div className="border border-danger/30 rounded-sm p-4 space-y-3">
      <p className="text-sm text-text">
        This deletes the dream and everything recorded against it —
        examinations, symbols, interpretations, fulfillment records. This
        cannot be undone.
      </p>
      <form action={action} className="flex gap-3">
        <Button type="submit" variant="danger">
          Yes, permanently delete
        </Button>
        <Button type="button" variant="quiet" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </form>
    </div>
  );
}
