"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type AlumniOutcomeFormProps = {
  schoolShortName: string;
};

export function AlumniOutcomeForm({ schoolShortName }: AlumniOutcomeFormProps) {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [majorSlug, setMajorSlug] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/community/alumni-outcomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school: schoolShortName,
          role: role.trim(),
          company: company.trim() || undefined,
          major_slug: majorSlug.trim() || undefined,
          grad_year: gradYear ? Number(gradYear) : undefined,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus(data.error ?? "Failed to submit.");
        return;
      }

      setRole("");
      setCompany("");
      setMajorSlug("");
      setGradYear("");
      setStatus("Submitted for moderation — thanks!");
      router.refresh();
    } catch {
      setStatus("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-dashed border-gaucho-blue/25 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
        Share where you landed
      </p>
      <input
        type="text"
        required
        placeholder="Role (e.g. Software Engineer)"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
      />
      <input
        type="text"
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Major slug (optional)"
          value={majorSlug}
          onChange={(e) => setMajorSlug(e.target.value)}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
        />
        <input
          type="number"
          placeholder="Grad year"
          value={gradYear}
          onChange={(e) => setGradYear(e.target.value)}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md border border-gaucho-blue/30 px-4 py-2 text-sm font-medium text-gaucho-blue transition hover:bg-gaucho-blue/5 dark:border-gaucho-gold/30 dark:text-gaucho-gold"
      >
        {submitting ? "Submitting…" : "Submit outcome"}
      </button>
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
    </form>
  );
}
