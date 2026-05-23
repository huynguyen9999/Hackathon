"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CareerNode } from "@/components/CareerNode";
import { NodeCard } from "@/components/NodeCard";
import type { EdgeType, FlowEdge, FlowNode } from "@/lib/types";

const nodeTypes = {
  course: NodeCard,
  career: CareerNode,
};

const EDGE_STYLES: Record<EdgeType, { stroke: string; strokeDasharray?: string }> = {
  prerequisite: { stroke: "#6366f1" },
  recommended: { stroke: "#a78bfa", strokeDasharray: "6 4" },
  leads_to: { stroke: "#22d3ee" },
};

function mapFlowToReactFlow(flowNodes: FlowNode[], flowEdges: FlowEdge[]) {
  const nodes: Node[] = flowNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
  }));

  const edges: Edge[] = flowEdges.map((e) => {
    const edgeType = e.data?.edgeType ?? "prerequisite";
    const style = EDGE_STYLES[edgeType];
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: edgeType === "leads_to",
      style: { strokeWidth: 2, ...style },
      labelStyle: { fill: "#c7d2fe", fontSize: 11 },
      labelBgStyle: { fill: "#0f172a", fillOpacity: 0.85 },
    };
  });

  return { nodes, edges };
}

export type RoadmapGraphProps = {
  flowNodes: FlowNode[];
  flowEdges: FlowEdge[];
  onNodeClick?: NodeMouseHandler;
  className?: string;
};

export function RoadmapGraph({
  flowNodes,
  flowEdges,
  onNodeClick,
  className = "",
}: RoadmapGraphProps) {
  const { nodes, edges } = useMemo(
    () => mapFlowToReactFlow(flowNodes, flowEdges),
    [flowNodes, flowEdges],
  );

  const handleInit = useCallback(
    (instance: { fitView: (options?: { padding?: number }) => void }) => {
      requestAnimationFrame(() => {
        instance.fitView({ padding: 0.2 });
      });
    },
    [],
  );

  return (
    <div
      className={`h-full w-full rounded-xl border border-indigo-500/20 bg-slate-950/80 ${className}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onInit={handleInit}
        fitView
        nodesDraggable
        nodesConnectable={false}
        minZoom={0.25}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="acadmap-flow"
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#312e81"
          gap={20}
          size={1}
        />
        <Controls
          showInteractive={false}
          className="!rounded-lg !border-indigo-500/30 !bg-slate-900/90 !shadow-lg [&>button]:!border-slate-700 [&>button]:!bg-slate-800 [&>button]:!text-indigo-100 [&>button:hover]:!bg-indigo-900/60"
        />
        <MiniMap
          nodeColor={(node) =>
            node.type === "career" ? "#7c3aed" : "#4f46e5"
          }
          maskColor="rgba(15, 23, 42, 0.75)"
          className="!rounded-lg !border !border-indigo-500/30 !bg-slate-900/90"
        />
      </ReactFlow>
    </div>
  );
}
