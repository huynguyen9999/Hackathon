import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/env";
import { createShareToken } from "@/lib/planner/db";

type RouteContext = {
  params: { id: string };
};

export async function POST(request: Request, { params }: RouteContext) {
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

  const role = (body as { role?: "advisor" | "viewer" })?.role ?? "viewer";
  const expiresAt = (body as { expiresAt?: string })?.expiresAt;

  if (role !== "advisor" && role !== "viewer") {
    return NextResponse.json({ error: "role must be advisor or viewer." }, { status: 400 });
  }

  try {
    const token = await createShareToken(params.id, userId, role, expiresAt);
    const shareUrl = `${getSiteUrl()}/plan-share/${token.token}`;
    return NextResponse.json({ token, shareUrl });
  } catch (error) {
    console.error("[POST /api/plans/[id]/share]", error);
    const message = error instanceof Error ? error.message : "Failed to create share token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
