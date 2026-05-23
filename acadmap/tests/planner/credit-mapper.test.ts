import test from "node:test";
import assert from "node:assert/strict";

import { buildNodeIdByCourseCode, mapCreditRuleToCredit } from "@/lib/planner/credit-mapper";

const nodes = [
  { id: "n1", roadmap_id: "r", node_type: "course", label: "MATH 3A", self_learnable: false, position_x: 0, position_y: 0 },
  { id: "n2", roadmap_id: "r", node_type: "course", label: "CMPSC 8", self_learnable: false, position_x: 0, position_y: 0 },
] as const;

test("maps AP rule to matching roadmap node ids", () => {
  const map = buildNodeIdByCourseCode([...nodes]);
  const credit = mapCreditRuleToCredit({
    id: "ap-1",
    type: "ap",
    rule: {
      exam: "AP Calculus AB",
      mapped_course_codes: ["MATH 3A", "MATH 3B"],
    },
    nodeIdByCourseCode: map,
  });

  assert.deepEqual(credit.mappedNodeIds, ["n1"]);
});
