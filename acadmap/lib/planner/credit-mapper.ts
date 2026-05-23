import type { ExternalCredit } from "@/lib/planner/contracts";
import type { RoadmapNode } from "@/lib/types";

type CreditRule = {
  exam?: string;
  source?: string;
  external_course?: string;
  min_score?: number;
  mapped_course_codes: string[];
  notes?: string;
};

function normalize(value: string): string {
  return value.toUpperCase().replace(/\s+/g, " ").trim();
}

export function buildNodeIdByCourseCode(nodes: RoadmapNode[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const node of nodes) {
    if (node.node_type !== "course") continue;
    map.set(normalize(node.label), node.id);
  }
  return map;
}

export function mapCreditRuleToCredit(input: {
  id: string;
  type: "ap" | "transfer";
  rule: CreditRule;
  scoreOrGrade?: string;
  nodeIdByCourseCode: Map<string, string>;
}): ExternalCredit {
  const mappedNodeIds = input.rule.mapped_course_codes
    .map((courseCode) => input.nodeIdByCourseCode.get(normalize(courseCode)))
    .filter((id): id is string => Boolean(id));

  return {
    id: input.id,
    type: input.type,
    examOrCourse:
      input.type === "ap"
        ? input.rule.exam ?? "AP credit"
        : input.rule.external_course ?? input.rule.source ?? "Transfer credit",
    scoreOrGrade: input.scoreOrGrade,
    mappedNodeIds,
    notes: input.rule.notes,
  };
}
