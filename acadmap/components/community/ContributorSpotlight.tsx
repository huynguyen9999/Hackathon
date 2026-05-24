import type { ContributorSpotlight as ContributorSpotlightType } from "@/lib/community/types";

export type ContributorSpotlightProps = {
  spotlight: ContributorSpotlightType | null;
};

export function ContributorSpotlight({ spotlight }: ContributorSpotlightProps) {
  if (!spotlight?.display_name?.trim()) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 p-5 dark:border-gaucho-blue/30">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Contributor spotlight
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Be the first featured contributor — submit a roadmap on Contribute.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gaucho-blue/20 bg-gradient-to-br from-gaucho-blue/5 to-gaucho-gold/10 p-5 dark:from-gaucho-blue-dark/60 dark:to-gaucho-blue-dark/40">
      <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold">
        Contributor spotlight
      </p>
      <h2 className="mt-2 text-xl font-bold text-gaucho-blue dark:text-white">
        {spotlight.display_name}
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {spotlight.bio}
      </p>
      <p className="mt-4 text-sm font-medium text-gaucho-blue dark:text-gaucho-gold">
        {spotlight.contribution_count ?? 0} approved contribution
        {(spotlight.contribution_count ?? 0) !== 1 ? "s" : ""}
      </p>
    </section>
  );
}
