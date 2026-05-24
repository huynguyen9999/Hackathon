import test from "node:test";
import assert from "node:assert/strict";

import {
  applyTranscriptToState,
  undoAllTranscriptsFromState,
  undoTranscriptFromState,
  type RoadmapScheduleState,
} from "@/lib/use-roadmap-schedule";

const empty: RoadmapScheduleState = {
  completedCourseIds: [],
  plannedCourseIds: [],
  transcriptAppliedNodeIds: [],
  allTranscriptAppliedNodeIds: [],
  whatIfRemovedId: null,
  activeAnalysisMode: "conflicts",
};

test("applyTranscriptToState marks courses completed on empty schedule", () => {
  const next = applyTranscriptToState(empty, ["a", "b"]);
  assert.deepEqual(next.completedCourseIds.sort(), ["a", "b"]);
  assert.deepEqual(next.transcriptAppliedNodeIds, ["a", "b"]);
  assert.deepEqual(next.allTranscriptAppliedNodeIds.sort(), ["a", "b"]);
});

test("applyTranscriptToState merges with existing manual completions", () => {
  const base = { ...empty, completedCourseIds: ["c"] };
  const next = applyTranscriptToState(base, ["a", "b"]);
  assert.deepEqual(next.completedCourseIds.sort(), ["a", "b", "c"]);
});

test("undoTranscriptFromState removes only transcript batch", () => {
  const applied = applyTranscriptToState(
    { ...empty, completedCourseIds: ["c"] },
    ["a", "b"],
  );
  const undone = undoTranscriptFromState(applied);
  assert.deepEqual(undone.completedCourseIds, ["c"]);
  assert.deepEqual(undone.transcriptAppliedNodeIds, []);
  assert.deepEqual(undone.allTranscriptAppliedNodeIds, []);
});

test("second apply replaces transcript batch for undo", () => {
  const first = applyTranscriptToState(empty, ["a", "b"]);
  const second = applyTranscriptToState(first, ["c", "d"]);
  assert.deepEqual(second.transcriptAppliedNodeIds, ["c", "d"]);
  assert.deepEqual(second.allTranscriptAppliedNodeIds.sort(), ["a", "b", "c", "d"]);
  const undone = undoTranscriptFromState(second);
  assert.deepEqual(undone.completedCourseIds.sort(), ["a", "b"]);
  assert.deepEqual(undone.allTranscriptAppliedNodeIds.sort(), ["a", "b"]);
});

test("undo last after two applies keeps earlier batch in cumulative", () => {
  const first = applyTranscriptToState(empty, ["a", "b"]);
  const second = applyTranscriptToState(first, ["c", "d"]);
  const undone = undoTranscriptFromState(second);
  assert.deepEqual(undone.completedCourseIds.sort(), ["a", "b"]);
  assert.deepEqual(undone.allTranscriptAppliedNodeIds.sort(), ["a", "b"]);
  assert.deepEqual(undone.transcriptAppliedNodeIds, []);
});

test("undoAllTranscriptsFromState removes every transcript apply", () => {
  const first = applyTranscriptToState(
    { ...empty, completedCourseIds: ["z"] },
    ["a", "b"],
  );
  const second = applyTranscriptToState(first, ["c", "d"]);
  const undone = undoAllTranscriptsFromState(second);
  assert.deepEqual(undone.completedCourseIds, ["z"]);
  assert.deepEqual(undone.transcriptAppliedNodeIds, []);
  assert.deepEqual(undone.allTranscriptAppliedNodeIds, []);
});

test("undo all with single apply clears tracked courses", () => {
  const applied = applyTranscriptToState(empty, ["a", "b"]);
  const undone = undoAllTranscriptsFromState(applied);
  assert.deepEqual(undone.completedCourseIds, []);
  assert.deepEqual(undone.allTranscriptAppliedNodeIds, []);
});

test("applyTranscriptToState removes applied ids from planned", () => {
  const base = { ...empty, plannedCourseIds: ["a", "x"] };
  const next = applyTranscriptToState(base, ["a", "b"]);
  assert.deepEqual(next.plannedCourseIds, ["x"]);
  assert.ok(next.completedCourseIds.includes("a"));
});
