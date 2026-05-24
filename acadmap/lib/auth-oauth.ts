export type OAuthProvider = "github" | "linkedin_oidc";

/** Only allow same-origin relative redirects after OAuth. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

export function safeNextPathFromSearchParams(
  params: URLSearchParams | { get: (key: string) => string | null },
): string {
  return safeNextPath(params.get("next"));
}
