import type { CommunityQuestion } from "@/lib/community/types";

export type AskCommunityBoardProps = {
  schoolShortName: string;
  questions: CommunityQuestion[];
};

export function AskCommunityBoard({
  schoolShortName,
  questions,
}: AskCommunityBoardProps) {
  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-5 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/40">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Ask the community
        </h2>
        <a
          href={`/auth/sign-in?next=/schools/${schoolShortName}`}
          className="text-sm font-medium text-gaucho-blue dark:text-gaucho-gold hover:underline"
        >
          Sign in to ask
        </a>
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Scoped Q&amp;A from students — upvote helpful answers.
      </p>

      <ul className="mt-4 space-y-4">
        {questions.slice(0, 5).map((q) => (
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
            {q.answers[0] ? (
              <div className="mt-3 border-l-2 border-gaucho-gold/50 pl-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {q.answers[0].body}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {q.answers[0].is_verified_student ? "Verified student · " : ""}
                  {q.answers[0].vote_count} upvotes
                </p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
