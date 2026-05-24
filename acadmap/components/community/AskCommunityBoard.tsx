"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AnswerForm } from "@/components/community/AnswerForm";
import { AskQuestionForm } from "@/components/community/AskQuestionForm";
import { useCommunitySession } from "@/components/community/useCommunitySession";
import type { CommunityQuestion } from "@/lib/community/types";

export type AskCommunityBoardProps = {
  schoolShortName: string;
  questions: CommunityQuestion[];
};

export function AskCommunityBoard({
  schoolShortName,
  questions,
}: AskCommunityBoardProps) {
  const router = useRouter();
  const session = useCommunitySession();
  const [voteStatus, setVoteStatus] = useState<string | null>(null);

  async function upvoteAnswer(answerId: string) {
    setVoteStatus(null);
    const res = await fetch(`/api/community/answers/${answerId}/vote`, {
      method: "POST",
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setVoteStatus(data.error ?? "Could not vote.");
    }
  }

  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-5 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/40">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Ask the community
        </h2>
        {!session.loading && !session.signedIn ? (
          <Link
            href={`/auth/sign-in?next=/schools/${schoolShortName}`}
            className="text-sm font-medium text-gaucho-blue dark:text-gaucho-gold hover:underline"
          >
            Sign in to ask
          </Link>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Scoped Q&amp;A from students — upvote helpful answers.
      </p>

      {session.signedIn ? (
        <AskQuestionForm schoolShortName={schoolShortName} />
      ) : null}

      {voteStatus ? (
        <p className="mt-2 text-xs text-slate-500">{voteStatus}</p>
      ) : null}

      <ul className="mt-4 space-y-4">
        {questions.slice(0, 8).map((q) => (
          <li
            key={q.id}
            className="rounded-lg border border-slate-200 p-4 dark:border-gaucho-blue/25"
          >
            <div className="flex flex-wrap items-center gap-2">
              {q.course_code ? (
                <span className="rounded bg-gaucho-blue/10 px-2 py-0.5 text-xs font-medium text-gaucho-blue dark:bg-gaucho-gold/15 dark:text-gaucho-gold">
                  {q.course_code}
                </span>
              ) : null}
              <span className="text-xs text-slate-500">@{q.author_name}</span>
            </div>
            <p className="mt-2 font-medium text-slate-900 dark:text-white">
              {q.title}
            </p>
            {q.body ? (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {q.body}
              </p>
            ) : null}

            {q.answers.map((a) => (
              <div
                key={a.id}
                className="mt-3 border-l-2 border-gaucho-gold/50 pl-3"
              >
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {a.body}
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-xs text-slate-500">
                    {a.is_verified_student ? "Verified student · " : ""}
                    {a.vote_count} upvotes
                  </p>
                  {session.signedIn ? (
                    <button
                      type="button"
                      onClick={() => upvoteAnswer(a.id)}
                      className="text-xs font-medium text-gaucho-blue hover:underline dark:text-gaucho-gold"
                    >
                      Upvote
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            {q.answers.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No answers yet —{" "}
                {session.signedIn ? (
                  "be the first to reply below."
                ) : (
                  <>
                    <Link
                      href={`/auth/sign-in?next=/schools/${schoolShortName}`}
                      className="font-medium text-gaucho-blue underline underline-offset-2 dark:text-gaucho-gold"
                    >
                      sign in
                    </Link>{" "}
                    to be the first to reply.
                  </>
                )}
              </p>
            ) : null}

            {session.signedIn ? <AnswerForm questionId={q.id} /> : null}
          </li>
        ))}
      </ul>

      {questions.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No questions yet — be the first to ask.
        </p>
      ) : null}
    </section>
  );
}
