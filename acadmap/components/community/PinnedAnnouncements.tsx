"use client";

import { PinAnnouncementForm } from "@/components/community/PinAnnouncementForm";
import { useCommunitySession } from "@/components/community/useCommunitySession";
import type { PinnedAnnouncement } from "@/lib/community/types";

export type PinnedAnnouncementsProps = {
  schoolShortName: string;
  announcements: PinnedAnnouncement[];
};

export function PinnedAnnouncements({
  schoolShortName,
  announcements,
}: PinnedAnnouncementsProps) {
  const session = useCommunitySession();
  const pinned = announcements.filter((a) => a.pinned);

  return (
    <section className="space-y-3">
      {session.isMaintainer ? (
        <PinAnnouncementForm schoolShortName={schoolShortName} />
      ) : null}

      {pinned.length === 0 ? null : (
        <>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
            Pinned announcements
          </h2>
          {pinned.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-gaucho-gold/30 bg-gaucho-gold/10 p-4 dark:border-gaucho-gold/25 dark:bg-gaucho-blue-dark/40"
            >
              <p className="font-semibold text-slate-900 dark:text-white">
                {a.title}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {a.body}
              </p>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
