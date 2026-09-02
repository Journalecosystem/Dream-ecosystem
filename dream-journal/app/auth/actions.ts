"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth?mode=signin&error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dreams");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/auth?mode=signup&error=${encodeURIComponent(error.message)}`);
  }

  // If your Supabase project has "Confirm email" enabled (Authentication,
  // Settings), signUp succeeds but returns no session until the user
  // clicks the link in their confirmation email. Send them to wait for
  // that instead of pretending they are signed in.
  if (!data.session) {
    redirect(`/auth/check-email?email=${encodeURIComponent(email)}`);
  }

  // First action after signing up should be capture, not an empty list.
  redirect("/dreams/new");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/update-password`,
  });

  // Always show the same confirmation, whether or not the email exists,
  // so this cannot be used to check which addresses have an account.
  if (error) {
    redirect(`/auth/reset-password?sent=1`);
  }
  redirect(`/auth/reset-password?sent=1`);
}
