"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, getUserIdByEmail } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { dbErrorMessage, failTo } from "@/lib/actions/helpers";

export async function createCircle(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/admin/circles/new?error=Title+is+required");

  const facilitatorEmail = String(formData.get("facilitator_email") ?? "").trim();
  let facilitatorId: string | null = null;
  if (facilitatorEmail) {
    facilitatorId = await getUserIdByEmail(facilitatorEmail);
    if (!facilitatorId) {
      redirect(
        `/admin/circles/new?error=${encodeURIComponent(
          `No user found with email ${facilitatorEmail}`
        )}`
      );
    }
  }

  const { error } = await admin.from("circles").insert({
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    facilitator_id: facilitatorId,
  });

  if (error) {
    failTo("/admin/circles/new", dbErrorMessage(error));
  }

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

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    redirect(`/admin/circles/${circleId}/edit?error=Title+is+required`);
  }

  const bumpGuidelines = formData.get("bump_guidelines") === "on";

  const facilitatorEmail = String(formData.get("facilitator_email") ?? "").trim();
  let facilitatorId: string | null = null;
  if (facilitatorEmail) {
    facilitatorId = await getUserIdByEmail(facilitatorEmail);
    if (!facilitatorId) {
      redirect(
        `/admin/circles/${circleId}/edit?error=${encodeURIComponent(
          `No user found with email ${facilitatorEmail}`
        )}`
      );
    }
  }

  const { error } = await admin
    .from("circles")
    .update({
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      guidelines_version: bumpGuidelines
        ? (circle?.guidelines_version ?? 1) + 1
        : circle?.guidelines_version,
      facilitator_id: facilitatorId,
    })
    .eq("id", circleId);

  if (error) {
    failTo(`/admin/circles/${circleId}/edit`, dbErrorMessage(error));
  }

  revalidatePath("/admin/circles");
  revalidatePath(`/circles/${circleId}`);
  redirect("/admin/circles");
}
