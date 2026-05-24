"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { OAuthSignInButtons } from "@/components/OAuthSignInButtons";
import { APP_NAME } from "@/lib/brand";
import { safeNextPathFromSearchParams } from "@/lib/auth-oauth";
import { isSupabaseConfigured } from "@/lib/env";

function SignInForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const nextPath = safeNextPathFromSearchParams(searchParams);
  const supabaseReady = isSupabaseConfigured();

  return (
    <div className="rounded-xl border border-gaucho-blue/15 bg-white p-6 shadow-card dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/40">
      <h1 className="text-2xl font-semibold text-gaucho-blue dark:text-gaucho-gold-light">
        Sign in to {APP_NAME}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Sign in with GitHub or LinkedIn to save plans, share with advisors, and
        submit roadmap updates.
      </p>

      {!supabaseReady ? (
        <p className="mt-4 rounded-md border border-amber-500/30 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
          Sign-in is not available on this deployment yet.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <OAuthSignInButtons
        nextPath={nextPath}
        disabled={!supabaseReady}
        onError={setError}
        className="mt-6"
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <Suspense
        fallback={
          <div className="rounded-xl border border-gaucho-blue/15 bg-white p-6 dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/40">
            <p className="text-sm text-slate-500">Loading sign-in…</p>
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}
