import { NextResponse } from "next/server";

export const ROADMAP_LIST_CACHE =
  "public, s-maxage=3600, stale-while-revalidate=86400";

export const ROADMAP_DETAIL_CACHE =
  "public, s-maxage=3600, stale-while-revalidate=86400";

export function jsonWithCache(
  data: unknown,
  cacheControl: string,
  init?: ResponseInit,
): NextResponse {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", cacheControl);
  return NextResponse.json(data, {
    ...init,
    headers,
  });
}
