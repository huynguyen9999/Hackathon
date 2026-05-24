import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { courseCodeKey, normalizeCourseCode } from "@/lib/transcript/normalize-course-code";
import { parseCoursesFromText } from "@/lib/transcript/parse-courses-regex";
import { matchCoursesToRoadmap } from "@/lib/transcript/match-to-roadmap";
import { parseTranscriptTextForTests } from "@/lib/transcript/parse-transcript";
import type { RoadmapNode } from "@/lib/types";

const fixturePath = path.join(
  process.cwd(),
  "tests/transcript/fixtures/ucsb-ee-sample.txt",
);

const eeNodes: RoadmapNode[] = [
  {
    id: "cmpsc-16",
    roadmap_id: "r",
    node_type: "course",
    label: "CMPSC 16",
    self_learnable: false,
    position_x: 0,
    position_y: 0,
  },
  {
    id: "ece-10a",
    roadmap_id: "r",
    node_type: "course",
    label: "ECE 10A",
    self_learnable: false,
    position_x: 0,
    position_y: 0,
  },
  {
    id: "ece-152a",
    roadmap_id: "r",
    node_type: "course",
    label: "ECE 152A",
    self_learnable: false,
    position_x: 0,
    position_y: 0,
  },
];

test("normalizeCourseCode collapses subject aliases for UCSB", () => {
  assert.equal(normalizeCourseCode("COMP SCI 16", "ucsb"), "CMPSC 16");
  assert.equal(courseCodeKey("ECE 152A", "ucsb"), "ECE 152A");
});

test("parseCoursesFromText extracts passing courses and skips W/IP", () => {
  const text = readFileSync(fixturePath, "utf-8");
  const courses = parseCoursesFromText(text, "ucsb");
  const codes = courses.map((c) => c.code);

  assert.ok(codes.includes("CMPSC 16"));
  assert.ok(codes.includes("ECE 10A"));
  assert.ok(codes.includes("ECE 152A"));
  assert.equal(codes.includes("ECE 152B"), false);
  assert.equal(codes.includes("ECE 153A"), false);
  assert.ok(courses.length >= 7);
});

test("matchCoursesToRoadmap maps transcript codes to roadmap nodes", () => {
  const text = readFileSync(fixturePath, "utf-8");
  const courses = parseCoursesFromText(text, "ucsb");
  const { matched, unmatched } = matchCoursesToRoadmap({
    courses,
    nodes: eeNodes,
    school: "ucsb",
  });

  assert.deepEqual(
    matched.map((m) => m.nodeId).sort(),
    ["cmpsc-16", "ece-10a", "ece-152a"].sort(),
  );
  assert.ok(unmatched.length > 0);
});

test("parseTranscriptTextForTests returns regex parser for fixture", async () => {
  const text = readFileSync(fixturePath, "utf-8");
  const result = await parseTranscriptTextForTests({
    text,
    nodes: eeNodes,
    school: "ucsb",
  });

  assert.equal(result.parser, "regex");
  assert.ok(result.matched.length >= 3);
});
