import { z } from "zod";

export const parsedCourseSchema = z.object({
  code: z.string(),
  title: z.string().optional(),
  grade: z.string().optional(),
  term: z.string().optional(),
  units: z.number().optional(),
});

export const transcriptParseResultSchema = z.object({
  courses: z.array(parsedCourseSchema),
});

export type ParsedCourse = z.infer<typeof parsedCourseSchema>;
export type TranscriptParserKind = "regex" | "ai";

export type MatchedCourse = {
  nodeId: string;
  code: string;
  label: string;
  grade?: string;
  term?: string;
};

export type UnmatchedCourse = {
  code: string;
  grade?: string;
  reason: string;
};

export type TranscriptMatchResult = {
  matched: MatchedCourse[];
  unmatched: UnmatchedCourse[];
};

export type TranscriptParseResponse = {
  courses: ParsedCourse[];
  matched: MatchedCourse[];
  unmatched: UnmatchedCourse[];
  parser: TranscriptParserKind;
};
