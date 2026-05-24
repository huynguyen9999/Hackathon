"use client";

import { useState } from "react";

import { ContributeAuthBanner } from "@/components/ContributeAuthBanner";
import { ContributeForm } from "@/components/ContributeForm";
import type { NavAuthState } from "@/lib/auth-session";
import type { SeedRoadmapInput } from "@/lib/types";

type ContributePageClientProps = {
  auth: NavAuthState;
};

export function ContributePageClient({ auth }: ContributePageClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = auth.configured && Boolean(auth.email);

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
          Submit a seed JSON roadmap for review. Approved maps appear in Explore
          and school hubs.
        </p>
      </header>

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
    </div>
  );
}
