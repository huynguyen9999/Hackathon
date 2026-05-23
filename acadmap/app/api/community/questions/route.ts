import { NextRequest, NextResponse } from "next/server";

import {
  ensureUserProfile,
  isVerifiedForSchool,
  syncProfileFromSession,
} from "@/lib/community/auth";
import { createServerClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";
import { getSchoolConfig } from "@/lib/schools/registry";

export async function GET(request: NextRequest) {
  const school = request.nextUrl.searchParams.get("school");
  if (!school) {
    return NextResponse.json({ error: "school required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    const { loadCommunityHubData } = await import("@/lib/community/data");
    const data = await loadCommunityHubData(school);
    return NextResponse.json({ questions: data.questions });
  }

  const config = await getSchoolConfig(school);
  if (!config) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("community_questions")
    .select("*")
    .eq("school_short_name", school)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ questions: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Community posting requires Supabase configuration" },
      { status: 503 },
    );
  }

  const userId = await syncProfileFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    school?: string;
    title?: string;
    body?: string;
    course_code?: string;
    major_slug?: string;
  };

  if (!body.school || !body.title?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const config = await getSchoolConfig(body.school);
  if (!config) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("community_questions")
    .insert({
      school_short_name: body.school,
      title: body.title.trim(),
      body: body.body.trim(),
      course_code: body.course_code?.trim() || null,
      major_slug: body.major_slug?.trim() || null,
      author_id: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ question: data }, { status: 201 });
}
