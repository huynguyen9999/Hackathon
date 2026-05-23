import { NextRequest, NextResponse } from "next/server";

import { loadCommunityHubData } from "@/lib/community/data";
import { getSchoolConfig } from "@/lib/schools/registry";

export async function GET(request: NextRequest) {
  const school = request.nextUrl.searchParams.get("school");
  if (!school) {
    return NextResponse.json({ error: "school required" }, { status: 400 });
  }

  const config = await getSchoolConfig(school);
  if (!config) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const data = await loadCommunityHubData(school);
  return NextResponse.json({
    school: config.short_name,
    stats: {
      announcement_count: data.announcements.length,
      question_count: data.questions.length,
      review_count: data.course_reviews.reduce((n, r) => n + r.review_count, 0),
      alumni_count: data.alumni_outcomes.length,
      roadmap_count: data.recent_roadmaps?.length ?? 0,
    },
    ...data,
  });
}
