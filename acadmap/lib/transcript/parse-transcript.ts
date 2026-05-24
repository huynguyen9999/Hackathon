import { extractPdfText } from "@/lib/transcript/extract-pdf-text";
import { matchCoursesToRoadmap } from "@/lib/transcript/match-to-roadmap";
import {
  isTranscriptAiConfigured,
  parseCoursesWithAi,
} from "@/lib/transcript/parse-courses-ai";
import { parseCoursesFromText } from "@/lib/transcript/parse-courses-regex";
import type {
  ParsedCourse,
  TranscriptParseResponse,
  TranscriptParserKind,
} from "@/lib/transcript/types";
import type { RoadmapNode } from "@/lib/types";

function getAiFallbackMinCourses(): number {
  const raw = process.env.TRANSCRIPT_AI_FALLBACK_MIN_COURSES;
  const parsed = raw ? Number.parseInt(raw, 10) : 3;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3;
}

async function chooseParser(
  text: string,
  school?: string,
): Promise<{ courses: ParsedCourse[]; parser: TranscriptParserKind }> {
  const regexCourses = parseCoursesFromText(text, school);
  const minCourses = getAiFallbackMinCourses();
  const sparseText = text.replace(/\s+/g, " ").trim().length < 200;

  if (
    regexCourses.length >= minCourses ||
    (!sparseText && regexCourses.length > 0) ||
    !isTranscriptAiConfigured()
  ) {
    return { courses: regexCourses, parser: "regex" };
  }

  const aiCourses = await parseCoursesWithAi(text, school);
  if (aiCourses.length > regexCourses.length) {
    return { courses: aiCourses, parser: "ai" };
  }

  return { courses: regexCourses, parser: regexCourses.length > 0 ? "regex" : "ai" };
}

export async function parseTranscriptPdf(input: {
  buffer: ArrayBuffer | Uint8Array;
  nodes: RoadmapNode[];
  school?: string;
}): Promise<TranscriptParseResponse> {
  const text = await extractPdfText(input.buffer);
  if (!text) {
    throw new Error(
      "Could not extract text from this PDF. Try an official transcript export (not a scan).",
    );
  }

  const { courses, parser } = await chooseParser(text, input.school);
  const { matched, unmatched } = matchCoursesToRoadmap({
    courses,
    nodes: input.nodes,
    school: input.school,
  });

  return { courses, matched, unmatched, parser };
}

export async function parseTranscriptTextForTests(input: {
  text: string;
  nodes: RoadmapNode[];
  school?: string;
}): Promise<TranscriptParseResponse> {
  const { courses, parser } = await chooseParser(input.text, input.school);
  const { matched, unmatched } = matchCoursesToRoadmap({
    courses,
    nodes: input.nodes,
    school: input.school,
  });
  return { courses, matched, unmatched, parser };
}
