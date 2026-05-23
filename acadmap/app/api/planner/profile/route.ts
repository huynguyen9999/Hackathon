import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getMyPlannerProfile, upsertMyPlannerProfile } from "@/lib/planner/db";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is required." }, { status: 503 });
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const profile = await getMyPlannerProfile(userId);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[GET /api/planner/profile]", error);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is required." }, { status: 503 });
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const displayName = (body as { displayName?: string }).displayName;
  if (typeof displayName !== "string") {
    return NextResponse.json({ error: "displayName is required." }, { status: 400 });
  }

  try {
    const profile = await upsertMyPlannerProfile(userId, displayName);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[PATCH /api/planner/profile]", error);
    const message = error instanceof Error ? error.message : "Failed to update profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
