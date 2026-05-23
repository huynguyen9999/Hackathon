import { NextResponse } from "next/server";

import { getSchoolsWithApprovedRoadmaps } from "@/lib/roadmap";

export async function GET() {
  try {
    const schools = await getSchoolsWithApprovedRoadmaps();
    return NextResponse.json({ schools });
  } catch (error) {
    console.error("[GET /api/schools]", error);
    return NextResponse.json(
      { error: "Failed to load schools" },
      { status: 500 },
    );
  }
}
