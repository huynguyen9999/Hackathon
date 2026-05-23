"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { createBrowserClient } from "@/lib/supabase-browser";

type AuthState = {
  loading: boolean;
  email: string | null;
};

export function AuthControls() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>({ loading: true, email: null });

  const signInHref = useMemo(() => {
    const next = pathname || "/";
    return `/auth/sign-in?next=${encodeURIComponent(next)}`;
  }, [pathname]);

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setState({ loading: false, email: data.user?.email ?? null });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ loading: false, email: session?.user?.email ?? null });
      router.refresh();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  async function signOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (state.loading) {
    return <span className="text-xs text-slate-500">Checking session…</span>;
  }

  if (!state.email) {
    return (
      <Link
        href={signInHref}
        className="rounded-md border border-gaucho-blue/20 px-3 py-2 text-xs font-semibold text-gaucho-blue transition hover:bg-gaucho-blue/5 dark:border-gaucho-gold/25 dark:text-gaucho-gold-light"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[140px] truncate text-xs text-slate-500 md:inline">
        {state.email}
      </span>
      <button
        type="button"
        onClick={signOut}
        className="rounded-md border border-gaucho-gold/30 px-3 py-2 text-xs font-semibold text-gaucho-blue transition hover:bg-gaucho-gold/10 dark:text-gaucho-gold-light"
      >
        Sign out
      </button>
    </div>
  );
}
