"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type AnswerFormProps = {
  questionId: string;
};

export function AnswerForm({ questionId }: AnswerFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/community/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus(data.error ?? "Failed to post answer.");
        return;
      }

      setBody("");
      setStatus("Answer posted!");
      router.refresh();
    } catch {
      setStatus("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        required
        rows={2}
        placeholder="Write an answer…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
      />
      <button
        type="submit"
        disabled={submitting}
        className="text-xs font-medium text-gaucho-blue hover:underline dark:text-gaucho-gold"
      >
        {submitting ? "Posting…" : "Reply"}
      </button>
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
    </form>
  );
}
