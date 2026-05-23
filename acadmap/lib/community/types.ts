export type PinnedAnnouncement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
};

export type CommunityAnswer = {
  id: string;
  body: string;
  author_name: string;
  is_verified_student: boolean;
  vote_count: number;
};

export type CommunityQuestion = {
  id: string;
  title: string;
  body: string;
  course_code?: string;
  major_slug?: string;
  author_name: string;
  created_at: string;
  answers: CommunityAnswer[];
};

export type CourseReviewLeaderboardEntry = {
  course_code: string;
  rating: number;
  difficulty: number;
  review_count: number;
};

export type AlumniOutcome = {
  role: string;
  company?: string;
  major_slug?: string;
  grad_year?: number;
};

export type ContributorSpotlight = {
  display_name: string;
  bio: string;
  contribution_count: number;
  school_short_name: string;
};

export type RecentRoadmap = {
  major_slug: string;
  major_name: string;
  updated_at: string;
  href: string;
};

export type CommunityHubData = {
  announcements: PinnedAnnouncement[];
  questions: CommunityQuestion[];
  course_reviews: CourseReviewLeaderboardEntry[];
  alumni_outcomes: AlumniOutcome[];
  contributor_spotlight: ContributorSpotlight | null;
  recent_roadmaps?: RecentRoadmap[];
};
