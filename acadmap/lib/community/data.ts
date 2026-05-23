import { promises as fs } from "fs";
import path from "path";

import { createServerClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";
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
    return JSON.parse(raw) as CommunityHubData;
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

async function loadRecentRoadmapsFromSeeds(
  schoolShortName: string,
): Promise<RecentRoadmap[]> {
  const seedsDir = path.join(process.cwd(), "data", "seeds");
  try {
    const files = await fs.readdir(seedsDir);
    const prefix = `${schoolShortName.toLowerCase()}-`;
    const matches = files.filter((f) => f.startsWith(prefix) && f.endsWith(".json"));
    const roadmaps: RecentRoadmap[] = [];

    for (const file of matches.slice(0, 6)) {
      const stat = await fs.stat(path.join(seedsDir, file));
      const raw = await fs.readFile(path.join(seedsDir, file), "utf-8");
      const seed = JSON.parse(raw) as {
        major?: { name?: string; slug?: string };
      };
      roadmaps.push({
        major_slug: seed.major?.slug ?? file.replace(prefix, "").replace(".json", ""),
        major_name: seed.major?.name ?? file,
        updated_at: stat.mtime.toISOString(),
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

export async function loadCommunityHubData(
  schoolShortName: string,
): Promise<CommunityHubData> {
  const demo = await loadDemoHubData(schoolShortName);
  const recent_roadmaps = await loadRecentRoadmapsFromSeeds(schoolShortName);

  if (!isSupabaseConfigured()) {
    return { ...demo, recent_roadmaps: recent_roadmaps.length ? recent_roadmaps : demo.recent_roadmaps ?? [] };
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
    let answersByQuestion: Record<string, CommunityAnswer[]> = {};

    if (questionIds.length > 0) {
      const { data: answers } = await supabase
        .from("community_answers")
        .select("*")
        .in("question_id", questionIds);

      const answerIds = (answers ?? []).map((a) => a.id);
      let voteCounts: Record<string, number> = {};

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

    let contributor_spotlight: ContributorSpotlight | null = demo.contributor_spotlight;

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
