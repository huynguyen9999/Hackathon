"use client";

import { useState } from "react";

import {
  ContributeForm,
  type ContributeFormData,
} from "@/components/ContributeForm";
import { isSupabaseConfigured } from "@/lib/env";

export default function ContributePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabaseReady = isSupabaseConfigured();

  const handleSubmit = async (data: ContributeFormData) => {
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
          "Thanks! Your contribution was received and will be reviewed.",
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
          Submit a new school and major so the community can build a roadmap
          together.
        </p>
      </header>

      {!supabaseReady && (
        <div
          className="mb-6 rounded-xl border border-gaucho-blue/30 bg-gaucho-gold/10 dark:bg-gaucho-blue/30 px-4 py-3 text-sm text-gaucho-blue dark:text-gaucho-gold-light/90"
          role="status"
        >
          <strong className="font-semibold">Auth required:</strong> Sign in
          with GitHub (Supabase) to submit roadmaps. POST expects the seed JSON
          format (school, major, nodes, edges). Set{" "}
          <code className="rounded bg-white dark:bg-slate-900 px-1 py-0.5 text-xs">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-white dark:bg-slate-900 px-1 py-0.5 text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          to enable persistence. See{" "}
          <code className="rounded bg-white dark:bg-slate-900 px-1 py-0.5 text-xs">
            docs/COMMUNITY-SETUP.md
          </code>{" "}
          for Supabase project creation, GitHub OAuth, and Vercel env setup.
        </div>
      )}

      {message && (
        <p
          className="mb-6 rounded-xl border border-gaucho-blue-light/30 bg-gaucho-blue/5 dark:bg-gaucho-blue-dark/40 px-4 py-3 text-sm text-gaucho-blue-dark dark:text-gaucho-gold-light"
          role="status"
        >
          {message}
        </p>
      )}

      <ContributeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
