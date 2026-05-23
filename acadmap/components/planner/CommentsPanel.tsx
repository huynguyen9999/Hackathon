"use client";

import { useEffect, useState } from "react";

type PlannerComment = {
  id: string;
  planId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export type CommentsPanelProps = {
  planId: string | null;
};

export function CommentsPanel({ planId }: CommentsPanelProps) {
  const [comments, setComments] = useState<PlannerComment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadComments() {
      if (!planId) {
        setComments([]);
        return;
      }

      try {
        const res = await fetch(`/api/plans/${planId}/comments`);
        const body = (await res.json()) as {
          comments?: PlannerComment[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(body.error ?? "Failed to load comments.");
        }
        if (active) {
          setComments(body.comments ?? []);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load comments.");
        }
      }
    }

    void loadComments();

    return () => {
      active = false;
    };
  }, [planId]);

  async function postComment() {
    if (!planId || !text.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/plans/${planId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim() }),
      });
      const body = (await res.json()) as {
        comment?: PlannerComment;
        error?: string;
      };
      if (!res.ok || !body.comment) {
        throw new Error(body.error ?? "Failed to post comment.");
      }
      setComments((prev) => [...prev, body.comment!]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-4 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
        Advisor comments
      </h2>

      {!planId ? (
        <p className="mt-2 text-xs text-slate-500">Save the plan once to enable comments.</p>
      ) : (
        <>
          <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-md bg-slate-50 px-2 py-1.5 text-xs text-slate-700 dark:bg-gaucho-blue-dark/50 dark:text-slate-200"
                >
                  <p>{comment.body}</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Leave a note for advisor/student"
              className="w-full rounded-md border border-gaucho-blue/15 bg-white px-2 py-2 text-sm dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/50"
            />
            <button
              type="button"
              onClick={postComment}
              disabled={loading || !text.trim()}
              className="rounded-md bg-gaucho-blue px-3 py-2 text-xs font-semibold text-white transition hover:bg-gaucho-blue-light disabled:opacity-60"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
          {error ? <p className="mt-2 text-xs text-red-600 dark:text-red-300">{error}</p> : null}
        </>
      )}
    </section>
  );
}
