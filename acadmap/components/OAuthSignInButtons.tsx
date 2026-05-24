"use client";

import { useState } from "react";

import type { OAuthProvider } from "@/lib/auth-oauth";
import { safeNextPath } from "@/lib/auth-oauth";
import { isSupabaseConfigured } from "@/lib/env";
import { createBrowserClient } from "@/lib/supabase-browser";

export type OAuthSignInButtonsProps = {
  nextPath: string;
  layout?: "stack" | "inline";
  disabled?: boolean;
  className?: string;
  onError?: (message: string) => void;
};

const buttonBase =
  "inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export function OAuthSignInButtons({
  nextPath,
  layout = "stack",
  disabled = false,
  className = "",
  onError,
}: OAuthSignInButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(
    null,
  );
  const supabaseReady = isSupabaseConfigured();
  const destination = safeNextPath(nextPath);
  const formDisabled = disabled || !supabaseReady || loadingProvider !== null;

  async function signInWith(provider: OAuthProvider) {
    if (!supabaseReady || disabled) {
      onError?.("Sign-in is not available on this deployment yet.");
      return;
    }

    setLoadingProvider(provider);

    try {
      const supabase = createBrowserClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(destination)}`;

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (signInError) {
        onError?.(signInError.message);
        setLoadingProvider(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in";
      onError?.(message);
      setLoadingProvider(null);
    }
  }

  const layoutClass =
    layout === "inline"
      ? "flex flex-wrap gap-3"
      : "flex flex-col gap-3";

  return (
    <div className={`${layoutClass} ${className}`}>
      <button
        type="button"
        onClick={() => signInWith("github")}
        disabled={formDisabled}
        className={`${buttonBase} bg-gaucho-blue text-white hover:bg-gaucho-blue-light`}
      >
        {loadingProvider === "github" ? "Redirecting…" : "Continue with GitHub"}
      </button>
      <button
        type="button"
        onClick={() => signInWith("linkedin_oidc")}
        disabled={formDisabled}
        className={`${buttonBase} bg-[#0A66C2] text-white hover:bg-[#004182]`}
      >
        {loadingProvider === "linkedin_oidc"
          ? "Redirecting…"
          : "Continue with LinkedIn"}
      </button>
    </div>
  );
}
