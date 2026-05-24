"use client";

import Link from "next/link";
import { useState } from "react";

import { ContributeAuthBanner } from "@/components/ContributeAuthBanner";
import { ContributeForm } from "@/components/ContributeForm";
import type { NavAuthState } from "@/lib/auth-session";
import type { SeedRoadmapInput } from "@/lib/types";

type ContributePageClientProps = {
  auth: NavAuthState;
  contributeLive: boolean;
};

function ContributeComingSoon() {
  return (
    <div className="rounded-xl border border-gaucho-blue/15 bg-white p-8 shadow-lg dark:border-gaucho-gold/15 dark:bg-slate-900/60">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        Roadmap contributions opening soon
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        We&apos;re finishing sign-in and review workflows so students can submit
        degree roadmaps safely. In the meantime, explore official requirements
        and interactive graphs already live on the platform.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/explore" className="btn-primary text-sm">
          Explore majors
        </Link>
        <Link href="/schools" className="btn-secondary text-sm">
          Browse school hubs
        </Link>
      </div>
    </div>
  );
}

export function ContributePageClient({
  auth,
  contributeLive,
}: ContributePageClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = contributeLive && auth.configured && Boolean(auth.email);

  const handleSubmit = async (data: SeedRoadmapInput) => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        setMessage(body.error ?? "Submission failed. Please try again.");
        return;
      }

      setMessage(
        body.message ??
          "Thanks! Your roadmap was submitted for review.",
      );
    } catch {
      setMessage("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Contribute
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          {contributeLive
            ? "Share a degree roadmap for your major. Approved maps appear in Explore and school hubs."
            : "Help expand interactive degree maps for campuses across the US."}
        </p>
      </header>

      {!contributeLive ? (
        <ContributeComingSoon />
      ) : (
        <>
          <ContributeAuthBanner auth={auth} />

          {message && (
            <p
              className="mb-6 rounded-xl border border-gaucho-blue-light/30 bg-gaucho-blue/5 px-4 py-3 text-sm text-gaucho-blue-dark dark:bg-gaucho-blue-dark/40 dark:text-gaucho-gold-light"
              role="status"
            >
              {message}
            </p>
          )}

          <ContributeForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            disabled={!canSubmit}
          />
        </>
      )}
    </div>
  );
}
