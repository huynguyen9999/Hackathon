import test from "node:test";
import assert from "node:assert/strict";

import {
  applyTranscriptToState,
  undoTranscriptFromState,
  type RoadmapScheduleState,
} from "@/lib/use-roadmap-schedule";

const empty: RoadmapScheduleState = {
  completedCourseIds: [],
  plannedCourseIds: [],
  transcriptAppliedNodeIds: [],
  whatIfRemovedId: null,
  activeAnalysisMode: "conflicts",
};

test("applyTranscriptToState marks courses completed on empty schedule", () => {
  const next = applyTranscriptToState(empty, ["a", "b"]);
  assert.deepEqual(next.completedCourseIds.sort(), ["a", "b"]);
  assert.deepEqual(next.transcriptAppliedNodeIds, ["a", "b"]);
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
});

test("second apply replaces transcript batch for undo", () => {
  const first = applyTranscriptToState(empty, ["a", "b"]);
  const second = applyTranscriptToState(first, ["c", "d"]);
  assert.deepEqual(second.transcriptAppliedNodeIds, ["c", "d"]);
  const undone = undoTranscriptFromState(second);
  assert.deepEqual(undone.completedCourseIds.sort(), ["a", "b"]);
});

test("applyTranscriptToState removes applied ids from planned", () => {
  const base = { ...empty, plannedCourseIds: ["a", "x"] };
  const next = applyTranscriptToState(base, ["a", "b"]);
  assert.deepEqual(next.plannedCourseIds, ["x"]);
  assert.ok(next.completedCourseIds.includes("a"));
});
