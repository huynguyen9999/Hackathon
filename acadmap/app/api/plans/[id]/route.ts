import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import type { UpdatePlanInput } from "@/lib/planner/contracts";
import { getPlanForUser, updatePlan } from "@/lib/planner/db";

type RouteContext = {
  params: { id: string };
};

function isUpdatePlanInput(value: unknown): value is UpdatePlanInput {
  if (!value || typeof value !== "object") return false;
  return true;
}

export async function GET(_request: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is required." }, { status: 503 });
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const plan = await getPlanForUser(params.id, userId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("[GET /api/plans/[id]]", error);
    return NextResponse.json({ error: "Failed to load plan." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
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

  if (!isUpdatePlanInput(body)) {
    return NextResponse.json({ error: "Invalid update payload." }, { status: 400 });
  }

  try {
    const plan = await updatePlan(params.id, userId, body);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("[PATCH /api/plans/[id]]", error);
    const message = error instanceof Error ? error.message : "Failed to update plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
