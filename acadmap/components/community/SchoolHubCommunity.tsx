import { AlumniOutcomesFeed } from "@/components/community/AlumniOutcomesFeed";
import { AskCommunityBoard } from "@/components/community/AskCommunityBoard";
import { ContributorSpotlight } from "@/components/community/ContributorSpotlight";
import { CourseReviewLeaderboard } from "@/components/community/CourseReviewLeaderboard";
import { PinnedAnnouncements } from "@/components/community/PinnedAnnouncements";
import { RecentlyUpdatedRoadmaps } from "@/components/community/RecentlyUpdatedRoadmaps";
import type { CommunityHubData } from "@/lib/community/types";

export type SchoolHubCommunityProps = {
  schoolShortName: string;
  data: CommunityHubData;
};

export function SchoolHubCommunity({
  schoolShortName,
  data,
}: SchoolHubCommunityProps) {
  return (
    <div className="space-y-10">
      <PinnedAnnouncements announcements={data.announcements} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AskCommunityBoard
          schoolShortName={schoolShortName}
          questions={data.questions}
        />
        <ContributorSpotlight spotlight={data.contributor_spotlight} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentlyUpdatedRoadmaps roadmaps={data.recent_roadmaps ?? []} />
        <CourseReviewLeaderboard entries={data.course_reviews} />
      </div>

      <AlumniOutcomesFeed outcomes={data.alumni_outcomes} />
    </div>
  );
}
