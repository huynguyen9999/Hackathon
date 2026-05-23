"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type AskQuestionFormProps = {
  schoolShortName: string;
};

export function AskQuestionForm({ schoolShortName }: AskQuestionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/community/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school: schoolShortName,
          title: title.trim(),
          body: body.trim(),
          course_code: courseCode.trim() || undefined,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus(data.error ?? "Failed to post question.");
        return;
      }

      setTitle("");
      setBody("");
      setCourseCode("");
      setStatus("Question posted!");
      router.refresh();
    } catch {
      setStatus("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-dashed border-gaucho-blue/25 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
        New question
      </p>
      <input
        type="text"
        required
        placeholder="Title (e.g. Is ECE 152A really that hard?)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
      />
      <input
        type="text"
        placeholder="Course code (optional, e.g. COM SCI 35L)"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
      />
      <textarea
        required
        rows={3}
        placeholder="Details..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gaucho-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-gaucho-blue-light disabled:opacity-60 dark:bg-gaucho-gold dark:text-gaucho-blue-dark"
      >
        {submitting ? "Posting…" : "Post question"}
      </button>
      {status ? (
        <p className="text-xs text-slate-600 dark:text-slate-400">{status}</p>
      ) : null}
    </form>
  );
}
