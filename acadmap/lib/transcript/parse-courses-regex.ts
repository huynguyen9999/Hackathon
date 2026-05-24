import { normalizeCourseCode } from "@/lib/transcript/normalize-course-code";
import type { ParsedCourse } from "@/lib/transcript/types";

const PASSING_GRADES = new Set([
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "P",
  "S",
  "CR",
]);

const SKIPPED_GRADES = new Set(["F", "NP", "NC", "W", "IP", "I", "U", "IN PROGRESS"]);

/** Banner / GOLD-style: term + subject + number + title + units + grade */
const TERM_LINE =
  /(?:(?:Fall|Winter|Spring|Summer)\s+\d{4}|\d{4}\s+(?:Fall|Winter|Spring|Summer))[^\n]*?\b([A-Z][A-Z&]{0,14}[A-Z])\s+(\d+[A-Z0-9]{0,3})\b[^\n]*?\b(\d+\.?\d*)\s+([A-F][+-]?|P|S|CR|NC|NP|W|IP|U)\b/gi;

/** Compact: SUBJECT NUMBER ... units GRADE */
const COMPACT_LINE =
  /\b([A-Z][A-Z&]{0,14}[A-Z])\s+(\d+[A-Z0-9]{0,3})\b[^\n]{0,120}?\b(\d+\.?\d*)\s+([A-F][+-]?|P|S|CR|NC|NP|W|IP|U)\b/gi;

/** UCSB GOLD / Banner: SUBJECT NUMBER ... GRADE units */
const GRADE_BEFORE_UNITS_LINE =
  /\b([A-Z][A-Z&]{0,14}[A-Z])\s+(\d+[A-Z0-9]{0,3})\b[^\n]{0,120}?\b([A-F][+-]?|P|S|CR|NC|NP|W|IP|U)\s+(\d+\.?\d*)\b/gi;

/** Concatenated subject+number: CMPSC16 ... GRADE units */
const CONCAT_GRADE_UNITS_LINE =
  /\b([A-Z]{2,10})(\d+[A-Z0-9]{0,3})\b[^\n]{0,120}?\b([A-F][+-]?|P|S|CR|NC|NP|W|IP|U)\s+(\d+\.?\d*)\b/gi;

function isPassingGrade(grade: string): boolean {
  const upper = grade.toUpperCase();
  if (SKIPPED_GRADES.has(upper)) return false;
  return PASSING_GRADES.has(upper);
}

function addCourse(
  map: Map<string, ParsedCourse>,
  rawCode: string,
  grade: string,
  term?: string,
  units?: number,
  school?: string,
): void {
  const code = normalizeCourseCode(rawCode, school);
  if (!code || !isPassingGrade(grade)) return;

  map.set(code, {
    code,
    grade: grade.toUpperCase(),
    term,
    units,
  });
}

export function parseCoursesFromText(
  text: string,
  school?: string,
): ParsedCourse[] {
  const map = new Map<string, ParsedCourse>();

  for (const match of text.matchAll(TERM_LINE)) {
    const subject = match[1];
    const number = match[2];
    const units = match[3] ? Number.parseFloat(match[3]) : undefined;
    const grade = match[4];
    const termMatch = match[0].match(
      /(?:(?:Fall|Winter|Spring|Summer)\s+\d{4}|\d{4}\s+(?:Fall|Winter|Spring|Summer))/i,
    );
    addCourse(
      map,
      `${subject} ${number}`,
      grade,
      termMatch?.[0],
      units,
      school,
    );
  }

  for (const match of text.matchAll(COMPACT_LINE)) {
    const subject = match[1];
    const number = match[2];
    const units = Number.parseFloat(match[3]);
    const grade = match[4];
    addCourse(
      map,
      `${subject} ${number}`,
      grade,
      undefined,
      units,
      school,
    );
  }

  for (const match of text.matchAll(GRADE_BEFORE_UNITS_LINE)) {
    const subject = match[1];
    const number = match[2];
    const grade = match[3];
    const units = Number.parseFloat(match[4]);
    addCourse(
      map,
      `${subject} ${number}`,
      grade,
      undefined,
      units,
      school,
    );
  }

  for (const match of text.matchAll(CONCAT_GRADE_UNITS_LINE)) {
    const subject = match[1];
    const number = match[2];
    const grade = match[3];
    const units = Number.parseFloat(match[4]);
    addCourse(
      map,
      `${subject} ${number}`,
      grade,
      undefined,
      units,
      school,
    );
  }

  const courses = [...map.values()].sort((a, b) => a.code.localeCompare(b.code));

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
      hypothesisId: "A",
      location: "parse-courses-regex.ts:parseCoursesFromText",
      message: "regex parse summary",
      data: {
        textLen: text.length,
        courseCount: courses.length,
        sampleCodes: courses.slice(0, 8).map((c) => c.code),
        school: school ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return courses;
}
