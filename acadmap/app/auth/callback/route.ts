import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const destination = next.startsWith("/") ? next : "/";

  if (!code) {
    return NextResponse.redirect(new URL(`/auth/sign-in?next=${encodeURIComponent(destination)}`, url.origin));
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/sign-in?next=${encodeURIComponent(destination)}&error=oauth`, url.origin),
    );
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
