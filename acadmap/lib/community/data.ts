import { promises as fs } from "fs";
import path from "path";

import { isSupabaseConfigured } from "@/lib/env";
import { loadCoeCatalog } from "@/lib/school-catalog";
import { createServerClient } from "@/lib/supabase";
import type {
  AlumniOutcome,
  CommunityAnswer,
  CommunityHubData,
  CommunityQuestion,
  ContributorSpotlight,
  CourseReviewLeaderboardEntry,
  PinnedAnnouncement,
  RecentRoadmap,
} from "@/lib/community/types";

function catalogDateToIso(lastUpdated?: string): string {
  if (!lastUpdated) {
    return new Date().toISOString();
  }
  if (lastUpdated.includes("T")) {
    return lastUpdated;
  }
  return `${lastUpdated}T12:00:00.000Z`;
}

function normalizeCourseReviews(
  raw: unknown[],
): CourseReviewLeaderboardEntry[] {
  if (raw.length === 0) return [];

  const first = raw[0] as Record<string, unknown>;
  if (
    typeof first.review_count === "number" &&
    typeof first.difficulty === "number"
  ) {
    return raw as CourseReviewLeaderboardEntry[];
  }

  const agg: Record<string, { total: number; diff: number; count: number }> =
    {};
  for (const item of raw) {
    const row = item as Record<string, unknown>;
    const courseCode =
      typeof row.course_code === "string" ? row.course_code : null;
    if (!courseCode) continue;

    const rating = typeof row.rating === "number" ? row.rating : 4;
    const difficulty =
      typeof row.difficulty === "number" ? row.difficulty : 3.5;

    if (!agg[courseCode]) {
      agg[courseCode] = { total: 0, diff: 0, count: 0 };
    }
    agg[courseCode].total += rating;
    agg[courseCode].diff += difficulty;
    agg[courseCode].count += 1;
  }

  return Object.entries(agg)
    .map(([course_code, stats]) => ({
      course_code,
      rating: Math.round((stats.total / stats.count) * 10) / 10,
      difficulty: Math.round((stats.diff / stats.count) * 10) / 10,
      review_count: stats.count,
    }))
    .sort((a, b) => b.review_count - a.review_count);
}

function normalizeAlumniOutcomes(raw: unknown[]): AlumniOutcome[] {
  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    const gradYear =
      typeof row.grad_year === "number"
        ? row.grad_year
        : typeof row.graduation_year === "number"
          ? row.graduation_year
          : undefined;

    return {
      role: typeof row.role === "string" ? row.role : "Alumni",
      company: typeof row.company === "string" ? row.company : undefined,
      major_slug:
        typeof row.major_slug === "string" ? row.major_slug : undefined,
      grad_year: gradYear,
    };
  });
}

function normalizeContributorSpotlight(
  raw: unknown,
  schoolShortName: string,
): ContributorSpotlight | null {
  if (!raw || typeof raw !== "object") return null;

  const row = raw as Record<string, unknown>;
  const displayName =
    typeof row.display_name === "string" && row.display_name.trim()
      ? row.display_name.trim()
      : null;
  const bio =
    typeof row.bio === "string" && row.bio.trim()
      ? row.bio.trim()
      : typeof row.message === "string" && row.message.trim()
        ? row.message.trim()
        : null;

  if (!displayName && !bio) return null;

  return {
    display_name: displayName ?? "Community contributor",
    bio: bio ?? "Contributing roadmaps and major guides.",
    contribution_count:
      typeof row.contribution_count === "number"
        ? row.contribution_count
        : 1,
    school_short_name:
      typeof row.school_short_name === "string"
        ? row.school_short_name
        : schoolShortName,
  };
}

function normalizeDemoHubData(
  parsed: CommunityHubData,
  schoolShortName: string,
): CommunityHubData {
  const normalized = normalizeDemoHubDataFields(parsed, schoolShortName);
  return {
    ...normalized,
    questions: normalized.questions.filter((q) => q.answers.length > 0),
  };
}

function normalizeDemoHubDataFields(
  parsed: CommunityHubData,
  schoolShortName: string,
): CommunityHubData {
  return {
    ...parsed,
    course_reviews: normalizeCourseReviews(parsed.course_reviews ?? []),
    alumni_outcomes: normalizeAlumniOutcomes(parsed.alumni_outcomes ?? []),
    contributor_spotlight: normalizeContributorSpotlight(
      parsed.contributor_spotlight,
      schoolShortName,
    ),
  };
}

async function loadDemoHubData(schoolShortName: string): Promise<CommunityHubData> {
  const filePath = path.join(
    process.cwd(),
    "data",
    "demo",
    "community",
    `${schoolShortName.toLowerCase()}.json`,
  );
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as CommunityHubData;
    return normalizeDemoHubData(parsed, schoolShortName);
  } catch {
    return {
      announcements: [],
      questions: [],
      course_reviews: [],
      alumni_outcomes: [],
      contributor_spotlight: null,
      recent_roadmaps: [],
    };
  }
}

async function loadRecentRoadmapsFromSupabase(
  schoolShortName: string,
): Promise<RecentRoadmap[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerClient();
    const { data: school } = await supabase
      .from("schools")
      .select("id")
      .eq("short_name", schoolShortName.toLowerCase())
      .maybeSingle();

    if (!school?.id) return [];

    const { data: majors } = await supabase
      .from("majors")
      .select("id, name, slug")
      .eq("school_id", school.id);

    if (!majors?.length) return [];

    const majorById = new Map(majors.map((m) => [m.id, m]));
    const majorIds = majors.map((m) => m.id);

    const { data: roadmaps } = await supabase
      .from("roadmaps")
      .select("major_id, updated_at, created_at")
      .in("major_id", majorIds)
      .eq("status", "approved")
      .order("updated_at", { ascending: false })
      .limit(6);

    return (roadmaps ?? [])
      .map((row) => {
        const major = majorById.get(row.major_id);
        if (!major) return null;
        return {
          major_slug: major.slug,
          major_name: major.name,
          updated_at: row.updated_at ?? row.created_at,
          href: `/roadmap/${schoolShortName}/${major.slug}`,
        };
      })
      .filter((row): row is RecentRoadmap => row !== null);
  } catch {
    return [];
  }
}

async function loadRecentRoadmapsFromSeeds(
  schoolShortName: string,
): Promise<RecentRoadmap[]> {
  const catalog = await loadCoeCatalog(schoolShortName);
  const updatedAt = catalogDateToIso(catalog?.last_updated);

  const seedsDir = path.join(process.cwd(), "data", "seeds");
  try {
    const files = await fs.readdir(seedsDir);
    const prefix = `${schoolShortName.toLowerCase()}-`;
    const matches = files.filter((f) => f.startsWith(prefix) && f.endsWith(".json"));
    const roadmaps: RecentRoadmap[] = [];

    for (const file of matches.slice(0, 6)) {
      const raw = await fs.readFile(path.join(seedsDir, file), "utf-8");
      const seed = JSON.parse(raw) as {
        major?: { name?: string; slug?: string };
      };
      roadmaps.push({
        major_slug: seed.major?.slug ?? file.replace(prefix, "").replace(".json", ""),
        major_name: seed.major?.name ?? file,
        updated_at: updatedAt,
        href: `/roadmap/${schoolShortName}/${seed.major?.slug ?? ""}`,
      });
    }

    return roadmaps.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  } catch {
    return [];
  }
}

async function loadRecentRoadmaps(schoolShortName: string): Promise<RecentRoadmap[]> {
  const fromSupabase = await loadRecentRoadmapsFromSupabase(schoolShortName);
  if (fromSupabase.length > 0) return fromSupabase;
  return loadRecentRoadmapsFromSeeds(schoolShortName);
}

export async function loadCommunityHubData(
  schoolShortName: string,
): Promise<CommunityHubData> {
  const demo = await loadDemoHubData(schoolShortName);
  const recent_roadmaps = await loadRecentRoadmaps(schoolShortName);

  if (!isSupabaseConfigured()) {
    return {
      ...demo,
      recent_roadmaps: recent_roadmaps.length
        ? recent_roadmaps
        : (demo.recent_roadmaps ?? []),
    };
  }

  try {
    const supabase = await createServerClient();

    const [announcementsRes, questionsRes, reviewsRes, alumniRes] =
      await Promise.all([
        supabase
          .from("school_announcements")
          .select("*")
          .eq("school_short_name", schoolShortName)
          .order("pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("community_questions")
          .select("*")
          .eq("school_short_name", schoolShortName)
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("course_reviews")
          .select("course_code, rating, difficulty")
          .eq("school_short_name", schoolShortName),
        supabase
          .from("alumni_outcomes")
          .select("*")
          .eq("school_short_name", schoolShortName)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

    const hasDbData =
      (announcementsRes.data?.length ?? 0) > 0 ||
      (questionsRes.data?.length ?? 0) > 0;

    if (!hasDbData) {
      return {
        ...demo,
        recent_roadmaps: recent_roadmaps.length ? recent_roadmaps : [],
      };
    }

    const announcements: PinnedAnnouncement[] = (announcementsRes.data ?? []).map(
      (row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        pinned: row.pinned,
        created_at: row.created_at,
      }),
    );

    const questionIds = (questionsRes.data ?? []).map((q) => q.id);
    const answersByQuestion: Record<string, CommunityAnswer[]> = {};

    if (questionIds.length > 0) {
      const { data: answers } = await supabase
        .from("community_answers")
        .select("*")
        .in("question_id", questionIds);

      const answerIds = (answers ?? []).map((a) => a.id);
      const voteCounts: Record<string, number> = {};

      if (answerIds.length > 0) {
        const { data: votes } = await supabase
          .from("answer_votes")
          .select("answer_id")
          .in("answer_id", answerIds);
        for (const v of votes ?? []) {
          voteCounts[v.answer_id] = (voteCounts[v.answer_id] ?? 0) + 1;
        }
      }

      for (const a of answers ?? []) {
        const entry: CommunityAnswer = {
          id: a.id,
          body: a.body,
          author_name: "Student",
          is_verified_student: a.is_verified_student,
          vote_count: voteCounts[a.id] ?? 0,
        };
        if (!answersByQuestion[a.question_id]) {
          answersByQuestion[a.question_id] = [];
        }
        answersByQuestion[a.question_id].push(entry);
      }
    }

    const questions: CommunityQuestion[] = (questionsRes.data ?? []).map((q) => ({
      id: q.id,
      title: q.title,
      body: q.body,
      course_code: q.course_code ?? undefined,
      major_slug: q.major_slug ?? undefined,
      author_name: "Student",
      created_at: q.created_at,
      answers: answersByQuestion[q.id] ?? [],
    }));

    const reviewAgg: Record<string, { total: number; count: number; diff: number }> =
      {};
    for (const r of reviewsRes.data ?? []) {
      if (!reviewAgg[r.course_code]) {
        reviewAgg[r.course_code] = { total: 0, count: 0, diff: 0 };
      }
      reviewAgg[r.course_code].total += r.rating;
      reviewAgg[r.course_code].diff += r.difficulty;
      reviewAgg[r.course_code].count += 1;
    }

    const course_reviews: CourseReviewLeaderboardEntry[] = Object.entries(reviewAgg)
      .map(([course_code, agg]) => ({
        course_code,
        rating: Math.round((agg.total / agg.count) * 10) / 10,
        difficulty: Math.round((agg.diff / agg.count) * 10) / 10,
        review_count: agg.count,
      }))
      .sort((a, b) => b.review_count - a.review_count)
      .slice(0, 10);

    const alumni_outcomes: AlumniOutcome[] = (alumniRes.data ?? []).map((o) => ({
      role: o.role,
      company: o.company ?? undefined,
      major_slug: o.major_slug ?? undefined,
      grad_year: o.grad_year ?? undefined,
    }));

    const contributor_spotlight = demo.contributor_spotlight;

    return {
      announcements,
      questions,
      course_reviews: course_reviews.length ? course_reviews : demo.course_reviews,
      alumni_outcomes: alumni_outcomes.length ? alumni_outcomes : demo.alumni_outcomes,
      contributor_spotlight,
      recent_roadmaps: recent_roadmaps.length ? recent_roadmaps : [],
    };
  } catch {
    return {
      ...demo,
      recent_roadmaps: recent_roadmaps.length ? recent_roadmaps : [],
    };
  }
}
