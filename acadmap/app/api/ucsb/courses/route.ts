import { NextRequest, NextResponse } from "next/server";

import {
  getDefaultQuarter,
  listQuarters,
  listSubjects,
  searchCourses,
} from "@/lib/ucsb-curriculum";
import type { UcsbCourseLevel } from "@/lib/ucsb-curriculum-types";

export const dynamic = "force-dynamic";

function parseLevel(raw: string | null): UcsbCourseLevel {
  const v = raw?.toUpperCase();
  if (v === "U" || v === "G" || v === "A") return v;
  return "A";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const quarters = await listQuarters();
    const defaultQuarter = getDefaultQuarter(quarters);

    const quarter = searchParams.get("quarter") ?? defaultQuarter;
    const subject = searchParams.get("subject")?.toUpperCase() ?? "ECE";
    const level = parseLevel(searchParams.get("level"));
    const q = searchParams.get("q") ?? undefined;

    if (searchParams.get("meta") === "1") {
      const [subjects, quarterList] = await Promise.all([
        listSubjects(),
        listQuarters(),
      ]);
      return NextResponse.json({
        subjects,
        quarters: quarterList,
        defaultQuarter: getDefaultQuarter(quarterList),
      });
    }

    const result = await searchCourses(
      { quarter, subjectCode: subject, level },
      { query: q },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/ucsb/courses]", error);
    return NextResponse.json(
      { error: "Failed to search courses" },
      { status: 500 },
    );
  }
}
