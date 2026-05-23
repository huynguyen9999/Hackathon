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
import { useRoadmapSchedule } from "@/lib/use-roadmap-schedule";
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
  defaultCatalogQuarter?: string;
  auditRules: DegreeAuditRules | null;
  apRules: ExternalRule[];
  transferRules: ExternalRule[];
  plannerCollabEnabled: boolean;
};

function statusMapFromSchedule(
  completedCourseIds: string[],
  plannedCourseIds: string[],
): Record<string, "planned" | "completed"> {
  const map: Record<string, "planned" | "completed"> = {};
  for (const nodeId of completedCourseIds) {
    map[nodeId] = "completed";
  }
  for (const nodeId of plannedCourseIds) {
    map[nodeId] = "planned";
  }
  return map;
}

export function RoadmapView({
  roadmap,
  departmentFaculty,
  defaultCatalogQuarter,
  auditRules,
  apRules,
  transferRules,
  plannerCollabEnabled,
}: RoadmapViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const schedule = useRoadmapSchedule(roadmap.id);

  const { completedCourseIds, plannedCourseIds, whatIfRemovedId, activeAnalysisMode } =
    schedule.state;

  const plannerStatusByNodeId = useMemo(
    () => statusMapFromSchedule(completedCourseIds, plannedCourseIds),
    [completedCourseIds, plannedCourseIds],
  );

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

  const conflicts = useMemo(
    () =>
      findPrerequisiteConflicts(plannedCourseIds, completedCourseIds, graphModel),
    [completedCourseIds, graphModel, plannedCourseIds],
  );
  const criticalPath = useMemo(() => findCriticalPath(graphModel), [graphModel]);
  const bottlenecks = useMemo(() => findBottlenecks(graphModel), [graphModel]);
  const whatIfResult = useMemo(
    () => (whatIfRemovedId ? simulateRemovedNode(whatIfRemovedId, graphModel) : null),
    [graphModel, whatIfRemovedId],
  );

  const analyzedNodeState = useMemo(() => {
    const state = new Map<string, { analysisState?: string; note?: string }>();

    if (activeAnalysisMode === "conflicts") {
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

    if (activeAnalysisMode === "criticalPath") {
      for (const nodeId of criticalPath.nodeIds) {
        state.set(nodeId, {
          analysisState: "critical",
          note: "Part of longest prerequisite chain.",
        });
      }
    }

    if (activeAnalysisMode === "bottlenecks") {
      for (const bottleneck of bottlenecks.slice(0, 10)) {
        state.set(bottleneck.nodeId, {
          analysisState: "bottleneck",
          note: `Unlocks ${bottleneck.downstreamCount} downstream courses.`,
        });
      }
    }

    if (activeAnalysisMode === "whatIf" && whatIfResult) {
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
  }, [
    activeAnalysisMode,
    bottlenecks,
    conflicts,
    criticalPath.nodeIds,
    graphModel.nodesById,
    whatIfResult,
  ]);

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

  const sidebarNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return flowNodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [flowNodes, selectedNodeId]);

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
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onClose = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onRunWhatIf = useCallback(
    (nodeId: string) => {
      schedule.setWhatIfRemoved(nodeId);
    },
    [schedule],
  );

  const onClearWhatIf = useCallback(() => {
    schedule.setWhatIfRemoved(null);
    schedule.setActiveAnalysisMode("conflicts");
  }, [schedule]);

  const onModeChange = useCallback(
    (mode: typeof activeAnalysisMode) => {
      schedule.setActiveAnalysisMode(mode);
      if (mode !== "whatIf") {
        schedule.setWhatIfRemoved(null);
      }
    },
    [schedule],
  );

  const onClearSchedule = useCallback(() => {
    schedule.clearSchedule();
  }, [schedule]);

  return (
    <div className="space-y-4">
      <div className="flex h-[calc(100vh-8.5rem)] min-h-[520px] flex-col gap-4 lg:flex-row">
        <div className="min-h-[360px] flex-1 lg:min-h-0">
          <RoadmapGraph
            flowNodes={flowNodes}
            flowEdges={flowEdges}
            focusedNodeId={selectedNodeId}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            className="h-full min-h-[360px]"
          />
        </div>
        <div className="h-[280px] shrink-0 lg:h-auto lg:w-[340px]">
          <Sidebar
            selectedNode={sidebarNode as Node<iGauchoBackNodeData> | null}
            departmentFaculty={departmentFaculty}
            defaultCatalogQuarter={defaultCatalogQuarter}
            onToggleCompleted={schedule.toggleCompleted}
            onTogglePlanned={schedule.togglePlanned}
            onRunWhatIf={onRunWhatIf}
            onClearWhatIf={onClearWhatIf}
            onClose={selectedNodeId ? onClose : undefined}
            className="h-full"
          />
        </div>
      </div>

      <RoadmapAnalysisPanel
        graph={graphModel}
        completedCount={completedCourseIds.length}
        plannedCount={plannedCourseIds.length}
        activeMode={activeAnalysisMode}
        conflicts={conflicts}
        criticalPath={criticalPath}
        whatIfResult={whatIfResult}
        bottlenecks={bottlenecks}
        onModeChange={onModeChange}
        onClearSchedule={onClearSchedule}
      />

      {plannerCollabEnabled ? (
        <PlannerWorkspace
          roadmap={roadmap}
          auditRules={auditRules}
          apRules={apRules}
          transferRules={transferRules}
          onPlannerNodeStatusChange={schedule.applyStatusByNodeId}
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
