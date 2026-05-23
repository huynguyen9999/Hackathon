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

function mapFlowToReactFlow(
  flowNodes: FlowNode[],
  flowEdges: FlowEdge[],
  focusedNodeId: string | null,
) {
  const nodes: Node[] = flowNodes.map((n) => {
    const focused = focusedNodeId === n.id;
    const dimmed = focusedNodeId !== null && !focused;

    return {
      id: n.id,
      type: n.type,
      position: n.position,
      data: { ...n.data, focused, dimmed },
      zIndex: focused ? 20 : dimmed ? 0 : 1,
    };
  });

  const edges: Edge[] = flowEdges.map((e) => {
    const edgeType = e.data?.edgeType ?? "prerequisite";
    const style = EDGE_STYLES[edgeType];
    const connectedToFocus =
      focusedNodeId !== null &&
      (e.source === focusedNodeId || e.target === focusedNodeId);
    const dimmed = focusedNodeId !== null && !connectedToFocus;

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: edgeType === "leads_to" && !dimmed,
      style: {
        strokeWidth: connectedToFocus ? 2.5 : 2,
        opacity: dimmed ? 0.12 : 1,
        ...style,
      },
      labelStyle: {
        fill: dimmed ? "#475569" : "#c7d2fe",
        fontSize: 11,
        opacity: dimmed ? 0.4 : 1,
      },
      labelBgStyle: { fill: "#0f172a", fillOpacity: dimmed ? 0.5 : 0.85 },
      zIndex: connectedToFocus ? 15 : dimmed ? 0 : 5,
    };
  });

  return { nodes, edges };
}

export type RoadmapGraphProps = {
  flowNodes: FlowNode[];
  flowEdges: FlowEdge[];
  focusedNodeId?: string | null;
  onNodeClick?: NodeMouseHandler;
  onPaneClick?: () => void;
  className?: string;
};

export function RoadmapGraph({
  flowNodes,
  flowEdges,
  focusedNodeId = null,
  onNodeClick,
  onPaneClick,
  className = "",
}: RoadmapGraphProps) {
  const { nodes, edges } = useMemo(
    () => mapFlowToReactFlow(flowNodes, flowEdges, focusedNodeId),
    [flowNodes, flowEdges, focusedNodeId],
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
        onPaneClick={onPaneClick}
        onInit={handleInit}
        fitView
        nodesDraggable={!focusedNodeId}
        nodesConnectable={false}
        elementsSelectable
        minZoom={0.25}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className={[
          "acadmap-flow",
          focusedNodeId ? "acadmap-flow--focused" : "",
        ].join(" ")}
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
