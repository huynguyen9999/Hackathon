"use client";

import type { RoadmapNode } from "@/lib/types";
import {
  PLANNER_QUARTERS,
  PLANNER_YEARS,
  quarterKey,
  type QuarterKey,
} from "@/lib/planner/plan-types";

export type QuarterGridProps = {
  assignments: Record<QuarterKey, string[]>;
  nodesById: Map<string, RoadmapNode>;
  onAssign: (nodeId: string, key: QuarterKey | null) => void;
};

export function QuarterGrid({ assignments, nodesById, onAssign }: QuarterGridProps) {
  function handleDrop(event: React.DragEvent<HTMLDivElement>, key: QuarterKey) {
    event.preventDefault();
    const nodeId = event.dataTransfer.getData("text/node-id");
    if (!nodeId) return;
    onAssign(nodeId, key);
  }

  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-4 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
        Multi-year planner (4-year / 8-quarter)
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PLANNER_YEARS.map((year) => (
          <div key={year} className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">Year {year}</h3>
            {PLANNER_QUARTERS.map((quarter) => {
              const key = quarterKey(year, quarter);
              const nodeIds = assignments[key] ?? [];
              const units = nodeIds.reduce((sum, nodeId) => {
                const node = nodesById.get(nodeId);
                return sum + (node?.units ?? 4);
              }, 0);

              return (
                <div
                  key={key}
                  className="min-h-[110px] rounded-lg border border-gaucho-blue/15 bg-slate-50 p-2 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/50"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, key)}
                >
                  <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
                    <span>{quarter}</span>
                    <span>{units}u</span>
                  </div>
                  <ul className="space-y-1">
                    {nodeIds.map((nodeId) => {
                      const node = nodesById.get(nodeId);
                      return (
                        <li
                          key={nodeId}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData("text/node-id", nodeId);
                          }}
                          className="cursor-move rounded border border-gaucho-blue/20 bg-white px-2 py-1 text-xs text-slate-700 dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark dark:text-slate-200"
                        >
                          {node?.label ?? nodeId}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
