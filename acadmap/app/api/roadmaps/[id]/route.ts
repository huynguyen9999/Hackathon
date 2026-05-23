import { NextResponse } from "next/server";

import { getRoadmapDetailById } from "@/lib/roadmap";

type RouteContext = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = params;

  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing roadmap id" }, { status: 400 });
  }

  try {
    const roadmap = await getRoadmapDetailById(id);

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    if (roadmap.status !== "approved") {
      return NextResponse.json(
        { error: "Roadmap is not approved" },
        { status: 404 },
      );
    }

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error("[GET /api/roadmaps/[id]]", error);
    return NextResponse.json(
      { error: "Failed to load roadmap" },
      { status: 500 },
    );
  }
}
