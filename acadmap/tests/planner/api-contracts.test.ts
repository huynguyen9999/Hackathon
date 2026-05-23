import test from "node:test";
import assert from "node:assert/strict";

import type { UpdatePlanInput } from "@/lib/planner/contracts";

test("plan update payload shape supports planner/audit fields", () => {
  const payload: UpdatePlanInput = {
    title: "Math Plan",
    notes: "Advisor review",
    courseStates: [
      {
        nodeId: "n1",
        status: "planned",
        quarter: { year: 1, quarter: "Fall" },
      },
    ],
    externalCredits: [
      {
        id: "ap-1",
        type: "ap",
        examOrCourse: "AP Calculus AB",
        mappedNodeIds: ["n1"],
      },
    ],
    validationIssues: [],
  };

  assert.equal(payload.courseStates?.[0]?.quarter?.quarter, "Fall");
  assert.equal(payload.externalCredits?.[0]?.type, "ap");
});
