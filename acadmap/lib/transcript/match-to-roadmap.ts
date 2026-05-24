import { buildNodeIdByCourseCode } from "@/lib/planner/credit-mapper";
import { courseCodeKey } from "@/lib/transcript/normalize-course-code";
import type {
  MatchedCourse,
  ParsedCourse,
  TranscriptMatchResult,
  UnmatchedCourse,
} from "@/lib/transcript/types";
import type { RoadmapNode } from "@/lib/types";

function buildLabelLookup(nodes: RoadmapNode[]): Map<string, RoadmapNode> {
  const map = new Map<string, RoadmapNode>();
  for (const node of nodes) {
    if (node.node_type !== "course") continue;
    map.set(node.label.toUpperCase().replace(/\s+/g, " ").trim(), node);
  }
  return map;
}

export function matchCoursesToRoadmap(input: {
  courses: ParsedCourse[];
  nodes: RoadmapNode[];
  school?: string;
}): TranscriptMatchResult {
  const nodeIdByCode = buildNodeIdByCourseCode(input.nodes);
  const labelLookup = buildLabelLookup(input.nodes);
  const matched: MatchedCourse[] = [];
  const unmatched: UnmatchedCourse[] = [];
  const seenNodeIds = new Set<string>();

  for (const course of input.courses) {
    const key = courseCodeKey(course.code, input.school);
    let nodeId = nodeIdByCode.get(key);

    if (!nodeId) {
      const node = labelLookup.get(key);
      nodeId = node?.id;
    }

    if (nodeId && !seenNodeIds.has(nodeId)) {
      seenNodeIds.add(nodeId);
      const node = input.nodes.find((n) => n.id === nodeId);
      matched.push({
        nodeId,
        code: course.code,
        label: node?.label ?? course.code,
        grade: course.grade,
        term: course.term,
      });
    } else if (!nodeId) {
      unmatched.push({
        code: course.code,
        grade: course.grade,
        reason: "Not on this major roadmap",
      });
    }
  }

  return { matched, unmatched };
}
