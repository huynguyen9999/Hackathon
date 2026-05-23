import test from "node:test";
import assert from "node:assert/strict";

import { validatePlannerState } from "@/lib/planner/validation";

const nodes = [
  { id: "a", roadmap_id: "r", node_type: "course", label: "MATH 3A", self_learnable: false, position_x: 0, position_y: 0, units: 4 },
  { id: "b", roadmap_id: "r", node_type: "course", label: "MATH 3B", self_learnable: false, position_x: 0, position_y: 0, units: 4 },
  { id: "c", roadmap_id: "r", node_type: "course", label: "CMPSC 16", self_learnable: false, position_x: 0, position_y: 0, units: 16 },
] as const;

const edges = [
  { id: "e1", roadmap_id: "r", source_id: "a", target_id: "b", edge_type: "prerequisite" as const },
];

test("flags prerequisite order violations", () => {
  const issues = validatePlannerState({
    assignments: {
      "1-Fall": ["b"],
      "1-Winter": ["a"],
      "2-Fall": [],
      "2-Winter": [],
      "3-Fall": [],
      "3-Winter": [],
      "4-Fall": [],
      "4-Winter": [],
    },
    statusByNodeId: { a: "planned", b: "planned" },
    nodes: [...nodes],
    edges,
  });

  assert.ok(issues.some((issue) => issue.kind === "prerequisite-order"));
});

test("flags unit overload", () => {
  const issues = validatePlannerState({
    assignments: {
      "1-Fall": ["a", "b", "c"],
      "1-Winter": [],
      "2-Fall": [],
      "2-Winter": [],
      "3-Fall": [],
      "3-Winter": [],
      "4-Fall": [],
      "4-Winter": [],
    },
    statusByNodeId: { a: "planned", b: "planned", c: "planned" },
    nodes: [...nodes],
    edges,
  });

  assert.ok(issues.some((issue) => issue.kind === "unit-overload"));
});
