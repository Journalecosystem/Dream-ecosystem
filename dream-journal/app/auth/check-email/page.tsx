import Link from "next/link";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-sm text-text-muted mb-10">
          Dream Journal
        </Link>

        <h1 className="text-2xl mb-3">Check your email</h1>
        <p className="text-text-muted text-sm">
          A confirmation link has been sent{email ? ` to ${email}` : ""}.
          Click it to activate your account, then come back and sign in.
          It may take a few minutes to arrive, and check your spam folder
          if not.
        </p>

        <p className="text-sm text-text-muted mt-8">
          <Link href="/auth?mode=signin" className="underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
