import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";
import {
  getSchoolConfig,
  isEmailVerifiedForSchool,
} from "@/lib/schools/registry";

export async function ensureUserProfile(
  userId: string,
  email?: string | null,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = await createServerClient();
  const schools = await import("@/lib/schools/registry").then((m) =>
    m.listActiveSchools(),
  );

  let schoolShortName: string | null = null;
  let verifiedAt: string | null = null;

  if (email) {
    for (const school of await schools) {
      if (isEmailVerifiedForSchool(email, school)) {
        schoolShortName = school.short_name;
        verifiedAt = new Date().toISOString();
        break;
      }
    }
  }

  const { data: existing } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("user_profiles").insert({
      user_id: userId,
      display_name: email?.split("@")[0] ?? "Student",
      school_short_name: schoolShortName,
      verified_at: verifiedAt,
    });
  } else if (verifiedAt && schoolShortName) {
    await supabase
      .from("user_profiles")
      .update({
        school_short_name: schoolShortName,
        verified_at: verifiedAt,
      })
      .eq("user_id", userId);
  }
}

export async function isMaintainer(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("is_maintainer")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.is_maintainer === true;
}

export async function isVerifiedForSchool(
  userId: string,
  schoolShortName: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("verified_at, school_short_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data?.verified_at) return false;
  return data.school_short_name === schoolShortName;
}

export async function getUserEmail(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

export async function syncProfileFromSession(): Promise<string | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const email = await getUserEmail();
  await ensureUserProfile(userId, email);
  return userId;
}
