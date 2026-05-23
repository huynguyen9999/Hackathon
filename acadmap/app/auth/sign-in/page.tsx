"use client";

import { useState } from "react";

import { APP_NAME } from "@/lib/brand";
import { isSupabaseConfigured } from "@/lib/env";
import { createBrowserClient } from "@/lib/supabase-browser";

function safeNextPathFromLocation(): string {
  if (typeof window === "undefined") return "/";
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  return next && next.startsWith("/") ? next : "/";
}

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  async function signInWithGithub() {
    if (!supabaseReady) {
      setError("Supabase auth is not configured for this deployment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();
      const origin = window.location.origin;
      const nextPath = safeNextPathFromLocation();
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo },
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-xl border border-gaucho-blue/15 bg-white p-6 shadow-card dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/40">
        <h1 className="text-2xl font-semibold text-gaucho-blue dark:text-gaucho-gold-light">
          Sign in to {APP_NAME}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sign in with GitHub to save plans, share with advisors, and submit roadmap updates.
        </p>

        {!supabaseReady ? (
          <p className="mt-4 rounded-md border border-amber-500/30 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
            Supabase auth is not configured for this deployment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-md border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={signInWithGithub}
          disabled={loading || !supabaseReady}
          className="mt-6 w-full rounded-lg bg-gaucho-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gaucho-blue-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Redirecting…" : "Continue with GitHub"}
        </button>
      </div>
    </div>
  );
}
