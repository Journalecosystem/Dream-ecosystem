"use client";

import { useState, useTransition } from "react";
import { setTestimonyPrivacy, rotateTestimonyShareToken } from "@/lib/actions/testimonies";

export function TestimonyPrivacyControl({
  testimonyId,
  isPrivate,
  shareToken,
}: {
  testimonyId: string;
  isPrivate: boolean;
  shareToken: string;
}) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function toggle() {
    startTransition(() => {
      setTestimonyPrivacy(testimonyId, !isPrivate);
    });
  }

  function rotate() {
    startTransition(() => {
      rotateTestimonyShareToken(testimonyId);
    });
  }

  async function copyLink() {
    const url = `${window.location.origin}/t/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (permissions, insecure context). The
      // link is still shown as text below so it can be selected manually.
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
      <button type="button" onClick={toggle} disabled={pending} className="underline">
        {isPrivate ? "Make shareable" : "Make private"}
      </button>
      {!isPrivate && (
        <>
          <button type="button" onClick={copyLink} className="underline">
            {copied ? "Link copied" : "Copy share link"}
          </button>
          <button type="button" onClick={rotate} disabled={pending} className="underline">
            Revoke old link
          </button>
        </>
      )}
    </div>
  );
}
