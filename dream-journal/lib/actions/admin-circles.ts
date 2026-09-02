"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createCircle(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/admin/circles/new?error=Title+is+required");

  await admin.from("circles").insert({
    title,
    description: String(formData.get("description") ?? "").trim() || null,
  });

  revalidatePath("/admin/circles");
  revalidatePath("/circles");
  redirect("/admin/circles");
}

// Bumping the guidelines version requires every existing member to accept
// the guidelines again before they can post, since acceptance is checked
// against the circle's current guidelines_version, not just any acceptance.
export async function updateCircleGuidelines(circleId: string, formData: FormData) {
  const admin_user = await requireAdmin();
  void admin_user;
  const admin = createAdminClient();

  const { data: circle } = await admin
    .from("circles")
    .select("guidelines_version")
    .eq("id", circleId)
    .single();

  const bumpGuidelines = formData.get("bump_guidelines") === "on";

  await admin
    .from("circles")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      guidelines_version: bumpGuidelines
        ? (circle?.guidelines_version ?? 1) + 1
        : circle?.guidelines_version,
    })
    .eq("id", circleId);

  revalidatePath("/admin/circles");
  revalidatePath(`/circles/${circleId}`);
  redirect("/admin/circles");
}
