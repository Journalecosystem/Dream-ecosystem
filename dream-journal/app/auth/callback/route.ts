import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Landing point for every link Supabase emails out (sign up confirmation,
// password reset). Two link styles are supported:
//
//   ?code=...                      PKCE link from the default email templates.
//                                  Only completes in the same browser that
//                                  asked for the email.
//   ?token_hash=...&type=email     Link from the recommended templates in the
//                                  README. Works on any device, which matters
//                                  because many people read email on a phone
//                                  and sign up on a laptop.
//
// On success the session cookie is set here, on the server, and the person
// is sent on to `next`.

// Only allow same-site relative paths, so this route can never be used to
// bounce someone to another website.
function safeNext(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback;
  }
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const next = safeNext(
    searchParams.get("next"),
    type === "recovery" ? "/auth/update-password" : "/dreams"
  );
  const isRecovery = type === "recovery" || next.startsWith("/auth/update-password");

  const supabase = await createClient();
  let failed = true;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    failed = Boolean(error);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
  }

  if (!failed) {
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (isRecovery) {
    return NextResponse.redirect(new URL("/auth/reset-password?expired=1", request.url));
  }

  // A code that cannot be exchanged usually means the link was opened in a
  // different browser from the one that signed up, or was already used. In
  // both cases the email is normally confirmed already, so sign in is the
  // right next step.
  return NextResponse.redirect(new URL("/auth?mode=signin&notice=link", request.url));
}
