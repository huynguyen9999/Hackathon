import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getPlanMembers, managePlanMember } from "@/lib/planner/db";

type RouteContext = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is required." }, { status: 503 });
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const result = await getPlanMembers(params.id, userId);
    if (!result) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/plans/[id]/members]", error);
    return NextResponse.json({ error: "Failed to load collaborators." }, { status: 500 });
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

  const targetUserId = (body as { targetUserId?: string }).targetUserId?.trim();
  const role = (body as { role?: "advisor" | "viewer" }).role;
  const remove = Boolean((body as { remove?: boolean }).remove);

  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId is required." }, { status: 400 });
  }

  if (!remove && role !== "advisor" && role !== "viewer") {
    return NextResponse.json(
      { error: "role must be advisor or viewer unless remove=true." },
      { status: 400 },
    );
  }

  try {
    const result = await managePlanMember({
      planId: params.id,
      actorUserId: userId,
      targetUserId,
      role,
      remove,
    });

    if (!result) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PATCH /api/plans/[id]/members]", error);
    const message = error instanceof Error ? error.message : "Failed to update collaborator.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
