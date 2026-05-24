import { NextRequest, NextResponse } from "next/server";

import type { GeAreaId } from "@/lib/ucsb-ges-types";
import { GE_AREA_IDS } from "@/lib/ucsb-ges-types";
import {
  getCoursesForArea,
  getGeAreasForCourse,
  listGeAreas,
} from "@/lib/ucsb-ges";

export const dynamic = "force-dynamic";

function parseArea(raw: string | null): GeAreaId | null {
  if (!raw) return null;
  return GE_AREA_IDS.includes(raw as GeAreaId) ? (raw as GeAreaId) : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    if (searchParams.get("meta") === "1") {
      const areas = await listGeAreas();
      return NextResponse.json({ areas });
    }

    const course = searchParams.get("course");
    if (course) {
      const areas = await getGeAreasForCourse(course);
      return NextResponse.json({ courseId: course.toUpperCase(), areas });
    }

    const area = parseArea(searchParams.get("area"));
    if (area) {
      const courses = await getCoursesForArea(area);
      return NextResponse.json({ area, courses });
    }

    const areas = await listGeAreas();
    return NextResponse.json({ areas });
  } catch (error) {
    console.error("[GET /api/ucsb/ges]", error);
    return NextResponse.json({ error: "Failed to load GE data" }, { status: 500 });
  }
}
