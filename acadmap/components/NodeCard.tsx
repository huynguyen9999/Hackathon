"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { RoadmapNodeData } from "@/lib/types";

export type CourseNode = Node<RoadmapNodeData, "course">;

const ANALYSIS_CLASSES: Record<string, string> = {
  conflict: "border-red-500 shadow-red-500/30 ring-2 ring-red-500/40",
  critical: "border-gaucho-gold shadow-gaucho-gold/40 ring-2 ring-gaucho-gold/50",
  blocked: "border-orange-500 shadow-orange-500/25 ring-2 ring-orange-500/30",
  bottleneck: "border-purple-500 shadow-purple-500/25 ring-2 ring-purple-500/30",
  removed: "border-red-700 bg-red-50 dark:bg-red-950/40 shadow-red-500/30 ring-2 ring-red-700/40",
};

export function NodeCard({ data, selected }: NodeProps<CourseNode>) {
  const isFocused = data.focused || selected;
  const analysisClass = data.analysisState
    ? ANALYSIS_CLASSES[data.analysisState]
    : null;

  return (
    <div
      className={[
        "relative min-w-[220px] max-w-[280px] rounded-xl border-2 bg-white dark:bg-slate-900/95 px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200",
        analysisClass
          ? analysisClass
          : data.dimmed
          ? "border-slate-300/60 dark:border-slate-700/40 opacity-30 shadow-none grayscale"
          : isFocused
            ? "z-10 scale-[1.02] border-gaucho-gold shadow-2xl shadow-gaucho-gold/40 ring-2 ring-gaucho-gold/50"
            : "border-gaucho-blue-light/60 shadow-gaucho-blue-dark/40 hover:border-gaucho-blue-light/80",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-gaucho-gold !bg-white dark:bg-slate-900"
      />

      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-semibold tracking-wide text-gaucho-blue dark:text-gaucho-gold">
          {data.label}
        </span>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full bg-gaucho-blue-light/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold-light ring-1 ring-gaucho-blue-light/30">
            {data.units} {data.units === 1 ? "unit" : "units"}
          </span>
          {data.scheduleStatus ? (
            <span
              className={[
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                data.scheduleStatus === "completed"
                  ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300"
                  : "bg-gaucho-gold/20 text-gaucho-blue ring-gaucho-gold/30 dark:text-gaucho-gold-light",
              ].join(" ")}
            >
              {data.scheduleStatus}
            </span>
          ) : null}
        </div>
      </div>

      <h3 className="mb-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">
        {data.title}
      </h3>

      {data.description && (
        <p
          className={[
            "mb-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400",
            data.dimmed ? "line-clamp-2" : "line-clamp-3",
          ].join(" ")}
        >
          {data.description}
        </p>
      )}

      {data.nodeMetadata?.role === "capstone" && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-800 ring-1 ring-indigo-400/30 dark:text-indigo-200">
            Capstone
          </span>
          {data.nodeMetadata.optional ? (
            <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-400/30 dark:text-slate-300">
              Optional
            </span>
          ) : null}
        </div>
      )}

      {data.nodeMetadata?.course_level === "graduate" && (
        <div className="mb-2">
          <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-800 ring-1 ring-violet-400/30 dark:text-violet-200">
            Graduate
          </span>
        </div>
      )}

      {data.selfLearnable && (
        <div
          className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300/90"
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

      {data.analysisNote ? (
        <p className="mt-2 rounded-lg bg-slate-100 px-2 py-1.5 text-[11px] leading-snug text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {data.analysisNote}
        </p>
      ) : null}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-gaucho-gold !bg-white dark:bg-slate-900"
      />
    </div>
  );
}
