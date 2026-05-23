"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type PlanPayload = {
  id: string;
  schoolShortName: string;
  majorSlug: string;
  title: string;
  myRole: "owner" | "advisor" | "viewer";
};

export default function PlanShareRedeemPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanPayload | null>(null);

  const signInHref = useMemo(() => {
    return `/auth/sign-in?next=${encodeURIComponent(`/plan-share/${params.token}`)}`;
  }, [params.token]);

  useEffect(() => {
    let cancelled = false;

    async function redeem() {
      try {
        const res = await fetch("/api/plans/accept-share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: params.token }),
        });

        if (res.status === 401) {
          router.replace(signInHref);
          return;
        }

        const body = (await res.json()) as { error?: string; plan?: PlanPayload };

        if (!res.ok || !body.plan) {
          throw new Error(body.error ?? "Unable to redeem share link.");
        }

        if (!cancelled) {
          setPlan(body.plan);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to redeem share link.");
          setLoading(false);
        }
      }
    }

    void redeem();

    return () => {
      cancelled = true;
    };
  }, [params.token, router, signInHref]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center text-sm text-slate-600 dark:text-slate-300">
        Redeeming advisor share link...
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <div className="rounded-xl border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
          {error ?? "Share link is invalid."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-xl border border-gaucho-blue/20 bg-white p-6 shadow-card dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/30">
        <h1 className="text-xl font-semibold text-gaucho-blue dark:text-gaucho-gold-light">
          Share link accepted
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          You now have <strong>{plan.myRole}</strong> access to <strong>{plan.title}</strong>.
        </p>
        <Link
          href={`/roadmap/${plan.schoolShortName}/${plan.majorSlug}`}
          className="mt-5 inline-flex rounded-md bg-gaucho-blue px-3 py-2 text-sm font-semibold text-white transition hover:bg-gaucho-blue-light"
        >
          Open roadmap and planner
        </Link>
      </div>
    </div>
  );
}
