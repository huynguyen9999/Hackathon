"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type PinAnnouncementFormProps = {
  schoolShortName: string;
};

export function PinAnnouncementForm({ schoolShortName }: PinAnnouncementFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/community/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school: schoolShortName,
          title: title.trim(),
          body: body.trim(),
          pinned: true,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus(data.error ?? "Failed to pin announcement.");
        return;
      }

      setTitle("");
      setBody("");
      setStatus("Announcement pinned!");
      router.refresh();
    } catch {
      setStatus("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-gaucho-gold/30 bg-gaucho-gold/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold">
        Maintainer — pin announcement
      </p>
      <input
        type="text"
        required
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
      />
      <textarea
        required
        rows={2}
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/40"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gaucho-gold px-4 py-2 text-sm font-semibold text-gaucho-blue-dark transition hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Pinning…" : "Pin announcement"}
      </button>
      {status ? <p className="text-xs text-slate-600">{status}</p> : null}
    </form>
  );
}
