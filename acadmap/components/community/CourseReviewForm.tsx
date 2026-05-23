"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type CourseReviewFormProps = {
  schoolShortName: string;
};

export function CourseReviewForm({ schoolShortName }: CourseReviewFormProps) {
  const router = useRouter();
  const [courseCode, setCourseCode] = useState("");
  const [rating, setRating] = useState(4);
  const [difficulty, setDifficulty] = useState(3);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/community/course-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school: schoolShortName,
          course_code: courseCode.trim(),
          rating,
          difficulty,
          body: body.trim() || undefined,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus(data.error ?? "Failed to submit review.");
        return;
      }

      setCourseCode("");
      setBody("");
      setStatus("Review submitted!");
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
        Review a course
      </p>
      <input
        type="text"
        required
        placeholder="Course code (e.g. COM SCI 32)"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-slate-600 dark:text-slate-400">
          Rating (1–5)
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
          />
        </label>
        <label className="text-xs text-slate-600 dark:text-slate-400">
          Difficulty (1–5)
          <input
            type="number"
            min={1}
            max={5}
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
          />
        </label>
      </div>
      <textarea
        rows={2}
        placeholder="Optional notes…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gaucho-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-gaucho-blue-light disabled:opacity-60 dark:bg-gaucho-gold dark:text-gaucho-blue-dark"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
    </form>
  );
}
