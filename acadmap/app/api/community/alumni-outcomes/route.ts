import { NextRequest, NextResponse } from "next/server";

import { syncProfileFromSession } from "@/lib/community/auth";
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
    return NextResponse.json({ outcomes: data.alumni_outcomes });
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("alumni_outcomes")
    .select("*")
    .eq("school_short_name", school)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ outcomes: data ?? [] });
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
    role?: string;
    company?: string;
    major_slug?: string;
    grad_year?: number;
    body?: string;
  };

  if (!body.school || !body.role?.trim()) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const config = await getSchoolConfig(body.school);
  if (!config) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("alumni_outcomes")
    .insert({
      school_short_name: body.school,
      role: body.role.trim(),
      company: body.company?.trim() || null,
      major_slug: body.major_slug?.trim() || null,
      grad_year: body.grad_year ?? null,
      body: body.body?.trim() || null,
      author_id: userId,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ outcome: data }, { status: 201 });
}
