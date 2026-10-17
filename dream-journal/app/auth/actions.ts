"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

const MIN_PASSWORD_LENGTH = 8;

type AuthLikeError = { message: string; code?: string; status?: number };

// Turns Supabase's raw error into something a person can act on. The raw
// messages ("email rate limit exceeded", "Invalid login credentials") read
// like a crash to someone who is just trying to create an account.
function friendlyAuthError(error: AuthLikeError): string {
  const message = error.message.toLowerCase();

  switch (error.code) {
    case "over_email_send_rate_limit":
      return "Too many emails were requested recently. Please wait a few minutes and try again.";
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a moment and try again.";
    case "invalid_credentials":
      return "That email and password do not match. Check both and try again.";
    case "weak_password":
      return `Choose a stronger password of at least ${MIN_PASSWORD_LENGTH} characters.`;
    case "email_address_invalid":
      return "That email address does not look valid.";
    case "signup_disabled":
      return "New sign ups are currently turned off.";
    case "email_address_not_authorized":
      return "This server is not yet able to send email to that address. Please contact the administrator.";
  }

  if (message.includes("rate limit")) {
    return "Too many emails were requested recently. Please wait a few minutes and try again.";
  }
  if (message.includes("invalid login credentials")) {
    return "That email and password do not match. Check both and try again.";
  }
  return error.message;
}

function readEmail(formData: FormData): string {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

export async function signIn(formData: FormData) {
  const email = readEmail(formData);
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Someone who signed up but never confirmed should be offered a new
    // confirmation email, not a dead end.
    if (error.code === "email_not_confirmed") {
      redirect(
        `/auth/check-email?email=${encodeURIComponent(email)}&unconfirmed=1`
      );
    }
    redirect(
      `/auth?mode=signin&error=${encodeURIComponent(friendlyAuthError(error))}`
    );
  }

  redirect("/dreams");
}

export async function signUp(formData: FormData) {
  const email = readEmail(formData);
  const password = String(formData.get("password") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect(
      `/auth?mode=signup&error=${encodeURIComponent(
        `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.`
      )}`
    );
  }

  const supabase = await createClient();
  const origin = await getSiteUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Without this, Supabase falls back to the project's Site URL, which
      // is localhost:3000 until someone changes it. /auth/callback turns the
      // link into a real signed in session.
      emailRedirectTo: `${origin}/auth/callback?next=/dreams/new`,
    },
  });

  if (error) {
    redirect(
      `/auth?mode=signup&error=${encodeURIComponent(friendlyAuthError(error))}`
    );
  }

  // If your Supabase project has "Confirm email" enabled, signUp succeeds but
  // returns no session until the user clicks the link in their confirmation
  // email. Send them to wait for that instead of pretending they are signed in.
  //
  // For an address that already has a confirmed account, Supabase also
  // returns success with no session and sends nothing (deliberately, so
  // sign up cannot be used to discover who has an account). That case lands
  // here too, and the check-email page tells people what to do if no email
  // turns up, without revealing whether the account exists.
  if (!data.session) {
    redirect(`/auth/check-email?email=${encodeURIComponent(email)}`);
  }

  // First action after signing up should be capture, not an empty list.
  redirect("/dreams/new");
}

export async function resendConfirmation(formData: FormData) {
  const email = readEmail(formData);
  if (!email) redirect("/auth?mode=signup");

  const supabase = await createClient();
  const origin = await getSiteUrl();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/dreams/new` },
  });

  if (error) {
    redirect(
      `/auth/check-email?email=${encodeURIComponent(email)}&error=${encodeURIComponent(
        friendlyAuthError(error)
      )}`
    );
  }

  redirect(`/auth/check-email?email=${encodeURIComponent(email)}&resent=1`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  const email = readEmail(formData);
  const supabase = await createClient();
  const origin = await getSiteUrl();

  // The link goes through /auth/callback so the session is established on
  // the server before the person reaches the new password form.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });

  // Rate limiting is worth telling the person about; everything else shows
  // the same confirmation whether or not the email exists, so this cannot be
  // used to check which addresses have an account.
  if (error?.code === "over_email_send_rate_limit") {
    redirect(`/auth/reset-password?limited=1`);
  }
  redirect(`/auth/reset-password?sent=1`);
}
