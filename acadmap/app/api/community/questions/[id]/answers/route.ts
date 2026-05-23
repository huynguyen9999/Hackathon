import { NextRequest, NextResponse } from "next/server";

import {
  isVerifiedForSchool,
  syncProfileFromSession,
} from "@/lib/community/auth";
import { createServerClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";
import { getSchoolConfig } from "@/lib/schools/registry";

type RouteParams = { params: { id: string } };

export async function POST(request: NextRequest, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase required" }, { status: 503 });
  }

  const userId = await syncProfileFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    body?: string;
    school?: string;
  };

  if (!body.body?.trim()) {
    return NextResponse.json({ error: "Answer body required" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: question } = await supabase
    .from("community_questions")
    .select("school_short_name")
    .eq("id", params.id)
    .maybeSingle();

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const verified = await isVerifiedForSchool(userId, question.school_short_name);

  const { data, error } = await supabase
    .from("community_answers")
    .insert({
      question_id: params.id,
      body: body.body.trim(),
      author_id: userId,
      is_verified_student: verified,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ answer: data }, { status: 201 });
}
