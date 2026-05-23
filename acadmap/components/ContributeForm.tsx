"use client";

import { useState, type FormEvent } from "react";

import type { ContributeFormData } from "@/lib/types";

export type { ContributeFormData };

export type ContributeFormProps = {
  onSubmit: (data: ContributeFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  className?: string;
};

const DEGREE_TYPES = [
  "Bachelor's",
  "Master's",
  "PhD",
  "Associate",
  "Certificate",
  "Other",
] as const;

const initialState: ContributeFormData = {
  schoolName: "",
  shortName: "",
  major: "",
  degreeType: "Bachelor's",
  contributorNotes: "",
};

export function ContributeForm({
  onSubmit,
  isSubmitting = false,
  className = "",
}: ContributeFormProps) {
  const [form, setForm] = useState<ContributeFormData>(initialState);

  const update = (field: keyof ContributeFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const inputClass =
    "w-full rounded-lg border border-gaucho-blue-light/25 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-gaucho-gold/50 focus:ring-2 focus:ring-gaucho-gold/20";

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-5 rounded-xl border border-gaucho-blue-light/25 bg-white dark:bg-slate-900/60 p-6 shadow-lg ${className}`}
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Contribute a roadmap</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Help the community by submitting your program&apos;s curriculum structure.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/90">
            School name
          </span>
          <input
            type="text"
            required
            value={form.schoolName}
            onChange={(e) => update("schoolName", e.target.value)}
            placeholder="University of Example"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/90">
            Short name
          </span>
          <input
            type="text"
            required
            value={form.shortName}
            onChange={(e) => update("shortName", e.target.value)}
            placeholder="UoE"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/90">
            Major
          </span>
          <input
            type="text"
            required
            value={form.major}
            onChange={(e) => update("major", e.target.value)}
            placeholder="Computer Science"
            className={inputClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/90">
            Degree type
          </span>
          <select
            required
            value={form.degreeType}
            onChange={(e) => update("degreeType", e.target.value)}
            className={inputClass}
          >
            {DEGREE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/90">
            Contributor notes
          </span>
          <textarea
            rows={4}
            value={form.contributorNotes}
            onChange={(e) => update("contributorNotes", e.target.value)}
            placeholder="Catalog year, specializations, prerequisites worth calling out..."
            className={`${inputClass} resize-y`}
          />
        </label>
      </div>

      <p className="rounded-lg border border-slate-300 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-950/50 px-3 py-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        Submissions are tied to your GitHub account for attribution and review.
        Sign in with GitHub before submitting so we can credit you and follow up
        on questions.
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-gradient-to-r from-gaucho-blue to-gaucho-blue-light px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gaucho-blue-dark/30 transition hover:from-gaucho-blue-light hover:to-gaucho-gold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[160px]"
      >
        {isSubmitting ? "Submitting…" : "Submit contribution"}
      </button>
    </form>
  );
}
