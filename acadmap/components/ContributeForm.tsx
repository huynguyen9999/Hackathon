"use client";

import Link from "next/link";
import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";

import type { SeedRoadmapInput } from "@/lib/types";
import { isSeedRoadmapInput } from "@/lib/validate-seed";

export type ContributeFormProps = {
  onSubmit: (data: SeedRoadmapInput) => void | Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
};

function parseSeedJson(raw: string): { ok: true; data: SeedRoadmapInput } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON. Check brackets, commas, and quotes." };
  }

  if (!isSeedRoadmapInput(parsed)) {
    return {
      ok: false,
      error:
        "Invalid seed format. Required: school, major, nodes[] (with positions), edges[] referencing node ids.",
    };
  }

  return { ok: true, data: parsed };
}

export function ContributeForm({
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = "",
}: ContributeFormProps) {
  const [jsonText, setJsonText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const formDisabled = disabled || isSubmitting;

  const inputClass =
    "w-full rounded-lg border border-gaucho-blue-light/25 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-gaucho-gold/50 focus:ring-2 focus:ring-gaucho-gold/20";

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setJsonText(text);
      const result = parseSeedJson(text);
      setParseError(result.ok ? null : result.error);
    } catch {
      setParseError("Could not read the selected file.");
    }

    e.target.value = "";
  }, []);

  const handleTextChange = useCallback((value: string) => {
    setJsonText(value);
    if (!value.trim()) {
      setParseError(null);
      return;
    }
    const result = parseSeedJson(value);
    setParseError(result.ok ? null : result.error);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = parseSeedJson(jsonText);
    if (!result.ok) {
      setParseError(result.error);
      return;
    }
    setParseError(null);
    await onSubmit(result.data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-5 rounded-xl border border-gaucho-blue-light/25 bg-white dark:bg-slate-900/60 p-6 shadow-lg ${formDisabled ? "pointer-events-none opacity-60" : ""} ${className}`}
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Submit a roadmap
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Upload or paste a seed JSON file with school, major, course/career nodes,
          and prerequisite edges. Submissions are reviewed before going live.
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Format matches files in{" "}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">data/seeds/</code>
          . See{" "}
          <Link
            href="/roadmap/ucsb/electrical-engineering"
            className="font-medium text-gaucho-blue underline underline-offset-2 dark:text-gaucho-gold"
          >
            UCSB EE
          </Link>{" "}
          for a live example graph built from a seed file.
        </p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/90">
          Upload JSON file
        </span>
        <input
          type="file"
          accept=".json,application/json"
          disabled={formDisabled}
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-gaucho-blue file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-gaucho-blue-light dark:text-slate-400"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/90">
          Or paste seed JSON
        </span>
        <textarea
          rows={14}
          required
          disabled={formDisabled}
          value={jsonText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={'{\n  "school": { "name": "...", "short_name": "ucsb" },\n  "major": { "name": "...", "slug": "...", "degree_type": "BS" },\n  "nodes": [...],\n  "edges": [...]\n}'}
          className={`${inputClass} resize-y font-mono text-xs`}
          spellCheck={false}
        />
      </label>

      {parseError && (
        <p
          className="rounded-lg border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300"
          role="alert"
        >
          {parseError}
        </p>
      )}

      <p className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600 dark:border-slate-700/60 dark:bg-slate-950/50 dark:text-slate-400">
        Submissions are tied to your account for attribution and review.
        Your roadmap will be saved with status <strong>pending</strong> until a
        maintainer approves it.
      </p>

      <button
        type="submit"
        disabled={formDisabled || !jsonText.trim() || Boolean(parseError)}
        className="w-full rounded-xl bg-gradient-to-r from-gaucho-blue to-gaucho-blue-light px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gaucho-blue-dark/30 transition hover:from-gaucho-blue-light hover:to-gaucho-gold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[160px]"
      >
        {isSubmitting ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
