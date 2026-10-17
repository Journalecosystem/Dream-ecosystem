import { signIn, signUp } from "./actions";
import { inputClasses } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";
  const error = params.error;
  // Fixed messages keyed by code, never free text from the URL.
  const notice =
    params.notice === "link"
      ? "If you just confirmed your email, you can sign in now. If the link did not work, it may have expired or been opened on another device."
      : null;

  return (
    <main id="main" className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-sm text-text-muted mb-10">
          Dream Journal
        </Link>

        <h1 className="text-2xl mb-1">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-text-muted text-base mb-8">
          {mode === "signup"
            ? "A private place to keep what you remember."
            : "Sign in to return to your journal."}
        </p>

        {notice && (
          <p className="text-base text-text mb-4 border border-line rounded-sm px-3 py-3">
            {notice}
          </p>
        )}

        {error && (
          <p className="text-base text-danger mb-4 border border-danger/30 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <form
          action={mode === "signup" ? signUp : signIn}
          className="space-y-4"
        >
          <label className="block">
            <span className="block text-base text-text-muted mb-1.5">Email</span>
            <input
              type="email"
              name="email"
              required
              className={inputClasses}
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="block text-base text-text-muted mb-1.5">
              Password
            </span>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className={inputClasses}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
            />
          </label>
          {mode === "signup" && (
            <p className="text-sm text-text-muted">
              At least 8 characters.
            </p>
          )}
          <Button type="submit" className="w-full mt-2">
            {mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        {mode === "signin" && (
          <p className="text-base text-text-muted mt-4">
            <Link href="/auth/reset-password" className="underline">
              Forgot your password?
            </Link>
          </p>
        )}

        <p className="text-base text-text-muted mt-6">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link href="/auth?mode=signin" className="text-ink underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/auth?mode=signup" className="text-ink underline">
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
