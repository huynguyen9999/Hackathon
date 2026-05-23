"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { RoadmapNodeData } from "@/lib/types";

export type CourseNode = Node<RoadmapNodeData, "course">;

export function NodeCard({ data, selected }: NodeProps<CourseNode>) {
  return (
    <div
      className={[
        "relative min-w-[200px] max-w-[260px] rounded-xl border-2 bg-slate-900/95 px-4 py-3 shadow-lg backdrop-blur-sm transition-shadow",
        selected
          ? "border-violet-400 shadow-violet-500/25"
          : "border-indigo-500/60 shadow-indigo-950/40 hover:border-indigo-400/80",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-indigo-300 !bg-slate-900"
      />

      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-semibold tracking-wide text-indigo-300">
          {data.label}
        </span>
        <span className="shrink-0 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-indigo-200 ring-1 ring-indigo-400/30">
          {data.units} {data.units === 1 ? "unit" : "units"}
        </span>
      </div>

      <h3 className="mb-2 text-sm font-semibold leading-snug text-slate-50">
        {data.title}
      </h3>

      {data.selfLearnable && (
        <div
          className="flex items-center gap-1.5 text-[11px] text-emerald-300/90"
          title="Can be learned outside the formal curriculum"
        >
          <span
            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40"
            aria-hidden
          >
            ✓
          </span>
          <span className="font-medium">Self-learnable</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-violet-300 !bg-slate-900"
      />
    </div>
  );
}
