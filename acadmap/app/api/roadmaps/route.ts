import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import {
  getApprovedRoadmapList,
  insertRoadmapFromSeed,
} from "@/lib/roadmap";
import { isSeedRoadmapInput } from "@/lib/validate-seed";

export async function GET() {
  try {
    const roadmaps = await getApprovedRoadmapList();
    return NextResponse.json({ roadmaps });
  } catch (error) {
    console.error("[GET /api/roadmaps]", error);
    return NextResponse.json(
      { error: "Failed to load roadmaps" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
      { status: 503 },
    );
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required. Sign in with GitHub to contribute." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isSeedRoadmapInput(body)) {
    return NextResponse.json(
      {
        error:
          "Invalid payload. Expected seed format: school, major, nodes[], edges[].",
      },
      { status: 400 },
    );
  }

  try {
    const roadmap = await insertRoadmapFromSeed(body, userId);
    return NextResponse.json(
      {
        message: "Roadmap submitted for review.",
        roadmap: {
          id: roadmap.id,
          status: roadmap.status,
          version: roadmap.version,
          school: roadmap.school,
          major: roadmap.major,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/roadmaps]", error);
    const message =
      error instanceof Error ? error.message : "Failed to save roadmap";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
