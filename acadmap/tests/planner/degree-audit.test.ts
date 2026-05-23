import test from "node:test";
import assert from "node:assert/strict";

import { buildAuditSnapshot } from "@/lib/planner/degree-audit";

const nodes = [
  { id: "n1", roadmap_id: "r", node_type: "course", label: "MATH 3A", units: 4, self_learnable: false, position_x: 0, position_y: 0 },
  { id: "n2", roadmap_id: "r", node_type: "course", label: "MATH 3B", units: 4, self_learnable: false, position_x: 0, position_y: 0 },
] as const;

test("computes bucket progress and remaining units", () => {
  const snapshot = buildAuditSnapshot({
    rules: {
      majorSlug: "math",
      degreeType: "BS",
      graduationUnitsTarget: 180,
      buckets: [
        {
          key: "prep",
          label: "Preparation",
          requiredCourseCodes: ["MATH 3A", "MATH 3B"],
          requiredUnits: 8,
        },
      ],
    },
    nodes: [...nodes],
    completedNodeIds: ["n1"],
    plannedNodeIds: ["n2"],
  });

  assert.equal(snapshot.completedUnits, 4);
  assert.equal(snapshot.remainingUnits, 176);
  assert.equal(snapshot.buckets[0]?.completed, 4);
  assert.equal(snapshot.buckets[0]?.percent, 50);
});
