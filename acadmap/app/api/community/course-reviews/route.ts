import { NextRequest, NextResponse } from "next/server";

import { syncProfileFromSession } from "@/lib/community/auth";
import { createServerClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";
import { getSchoolConfig } from "@/lib/schools/registry";

export async function GET(request: NextRequest) {
  const school = request.nextUrl.searchParams.get("school");
  const sort = request.nextUrl.searchParams.get("sort") ?? "top";

  if (!school) {
    return NextResponse.json({ error: "school required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    const { loadCommunityHubData } = await import("@/lib/community/data");
    const data = await loadCommunityHubData(school);
    return NextResponse.json({ reviews: data.course_reviews });
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("course_reviews")
    .select("*")
    .eq("school_short_name", school);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const agg: Record<
    string,
    { total: number; diff: number; count: number }
  > = {};
  for (const r of data ?? []) {
    if (!agg[r.course_code]) agg[r.course_code] = { total: 0, diff: 0, count: 0 };
    agg[r.course_code].total += r.rating;
    agg[r.course_code].diff += r.difficulty;
    agg[r.course_code].count += 1;
  }

  const reviews = Object.entries(agg)
    .map(([course_code, a]) => ({
      course_code,
      rating: Math.round((a.total / a.count) * 10) / 10,
      difficulty: Math.round((a.diff / a.count) * 10) / 10,
      review_count: a.count,
    }))
    .sort((a, b) =>
      sort === "top" ? b.review_count - a.review_count : b.rating - a.rating,
    );

  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase required" }, { status: 503 });
  }

  const userId = await syncProfileFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    school?: string;
    course_code?: string;
    rating?: number;
    difficulty?: number;
    body?: string;
  };

  if (
    !body.school ||
    !body.course_code?.trim() ||
    body.rating == null ||
    body.difficulty == null
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const config = await getSchoolConfig(body.school);
  if (!config) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("course_reviews")
    .insert({
      school_short_name: body.school,
      course_code: body.course_code.trim().toUpperCase(),
      rating: body.rating,
      difficulty: body.difficulty,
      body: body.body?.trim() || null,
      author_id: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data }, { status: 201 });
}
