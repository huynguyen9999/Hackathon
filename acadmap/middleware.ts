import { NextResponse, type NextRequest } from "next/server";

import { checkRoadmapRateLimit } from "@/lib/rate-limit";
import { updateSession } from "@/lib/supabase/middleware";

function isRoadmapApiPath(pathname: string): boolean {
  return pathname === "/api/roadmaps" || pathname.startsWith("/api/roadmaps/");
}

export async function middleware(request: NextRequest) {
  if (isRoadmapApiPath(request.nextUrl.pathname)) {
    const rateLimit = await checkRoadmapRateLimit(request);
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }
  }

  const supabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseConfigured) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
