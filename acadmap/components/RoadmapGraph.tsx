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
import { useIsDarkMode } from "@/lib/use-is-dark-mode";
import type { EdgeType, FlowEdge, FlowNode } from "@/lib/types";

const nodeTypes = {
  course: NodeCard,
  career: CareerNode,
};

const EDGE_STYLES: Record<EdgeType, { stroke: string; strokeDasharray?: string }> = {
  prerequisite: { stroke: "#003660" },
  recommended: { stroke: "#004D9F", strokeDasharray: "6 4" },
  leads_to: { stroke: "#FEBC11" },
};

const ANALYSIS_EDGE_STYLES = {
  conflict: { stroke: "#dc2626" },
  critical: { stroke: "#f59e0b" },
  blocked: { stroke: "#ea580c", strokeDasharray: "8 4" },
} as const;

function mapFlowToReactFlow(
  flowNodes: FlowNode[],
  flowEdges: FlowEdge[],
  focusedNodeId: string | null,
  isDark: boolean,
) {
  const nodes: Node[] = flowNodes.map((n) => {
    const focused = focusedNodeId === n.id;
    const dimmed = focusedNodeId !== null && !focused && !n.data.analysisState;

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
    const analysisState = e.data?.analysisState;
    const style = analysisState
      ? ANALYSIS_EDGE_STYLES[analysisState]
      : EDGE_STYLES[edgeType];
    const connectedToFocus =
      focusedNodeId !== null &&
      (e.source === focusedNodeId || e.target === focusedNodeId);
    const dimmed = focusedNodeId !== null && !connectedToFocus && !analysisState;

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: edgeType === "leads_to" && !dimmed,
      style: {
        strokeWidth: analysisState ? 3 : connectedToFocus ? 2.5 : 2,
        opacity: dimmed ? 0.12 : 1,
        ...style,
      },
      labelStyle: {
        fill: dimmed
          ? isDark
            ? "#64748b"
            : "#94a3b8"
          : isDark
            ? "#FFD966"
            : "#003660",
        fontSize: 11,
        opacity: dimmed ? 0.4 : 1,
      },
      labelBgStyle: {
        fill: isDark ? "#002847" : "#ffffff",
        fillOpacity: dimmed ? 0.5 : 0.85,
      },
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
  const isDark = useIsDarkMode();

  const { nodes, edges } = useMemo(
    () => mapFlowToReactFlow(flowNodes, flowEdges, focusedNodeId, isDark),
    [flowNodes, flowEdges, focusedNodeId, isDark],
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
      className={`h-full w-full rounded-lg border border-gaucho-blue/15 bg-white dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/60 ${className}`}
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
          "igauchoback-flow",
          focusedNodeId ? "igauchoback-flow--focused" : "",
        ].join(" ")}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color={isDark ? "#1a4d73" : "#cbd5e1"}
          gap={20}
          size={1}
        />
        <Controls
          showInteractive={false}
          className="!rounded-lg !border-gaucho-blue/20 !bg-white !shadow-card dark:!border-gaucho-gold/20 dark:!bg-gaucho-blue-dark [&>button]:!border-slate-200 [&>button]:!bg-white [&>button]:!text-gaucho-blue dark:[&>button]:!border-gaucho-blue/40 dark:[&>button]:!bg-gaucho-blue-dark dark:[&>button]:!text-gaucho-gold [&>button:hover]:!bg-gaucho-blue/5 dark:[&>button:hover]:!bg-gaucho-blue/60"
        />
        <MiniMap
          nodeColor={(node) =>
            node.type === "career" ? "#FEBC11" : "#003660"
          }
          maskColor={
            isDark ? "rgba(0, 40, 71, 0.75)" : "rgba(247, 249, 251, 0.85)"
          }
          className="!rounded-lg !border !border-gaucho-blue/20 !bg-white/95 dark:!border-gaucho-gold/20 dark:!bg-gaucho-blue-dark/90"
        />
      </ReactFlow>
    </div>
  );
}
