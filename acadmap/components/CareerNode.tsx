"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { CareerNodeData } from "@/lib/types";

export type CareerFlowNode = Node<CareerNodeData, "career">;

export function CareerNode({ data, selected }: NodeProps<CareerFlowNode>) {
  return (
    <div
      className={[
        "relative flex min-w-[180px] max-w-[240px] flex-col items-center px-5 py-4 text-center transition-transform",
        selected ? "scale-105" : "hover:scale-[1.02]",
      ].join(" ")}
      style={{
        clipPath:
          "polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)",
      }}
    >
      <div
        className={[
          "absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700",
          selected ? "opacity-100" : "opacity-95",
        ].join(" ")}
        style={{
          clipPath:
            "polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)",
        }}
      />
      <div
        className={[
          "absolute inset-[2px] bg-slate-950/90",
          selected ? "ring-2 ring-violet-300/60" : "",
        ].join(" ")}
        style={{
          clipPath:
            "polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-1.5">
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-100 ring-1 ring-white/20">
          Career
        </span>
        <span className="font-mono text-[10px] font-medium text-indigo-200/90">
          {data.label}
        </span>
        <h3 className="text-sm font-semibold leading-tight text-white">
          {data.title}
        </h3>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-2 !border-violet-200 !bg-slate-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-2 !border-violet-200 !bg-slate-900"
      />
    </div>
  );
}
