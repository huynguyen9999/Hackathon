import { NextRequest, NextResponse } from "next/server";

import {
  isMaintainer,
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
    return NextResponse.json({ announcements: data.announcements });
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("school_announcements")
    .select("*")
    .eq("school_short_name", school)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ announcements: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase required" }, { status: 503 });
  }

  const userId = await syncProfileFromSession();
  if (!userId || !(await isMaintainer(userId))) {
    return NextResponse.json({ error: "Maintainer access required" }, { status: 403 });
  }

  const body = (await request.json()) as {
    school?: string;
    title?: string;
    body?: string;
    pinned?: boolean;
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
    .from("school_announcements")
    .insert({
      school_short_name: body.school,
      title: body.title.trim(),
      body: body.body.trim(),
      pinned: body.pinned ?? true,
      author_id: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ announcement: data }, { status: 201 });
}
