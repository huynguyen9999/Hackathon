import { NextResponse } from "next/server";

import * as Sentry from "@sentry/nextjs";

import { getAuthenticatedUserId } from "@/lib/auth";
import { isMaintainer } from "@/lib/community/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { jsonWithCache, ROADMAP_DETAIL_CACHE } from "@/lib/http-cache";
import { getRoadmapDetailById } from "@/lib/roadmap";
import { createAdminClient } from "@/lib/supabase-admin";
import type { RoadmapStatus } from "@/lib/types";

type RouteContext = {
  params: { id: string };
};

const ALLOWED_STATUSES: RoadmapStatus[] = ["approved", "rejected"];

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = params;

  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing roadmap id" }, { status: 400 });
  }

  try {
    const roadmap = await getRoadmapDetailById(id);

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    if (roadmap.status !== "approved") {
      return NextResponse.json(
        { error: "Roadmap is not approved" },
        { status: 404 },
      );
    }

    return jsonWithCache({ roadmap }, ROADMAP_DETAIL_CACHE);
  } catch (error) {
    Sentry.captureException(error);
    console.error("[GET /api/roadmaps/[id]]", error);
    return NextResponse.json(
      { error: "Failed to load roadmap" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Submissions are not available right now. Please try again later." },
      { status: 503 },
    );
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const maintainer = await isMaintainer(userId);
  if (!maintainer) {
    return NextResponse.json({ error: "Maintainer access required." }, { status: 403 });
  }

  const { id } = params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing roadmap id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status =
    body && typeof body === "object" && "status" in body
      ? (body as { status: unknown }).status
      : null;

  if (typeof status !== "string" || !ALLOWED_STATUSES.includes(status as RoadmapStatus)) {
    return NextResponse.json(
      { error: 'Body must include status: "approved" or "rejected".' },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("roadmaps")
      .update({ status })
      .eq("id", id)
      .select("id, status, version, major_id")
      .maybeSingle();

    if (error) {
      Sentry.captureException(error);
      console.error("[PATCH /api/roadmaps/[id]]", error);
      return NextResponse.json({ error: "Failed to update roadmap." }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Roadmap not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: `Roadmap ${status}.`,
        roadmap: data,
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    Sentry.captureException(error);
    console.error("[PATCH /api/roadmaps/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update roadmap." },
      { status: 500 },
    );
  }
}
