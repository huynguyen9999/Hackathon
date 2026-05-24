import { generateObject } from "ai";
import { gateway } from "@ai-sdk/gateway";

import { normalizeCourseCode } from "@/lib/transcript/normalize-course-code";
import {
  transcriptParseResultSchema,
  type ParsedCourse,
} from "@/lib/transcript/types";

function getTranscriptAiModel(): string {
  return process.env.TRANSCRIPT_AI_MODEL?.trim() || "google/gemini-2.0-flash";
}

export function isTranscriptAiConfigured(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN,
  );
}

export async function parseCoursesWithAi(
  text: string,
  school?: string,
): Promise<ParsedCourse[]> {
  if (!isTranscriptAiConfigured()) {
    throw new Error(
      "AI transcript parsing is not configured. Set AI_GATEWAY_API_KEY on the server.",
    );
  }

  const trimmed = text.slice(0, 120_000);
  const { object } = await generateObject({
    model: gateway(getTranscriptAiModel()),
    schema: transcriptParseResultSchema,
    prompt: `Extract every completed college course from this academic transcript text.
Return only courses with passing grades (A through D, P, S, CR). Skip withdrawn, in-progress, and failing grades.
Use course codes exactly as they appear (e.g. CMPSC 16, COM SCI 31, COMPSCI 61A, ECE 152A).
School context: ${school ?? "unknown UC campus"}.

Transcript text:
"""
${trimmed}
"""`,
  });

  const map = new Map<string, ParsedCourse>();
  for (const course of object.courses) {
    const code = normalizeCourseCode(course.code, school);
    if (!code) continue;
    map.set(code, { ...course, code });
  }

  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
}
