import { NextResponse } from "next/server";

import { isMaintainer, syncProfileFromSession } from "@/lib/community/auth";
import { isSupabaseConfigured } from "@/lib/env";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      signedIn: false,
      isMaintainer: false,
      email: null,
    });
  }

  const userId = await syncProfileFromSession();
  if (!userId) {
    return NextResponse.json({
      signedIn: false,
      isMaintainer: false,
      email: null,
    });
  }

  const { getUserEmail } = await import("@/lib/community/auth");
  const email = await getUserEmail();
  const maintainer = await isMaintainer(userId);

  return NextResponse.json({
    signedIn: true,
    isMaintainer: maintainer,
    email,
  });
}
