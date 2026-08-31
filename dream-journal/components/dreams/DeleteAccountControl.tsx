"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";

export function DeleteAccountControl() {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setSubmitting(true);
    setError(null);
    const response = await fetch("/api/account/delete", { method: "POST" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }
    router.push("/");
  }

  if (!confirming) {
    return (
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Delete my account
      </Button>
    );
  }

  return (
    <div className="border border-danger/30 rounded-sm p-4 space-y-3">
      <p className="text-sm text-text">
        Type <span className="font-medium">DELETE</span> to confirm. This is
        permanent.
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(event) => setConfirmText(event.target.value)}
        className={inputClasses}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        <Button
          variant="danger"
          disabled={confirmText !== "DELETE" || submitting}
          onClick={handleDelete}
        >
          {submitting ? "Deleting…" : "Permanently delete account"}
        </Button>
        <Button variant="quiet" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
