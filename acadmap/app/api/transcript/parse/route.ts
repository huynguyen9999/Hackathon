import { NextResponse } from "next/server";

import * as Sentry from "@sentry/nextjs";

import { getTranscriptMaxFileMb } from "@/lib/env";
import { getRoadmapDetailById } from "@/lib/roadmap";
import { parseTranscriptPdf } from "@/lib/transcript/parse-transcript";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data with a PDF file." },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const roadmapId = String(formData.get("roadmapId") ?? "").trim();
    const school = String(formData.get("school") ?? "").trim().toLowerCase();

    if (!roadmapId) {
      return NextResponse.json({ error: "Missing roadmapId." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing PDF file." }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF transcripts are supported." },
        { status: 400 },
      );
    }

    const maxBytes = getTranscriptMaxFileMb() * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `PDF must be ${getTranscriptMaxFileMb()} MB or smaller.` },
        { status: 413 },
      );
    }

    const roadmap = await getRoadmapDetailById(roadmapId);
    if (!roadmap || roadmap.status !== "approved") {
      return NextResponse.json({ error: "Roadmap not found." }, { status: 404 });
    }

    const buffer = await file.arrayBuffer();
    const result = await parseTranscriptPdf({
      buffer,
      nodes: roadmap.nodes,
      school: school || roadmap.school.short_name,
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("[POST /api/transcript/parse]", error);
    const message =
      error instanceof Error ? error.message : "Failed to parse transcript.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
