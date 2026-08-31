import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [dreams, examinations, people, symbols, processing] = await Promise.all([
    supabase.from("dreams").select("*").eq("user_id", user.id),
    supabase
      .from("dream_examinations")
      .select("*, dreams!inner(user_id)")
      .eq("dreams.user_id", user.id),
    supabase.from("dream_people").select("*, dreams!inner(user_id)").eq("dreams.user_id", user.id),
    supabase.from("dream_symbols").select("*, dreams!inner(user_id)").eq("dreams.user_id", user.id),
    supabase
      .from("dream_processing")
      .select("*, dreams!inner(user_id)")
      .eq("dreams.user_id", user.id),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    account_email: user.email,
    dreams: dreams.data ?? [],
    dream_examinations: examinations.data ?? [],
    dream_people: people.data ?? [],
    dream_symbols: symbols.data ?? [],
    dream_processing: processing.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="dream-journal-export.json"`,
    },
  });
}
