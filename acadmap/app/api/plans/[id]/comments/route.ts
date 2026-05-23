import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { addPlanComment, getPlanComments } from "@/lib/planner/db";

type RouteContext = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ comments: [] });
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const comments = await getPlanComments(params.id, userId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("[GET /api/plans/[id]/comments]", error);
    return NextResponse.json({ error: "Failed to load comments." }, { status: 500 });
  }
}

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

  const text = (body as { body?: string }).body?.trim();
  if (!text) {
    return NextResponse.json({ error: "Comment body is required." }, { status: 400 });
  }

  try {
    const comment = await addPlanComment(params.id, userId, text);
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/plans/[id]/comments]", error);
    const message = error instanceof Error ? error.message : "Failed to add comment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
