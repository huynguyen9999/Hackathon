import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { acceptPlanShareToken } from "@/lib/planner/db";

export async function POST(request: Request) {
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

  const token = (body as { token?: string })?.token?.trim();
  if (!token) {
    return NextResponse.json({ error: "token is required." }, { status: 400 });
  }

  try {
    const plan = await acceptPlanShareToken(token, userId);
    if (!plan) {
      return NextResponse.json({ error: "Share token is invalid or expired." }, { status: 404 });
    }
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("[POST /api/plans/accept-share]", error);
    const message = error instanceof Error ? error.message : "Failed to accept share token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
