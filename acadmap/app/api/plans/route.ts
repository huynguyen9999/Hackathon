import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createPlan, getUserPlans } from "@/lib/planner/db";
import type { CreatePlanInput } from "@/lib/planner/contracts";

function isCreatePlanInput(value: unknown): value is CreatePlanInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" &&
    typeof v.schoolShortName === "string" &&
    typeof v.majorSlug === "string"
  );
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ plans: [] });
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const plans = await getUserPlans(userId);
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("[GET /api/plans]", error);
    return NextResponse.json({ error: "Failed to load plans." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is required for collaborative planning." },
      { status: 503 },
    );
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

  if (!isCreatePlanInput(body)) {
    return NextResponse.json(
      { error: "Expected title, schoolShortName, and majorSlug." },
      { status: 400 },
    );
  }

  try {
    const plan = await createPlan({
      userId,
      title: body.title.trim(),
      schoolShortName: body.schoolShortName.trim().toLowerCase(),
      majorSlug: body.majorSlug.trim().toLowerCase(),
      roadmapId: body.roadmapId,
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/plans]", error);
    const message = error instanceof Error ? error.message : "Failed to create plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
