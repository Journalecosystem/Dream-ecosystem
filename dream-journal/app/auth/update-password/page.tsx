"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { inputClasses } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    // /auth/callback already turned the emailed link into a session cookie
    // before this page loaded.
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    router.push("/dreams");
  }

  return (
    <main id="main" className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-base text-text-muted mb-10">
          Dream Journal
        </Link>

        <h1 className="text-2xl mb-1">Set a new password</h1>
        <p className="text-text-muted text-base mb-8">
          This link only works once. If it has expired, request a new one.
        </p>

        {error && (
          <p className="text-base text-danger mb-4 border border-danger/30 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-base text-text-muted mb-1.5">
              New password
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className={inputClasses}
            />
          </label>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving…" : "Save new password"}
          </Button>
        </form>

        <p className="text-base text-text-muted mt-6">
          <Link href="/auth/reset-password" className="underline">
            Request a new link
          </Link>
        </p>
      </div>
    </main>
  );
}
