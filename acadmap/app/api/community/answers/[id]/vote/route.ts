import { NextResponse } from "next/server";

import { syncProfileFromSession } from "@/lib/community/auth";
import { createServerClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";

type RouteParams = { params: { id: string } };

export async function POST(_request: Request, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase required" }, { status: 503 });
  }

  const userId = await syncProfileFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("answer_votes").insert({
    answer_id: params.id,
    user_id: userId,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase required" }, { status: 503 });
  }

  const userId = await syncProfileFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("answer_votes")
    .delete()
    .eq("answer_id", params.id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
