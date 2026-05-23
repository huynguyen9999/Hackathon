import type { RoadmapEdge, RoadmapNode } from "@/lib/types";

export type RoadmapGraphModel = {
  nodesById: Map<string, RoadmapNode>;
  courseNodeIds: Set<string>;
  prerequisiteEdges: RoadmapEdge[];
  edgeIdsByPair: Map<string, string>;
  incomingPrereqs: Map<string, string[]>;
  outgoingPrereqs: Map<string, string[]>;
};

export type PrerequisiteConflict = {
  plannedNodeId: string;
  missingNodeIds: string[];
  chainNodeIds: string[];
  chainEdgeIds: string[];
};

export type CriticalPath = {
  nodeIds: string[];
  edgeIds: string[];
};

export type WhatIfResult = {
  removedNodeId: string;
  blockedNodeIds: string[];
  edgeIds: string[];
};

export type Bottleneck = {
  nodeId: string;
  downstreamCount: number;
  downstreamNodeIds: string[];
};

function pairKey(sourceId: string, targetId: string): string {
  return `${sourceId}->${targetId}`;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function buildGraph(
  nodes: RoadmapNode[],
  edges: RoadmapEdge[],
): RoadmapGraphModel {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const courseNodeIds = new Set(
    nodes.filter((node) => node.node_type === "course").map((node) => node.id),
  );
  const prerequisiteEdges = edges.filter(
    (edge) =>
      edge.edge_type === "prerequisite" &&
      courseNodeIds.has(edge.source_id) &&
      courseNodeIds.has(edge.target_id),
  );
  const incomingPrereqs = new Map<string, string[]>();
  const outgoingPrereqs = new Map<string, string[]>();
  const edgeIdsByPair = new Map<string, string>();

  for (const nodeId of courseNodeIds) {
    incomingPrereqs.set(nodeId, []);
    outgoingPrereqs.set(nodeId, []);
  }

  for (const edge of prerequisiteEdges) {
    incomingPrereqs.get(edge.target_id)?.push(edge.source_id);
    outgoingPrereqs.get(edge.source_id)?.push(edge.target_id);
    edgeIdsByPair.set(pairKey(edge.source_id, edge.target_id), edge.id);
  }

  return {
    nodesById,
    courseNodeIds,
    prerequisiteEdges,
    edgeIdsByPair,
    incomingPrereqs,
    outgoingPrereqs,
  };
}

function edgeIdsForChain(
  chainNodeIds: string[],
  graph: RoadmapGraphModel,
): string[] {
  const edgeIds: string[] = [];
  for (let i = 0; i < chainNodeIds.length - 1; i += 1) {
    const edgeId = graph.edgeIdsByPair.get(
      pairKey(chainNodeIds[i]!, chainNodeIds[i + 1]!),
    );
    if (edgeId) edgeIds.push(edgeId);
  }
  return edgeIds;
}

function longestMissingPrereqChain(
  targetId: string,
  completed: Set<string>,
  graph: RoadmapGraphModel,
  visited: Set<string> = new Set(),
): string[] {
  if (visited.has(targetId)) return [targetId];
  const nextVisited = new Set(visited).add(targetId);
  const missingPrereqs = (graph.incomingPrereqs.get(targetId) ?? []).filter(
    (prereqId) => !completed.has(prereqId),
  );

  if (missingPrereqs.length === 0) return [targetId];

  let longest: string[] = [];
  for (const prereqId of missingPrereqs) {
    const chain = longestMissingPrereqChain(
      prereqId,
      completed,
      graph,
      nextVisited,
    );
    if (chain.length > longest.length) longest = chain;
  }

  return [...longest, targetId];
}

function collectMissingAncestors(
  nodeId: string,
  completed: Set<string>,
  graph: RoadmapGraphModel,
): string[] {
  const missing: string[] = [];
  const visited = new Set<string>();
  const visit = (currentId: string) => {
    for (const prereqId of graph.incomingPrereqs.get(currentId) ?? []) {
      if (visited.has(prereqId)) continue;
      visited.add(prereqId);
      if (!completed.has(prereqId)) {
        missing.push(prereqId);
        visit(prereqId);
      }
    }
  };

  visit(nodeId);
  return unique(missing);
}

export function findPrerequisiteConflicts(
  plannedNodeIds: string[],
  completedNodeIds: string[],
  graph: RoadmapGraphModel,
): PrerequisiteConflict[] {
  const completed = new Set(completedNodeIds);

  return plannedNodeIds
    .filter((nodeId) => graph.courseNodeIds.has(nodeId))
    .map((plannedNodeId) => {
      const missingNodeIds = collectMissingAncestors(
        plannedNodeId,
        completed,
        graph,
      );
      const chainNodeIds = longestMissingPrereqChain(
        plannedNodeId,
        completed,
        graph,
      );

      return {
        plannedNodeId,
        missingNodeIds,
        chainNodeIds,
        chainEdgeIds: edgeIdsForChain(chainNodeIds, graph),
      };
    })
    .filter((conflict) => conflict.missingNodeIds.length > 0);
}

function topologicalCourseOrder(graph: RoadmapGraphModel): string[] {
  const indegree = new Map<string, number>();
  for (const nodeId of Array.from(graph.courseNodeIds)) {
    indegree.set(nodeId, graph.incomingPrereqs.get(nodeId)?.length ?? 0);
  }

  const queue = Array.from(indegree.entries())
    .filter(([, degree]) => degree === 0)
    .map(([nodeId]) => nodeId);
  const order: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const next of graph.outgoingPrereqs.get(current) ?? []) {
      const nextDegree = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextDegree);
      if (nextDegree === 0) queue.push(next);
    }
  }

  return order.length === graph.courseNodeIds.size
    ? order
    : Array.from(graph.courseNodeIds);
}

export function findCriticalPath(graph: RoadmapGraphModel): CriticalPath {
  const order = topologicalCourseOrder(graph);
  const distance = new Map<string, number>();
  const predecessor = new Map<string, string | null>();

  for (const nodeId of order) {
    distance.set(nodeId, 0);
    predecessor.set(nodeId, null);
  }

  for (const nodeId of order) {
    const nextDistance = (distance.get(nodeId) ?? 0) + 1;
    for (const next of graph.outgoingPrereqs.get(nodeId) ?? []) {
      if (nextDistance > (distance.get(next) ?? 0)) {
        distance.set(next, nextDistance);
        predecessor.set(next, nodeId);
      }
    }
  }

  let endNodeId = order[0] ?? "";
  for (const nodeId of order) {
    if ((distance.get(nodeId) ?? 0) > (distance.get(endNodeId) ?? 0)) {
      endNodeId = nodeId;
    }
  }

  const nodeIds: string[] = [];
  let current: string | null | undefined = endNodeId;
  while (current) {
    nodeIds.unshift(current);
    current = predecessor.get(current);
  }

  return {
    nodeIds,
    edgeIds: edgeIdsForChain(nodeIds, graph),
  };
}

export function collectDownstreamNodes(
  nodeId: string,
  graph: RoadmapGraphModel,
): string[] {
  const downstream: string[] = [];
  const visited = new Set<string>();
  const queue = Array.from(graph.outgoingPrereqs.get(nodeId) ?? []);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    downstream.push(current);
    queue.push(...Array.from(graph.outgoingPrereqs.get(current) ?? []));
  }

  return downstream;
}

export function simulateRemovedNode(
  removedNodeId: string,
  graph: RoadmapGraphModel,
): WhatIfResult {
  const blockedNodeIds = collectDownstreamNodes(removedNodeId, graph);
  const edgeIds = graph.prerequisiteEdges
    .filter(
      (edge) =>
        edge.source_id === removedNodeId ||
        blockedNodeIds.includes(edge.source_id) ||
        blockedNodeIds.includes(edge.target_id),
    )
    .map((edge) => edge.id);

  return {
    removedNodeId,
    blockedNodeIds,
    edgeIds,
  };
}

export function findBottlenecks(graph: RoadmapGraphModel): Bottleneck[] {
  return Array.from(graph.courseNodeIds)
    .map((nodeId) => {
      const downstreamNodeIds = collectDownstreamNodes(nodeId, graph);
      return {
        nodeId,
        downstreamCount: downstreamNodeIds.length,
        downstreamNodeIds,
      };
    })
    .filter((item) => item.downstreamCount > 0)
    .sort((a, b) => b.downstreamCount - a.downstreamCount);
}
