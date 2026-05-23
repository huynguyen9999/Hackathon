"use client";

import type {
  Bottleneck,
  CriticalPath,
  PrerequisiteConflict,
  WhatIfResult,
} from "@/lib/roadmap-analysis";
import type { RoadmapGraphModel } from "@/lib/roadmap-analysis";
import type { AnalysisMode } from "@/lib/use-roadmap-schedule";

export type RoadmapAnalysisPanelProps = {
  graph: RoadmapGraphModel;
  completedCount: number;
  plannedCount: number;
  activeMode: AnalysisMode;
  conflicts: PrerequisiteConflict[];
  criticalPath: CriticalPath;
  whatIfResult: WhatIfResult | null;
  bottlenecks: Bottleneck[];
  onModeChange: (mode: AnalysisMode) => void;
  onClearSchedule: () => void;
};

function nodeLabel(graph: RoadmapGraphModel, nodeId: string): string {
  return graph.nodesById.get(nodeId)?.label ?? nodeId;
}

function modeButtonClass(active: boolean): string {
  return [
    "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
    active
      ? "bg-gaucho-blue text-white shadow-sm dark:bg-gaucho-gold dark:text-gaucho-blue"
      : "border border-gaucho-blue/20 text-gaucho-blue hover:bg-gaucho-blue/5 dark:border-gaucho-gold/25 dark:text-gaucho-gold-light dark:hover:bg-gaucho-blue/40",
  ].join(" ");
}

export function RoadmapAnalysisPanel({
  graph,
  completedCount,
  plannedCount,
  activeMode,
  conflicts,
  criticalPath,
  whatIfResult,
  bottlenecks,
  onModeChange,
  onClearSchedule,
}: RoadmapAnalysisPanelProps) {
  const criticalLabels = criticalPath.nodeIds.map((id) => nodeLabel(graph, id));
  const hasSchedule = completedCount > 0 || plannedCount > 0;

  return (
    <section className="rounded-2xl border border-gaucho-blue/15 bg-white p-4 shadow-card dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/70">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
            Graph tools
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
            Plan, stress-test, and spot bottlenecks
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Mark courses as completed or planned next quarter, then inspect the
            prerequisite graph before you build a schedule.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-medium text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
            {completedCount} completed
          </span>
          <span className="rounded-full bg-gaucho-gold/15 px-3 py-1 font-medium text-gaucho-blue ring-1 ring-gaucho-gold/30 dark:text-gaucho-gold-light">
            {plannedCount} planned
          </span>
          {hasSchedule ? (
            <button
              type="button"
              onClick={onClearSchedule}
              className="rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onModeChange("conflicts")}
          className={modeButtonClass(activeMode === "conflicts")}
        >
          Check prerequisites
        </button>
        <button
          type="button"
          onClick={() => onModeChange("criticalPath")}
          className={modeButtonClass(activeMode === "criticalPath")}
        >
          Critical path
        </button>
        <button
          type="button"
          onClick={() => onModeChange("bottlenecks")}
          className={modeButtonClass(activeMode === "bottlenecks")}
        >
          Bottlenecks
        </button>
        <button
          type="button"
          onClick={() => onModeChange("whatIf")}
          className={modeButtonClass(activeMode === "whatIf")}
        >
          What-if
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-red-500/20 bg-red-50 px-3 py-3 dark:bg-red-950/20">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
            Prerequisite conflicts
          </h3>
          {conflicts.length > 0 ? (
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-red-800/90 dark:text-red-100/90">
              {conflicts.slice(0, 3).map((conflict) => (
                <li key={conflict.plannedNodeId}>
                  <strong>{nodeLabel(graph, conflict.plannedNodeId)}</strong>{" "}
                  is missing{" "}
                  {conflict.missingNodeIds
                    .map((id) => nodeLabel(graph, id))
                    .join(", ")}
                  . Chain:{" "}
                  {conflict.chainNodeIds.map((id) => nodeLabel(graph, id)).join(" -> ")}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              No planned-course conflicts yet.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gaucho-gold/30 bg-gaucho-gold/10 px-3 py-3">
          <h3 className="text-sm font-semibold text-gaucho-blue dark:text-gaucho-gold-light">
            Critical path
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {criticalLabels.length > 0
              ? criticalLabels.join(" -> ")
              : "No prerequisite chain found."}
          </p>
        </div>

        <div className="rounded-xl border border-purple-500/20 bg-purple-50 px-3 py-3 dark:bg-purple-950/20">
          <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-200">
            Top bottlenecks
          </h3>
          {bottlenecks.length > 0 ? (
            <ol className="mt-2 space-y-1 text-xs text-purple-900 dark:text-purple-100">
              {bottlenecks.slice(0, 3).map((item) => (
                <li key={item.nodeId}>
                  {nodeLabel(graph, item.nodeId)} unlocks{" "}
                  {item.downstreamCount} downstream course
                  {item.downstreamCount === 1 ? "" : "s"}.
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              No bottlenecks detected.
            </p>
          )}
        </div>
      </div>

      {activeMode === "whatIf" ? (
        <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
          {whatIfResult ? (
            <>
              Dropping {nodeLabel(graph, whatIfResult.removedNodeId)} blocks{" "}
              {whatIfResult.blockedNodeIds.length} downstream course
              {whatIfResult.blockedNodeIds.length === 1 ? "" : "s"}.
            </>
          ) : (
            "Select a course, then use the sidebar to run a what-if drop simulation."
          )}
        </div>
      ) : null}
    </section>
  );
}
