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
  const aiConfigured = isTranscriptAiConfigured();

  // #region agent log
  fetch("http://127.0.0.1:7831/ingest/e16f4ef7-dba8-4ded-ac8f-0f0a350f1814", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "989c05",
    },
    body: JSON.stringify({
      sessionId: "989c05",
      runId: "pre-fix",
      hypothesisId: "C",
      location: "parse-transcript.ts:chooseParser",
      message: "parser branch decision inputs",
      data: {
        regexCount: regexCourses.length,
        minCourses,
        textLen: text.replace(/\s+/g, " ").trim().length,
        aiConfigured,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (regexCourses.length >= minCourses) {
    return { courses: regexCourses, parser: "regex" };
  }

  if (!aiConfigured) {
    return { courses: regexCourses, parser: "regex" };
  }

  try {
    const aiCourses = await parseCoursesWithAi(text, school);
    if (aiCourses.length > regexCourses.length) {
      // #region agent log
      fetch("http://127.0.0.1:7831/ingest/e16f4ef7-dba8-4ded-ac8f-0f0a350f1814", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "989c05",
        },
        body: JSON.stringify({
          sessionId: "989c05",
          runId: "pre-fix",
          hypothesisId: "C",
          location: "parse-transcript.ts:chooseParser",
          message: "selected AI parser",
          data: { aiCount: aiCourses.length, regexCount: regexCourses.length },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return { courses: aiCourses, parser: "ai" };
    }
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7831/ingest/e16f4ef7-dba8-4ded-ac8f-0f0a350f1814", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "989c05",
      },
      body: JSON.stringify({
        sessionId: "989c05",
        runId: "pre-fix",
        hypothesisId: "C",
        location: "parse-transcript.ts:chooseParser",
        message: "AI fallback failed",
        data: {
          error: error instanceof Error ? error.message : "unknown",
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }

  return { courses: regexCourses, parser: "regex" };
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

  // #region agent log
  fetch("http://127.0.0.1:7831/ingest/e16f4ef7-dba8-4ded-ac8f-0f0a350f1814", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "989c05",
    },
    body: JSON.stringify({
      sessionId: "989c05",
      runId: "pre-fix",
      hypothesisId: "D",
      location: "parse-transcript.ts:parseTranscriptPdf",
      message: "parse result summary",
      data: {
        parser,
        courseCount: courses.length,
        matchedCount: matched.length,
        unmatchedCount: unmatched.length,
        unmatchedSample: unmatched.slice(0, 5).map((u) => u.code),
        nodeCount: input.nodes.filter((n) => n.node_type === "course").length,
        school: input.school ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
