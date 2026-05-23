"use client";

import { useCallback, useMemo, useState } from "react";
import type { Node, NodeMouseHandler } from "@xyflow/react";

import { PlannerWorkspace } from "@/components/planner/PlannerWorkspace";
import { RoadmapAnalysisPanel } from "@/components/RoadmapAnalysisPanel";
import { RoadmapGraph } from "@/components/RoadmapGraph";
import { Sidebar } from "@/components/Sidebar";
import {
  buildGraph,
  findBottlenecks,
  findCriticalPath,
  findPrerequisiteConflicts,
  simulateRemovedNode,
} from "@/lib/roadmap-analysis";
import {
  applyPlannerNodeStatuses,
  roadmapEdgesToFlowEdges,
  roadmapNodesToFlowNodes,
} from "@/lib/flow";
import type { DegreeAuditRules } from "@/lib/planner/degree-audit";
import type { iGauchoBackNodeData, RoadmapDetail } from "@/lib/types";
import type { DepartmentFacultyFile } from "@/lib/ucsb-faculty-types";

type ExternalRule = {
  exam?: string;
  source?: string;
  external_course?: string;
  min_score?: number;
  mapped_course_codes: string[];
  notes?: string;
};

export type RoadmapViewProps = {
  roadmap: RoadmapDetail;
  departmentFaculty?: DepartmentFacultyFile | null;
  auditRules: DegreeAuditRules | null;
  apRules: ExternalRule[];
  transferRules: ExternalRule[];
  plannerCollabEnabled: boolean;
};

export function RoadmapView({
  roadmap,
  departmentFaculty,
  auditRules,
  apRules,
  transferRules,
  plannerCollabEnabled,
}: RoadmapViewProps) {
  const [selectedNode, setSelectedNode] = useState<Node<iGauchoBackNodeData> | null>(
    null,
  );
  const [plannerStatusByNodeId, setPlannerStatusByNodeId] = useState<
    Record<string, "planned" | "completed">
  >({});
  const [analysisMode, setAnalysisMode] = useState<
    "conflicts" | "criticalPath" | "whatIf" | "bottlenecks"
  >("conflicts");
  const [whatIfRemovedId, setWhatIfRemovedId] = useState<string | null>(null);

  const baseFlowNodes = useMemo(
    () =>
      roadmapNodesToFlowNodes(
        roadmap.nodes,
        roadmap.metadata?.layout as string | undefined,
      ),
    [roadmap.nodes, roadmap.metadata?.layout],
  );

  const graphModel = useMemo(
    () => buildGraph(roadmap.nodes, roadmap.edges),
    [roadmap.edges, roadmap.nodes],
  );

  const completedNodeIds = useMemo(
    () =>
      Object.entries(plannerStatusByNodeId)
        .filter(([, status]) => status === "completed")
        .map(([nodeId]) => nodeId),
    [plannerStatusByNodeId],
  );

  const plannedNodeIds = useMemo(
    () =>
      Object.entries(plannerStatusByNodeId)
        .filter(([, status]) => status === "planned")
        .map(([nodeId]) => nodeId),
    [plannerStatusByNodeId],
  );

  const conflicts = useMemo(
    () => findPrerequisiteConflicts(plannedNodeIds, completedNodeIds, graphModel),
    [completedNodeIds, graphModel, plannedNodeIds],
  );
  const criticalPath = useMemo(() => findCriticalPath(graphModel), [graphModel]);
  const bottlenecks = useMemo(() => findBottlenecks(graphModel), [graphModel]);
  const whatIfResult = useMemo(
    () => (whatIfRemovedId ? simulateRemovedNode(whatIfRemovedId, graphModel) : null),
    [graphModel, whatIfRemovedId],
  );

  const analyzedNodeState = useMemo(() => {
    const state = new Map<string, { analysisState?: string; note?: string }>();

    if (analysisMode === "conflicts") {
      for (const conflict of conflicts) {
        state.set(conflict.plannedNodeId, {
          analysisState: "conflict",
          note: `Missing prerequisites: ${conflict.missingNodeIds
            .map((id) => graphModel.nodesById.get(id)?.label ?? id)
            .join(", ")}`,
        });
        for (const missing of conflict.missingNodeIds) {
          state.set(missing, {
            analysisState: "conflict",
            note: "Required before planned downstream course.",
          });
        }
      }
    }

    if (analysisMode === "criticalPath") {
      for (const nodeId of criticalPath.nodeIds) {
        state.set(nodeId, {
          analysisState: "critical",
          note: "Part of longest prerequisite chain.",
        });
      }
    }

    if (analysisMode === "bottlenecks") {
      for (const bottleneck of bottlenecks.slice(0, 10)) {
        state.set(bottleneck.nodeId, {
          analysisState: "bottleneck",
          note: `Unlocks ${bottleneck.downstreamCount} downstream courses.`,
        });
      }
    }

    if (analysisMode === "whatIf" && whatIfResult) {
      state.set(whatIfResult.removedNodeId, {
        analysisState: "removed",
        note: "Hypothetically dropped from plan.",
      });
      for (const blockedNodeId of whatIfResult.blockedNodeIds) {
        state.set(blockedNodeId, {
          analysisState: "blocked",
          note: "Blocked if removed prerequisite is dropped.",
        });
      }
    }

    return state;
  }, [analysisMode, bottlenecks, conflicts, criticalPath.nodeIds, graphModel.nodesById, whatIfResult]);

  const flowNodes = useMemo(
    () =>
      applyPlannerNodeStatuses(baseFlowNodes, plannerStatusByNodeId).map((node) => {
        const scheduleStatus = plannerStatusByNodeId[node.id];
        const analysis = analyzedNodeState.get(node.id);
        return {
          ...node,
          data: {
            ...node.data,
            scheduleStatus,
            analysisState: analysis?.analysisState as
              | "conflict"
              | "critical"
              | "blocked"
              | "bottleneck"
              | "removed"
              | undefined,
            analysisNote: analysis?.note,
          },
        };
      }),
    [analyzedNodeState, baseFlowNodes, plannerStatusByNodeId],
  );

  const flowEdges = useMemo(() => {
    const base = roadmapEdgesToFlowEdges(roadmap.edges);

    const conflictEdgeIds = new Set(conflicts.flatMap((conflict) => conflict.chainEdgeIds));
    const criticalEdgeIds = new Set(criticalPath.edgeIds);
    const blockedEdgeIds = new Set(whatIfResult?.edgeIds ?? []);

    return base.map((edge) => {
      const analysisState: "blocked" | "conflict" | "critical" | undefined =
        blockedEdgeIds.has(edge.id)
          ? "blocked"
          : conflictEdgeIds.has(edge.id)
            ? "conflict"
            : criticalEdgeIds.has(edge.id)
              ? "critical"
              : undefined;

      return {
        ...edge,
        data: {
          edgeType: edge.data?.edgeType ?? "prerequisite",
          analysisState,
        },
      };
    });
  }, [conflicts, criticalPath.edgeIds, roadmap.edges, whatIfResult?.edgeIds]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode((prev) =>
      prev?.id === node.id ? null : (node as Node<iGauchoBackNodeData>),
    );
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onRunWhatIf = useCallback((nodeId: string) => {
    setAnalysisMode("whatIf");
    setWhatIfRemovedId(nodeId);
  }, []);

  const onClearWhatIf = useCallback(() => {
    setWhatIfRemovedId(null);
    setAnalysisMode("conflicts");
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex h-[calc(100vh-8.5rem)] min-h-[520px] flex-col gap-4 lg:flex-row">
        <div className="min-h-[360px] flex-1 lg:min-h-0">
          <RoadmapGraph
            flowNodes={flowNodes}
            flowEdges={flowEdges}
            focusedNodeId={selectedNode?.id ?? null}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            className="h-full min-h-[360px]"
          />
        </div>
        <div className="h-[280px] shrink-0 lg:h-auto lg:w-[340px]">
          <Sidebar
            selectedNode={selectedNode}
            departmentFaculty={departmentFaculty}
            onRunWhatIf={onRunWhatIf}
            onClearWhatIf={onClearWhatIf}
            onClose={selectedNode ? onClose : undefined}
            className="h-full"
          />
        </div>
      </div>

      <RoadmapAnalysisPanel
        graph={graphModel}
        completedCount={completedNodeIds.length}
        plannedCount={plannedNodeIds.length}
        activeMode={analysisMode}
        conflicts={conflicts}
        criticalPath={criticalPath}
        whatIfResult={whatIfResult}
        bottlenecks={bottlenecks}
        onModeChange={(mode) => {
          setAnalysisMode(mode);
          if (mode !== "whatIf") {
            setWhatIfRemovedId(null);
          }
        }}
        onClearSchedule={() => {
          setPlannerStatusByNodeId({});
          setWhatIfRemovedId(null);
          setAnalysisMode("conflicts");
        }}
      />

      {plannerCollabEnabled ? (
        <PlannerWorkspace
          roadmap={roadmap}
          auditRules={auditRules}
          apRules={apRules}
          transferRules={transferRules}
          onPlannerNodeStatusChange={setPlannerStatusByNodeId}
        />
      ) : (
        <section className="rounded-xl border border-gaucho-blue/15 bg-white p-4 text-sm text-slate-600 dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/30 dark:text-slate-300">
          Planner collaboration is currently gated behind \`ENABLE_PLANNER_COLLAB\`.
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Advising aid only — not an official UCSB degree audit replacement.
          </p>
        </section>
      )}
    </div>
  );
}
