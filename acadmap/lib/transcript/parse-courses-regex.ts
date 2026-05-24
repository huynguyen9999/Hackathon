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
  /(?:Fall|Winter|Spring|Summer)\s+\d{4}[^\n]*?\b([A-Z][A-Z\s&]{1,18})\s+([A-Z]?\d+[A-Z0-9]{0,3})\b[^\n]*?\b(\d+\.?\d*)\s+([A-F][+-]?|P|S|CR|NC|NP|W|IP|U)\b/gi;

/** Compact: SUBJECT NUMBER ... units GRADE */
const COMPACT_LINE =
  /\b([A-Z][A-Z\s&]{1,18})\s+([A-Z]?\d+[A-Z0-9]{0,3})\b[^\n]{0,120}?\b(\d+\.?\d*)\s+([A-F][+-]?|P|S|CR|NC|NP|W|IP|U)\b/gi;

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
    const termMatch = match[0].match(/(?:Fall|Winter|Spring|Summer)\s+\d{4}/i);
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

  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
}
