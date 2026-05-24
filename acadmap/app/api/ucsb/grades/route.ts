import { NextRequest, NextResponse } from "next/server";

import {
  getCourseGrades,
  getGradesMeta,
  getLeaderboards,
  listGradeDepartments,
  searchGrades,
} from "@/lib/ucsb-grades";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    if (searchParams.get("meta") === "1") {
      const [meta, departments] = await Promise.all([
        getGradesMeta(),
        listGradeDepartments(),
      ]);
      return NextResponse.json({ meta, departments });
    }

    const course = searchParams.get("course");
    if (course) {
      const detail = await getCourseGrades(course);
      if (!detail) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      return NextResponse.json(detail);
    }

    if (searchParams.get("leaderboards") === "1") {
      const leaderboards = await getLeaderboards();
      return NextResponse.json(leaderboards ?? {});
    }

    const q = searchParams.get("q") ?? undefined;
    const dept = searchParams.get("dept") ?? undefined;
    const sort = (searchParams.get("sort") ?? "name") as
      | "avgGpa"
      | "offerings"
      | "name";

    const courses = await searchGrades({ q, dept, sort, limit: 200 });
    return NextResponse.json({ courses });
  } catch (error) {
    console.error("[GET /api/ucsb/grades]", error);
    return NextResponse.json(
      { error: "Failed to load grades" },
      { status: 500 },
    );
  }
}
