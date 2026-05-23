"use client";

import { useCallback, useMemo, useState } from "react";
import type { Node, NodeMouseHandler } from "@xyflow/react";

import { RoadmapGraph } from "@/components/RoadmapGraph";
import { Sidebar } from "@/components/Sidebar";
import {
  roadmapEdgesToFlowEdges,
  roadmapNodesToFlowNodes,
} from "@/lib/flow";
import type { AcadMapNodeData, RoadmapDetail } from "@/lib/types";

export type RoadmapViewProps = {
  roadmap: RoadmapDetail;
};

export function RoadmapView({ roadmap }: RoadmapViewProps) {
  const [selectedNode, setSelectedNode] = useState<Node<AcadMapNodeData> | null>(
    null,
  );

  const flowNodes = useMemo(
    () => roadmapNodesToFlowNodes(roadmap.nodes),
    [roadmap.nodes],
  );

  const flowEdges = useMemo(
    () => roadmapEdgesToFlowEdges(roadmap.edges),
    [roadmap.edges],
  );

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node as Node<AcadMapNodeData>);
  }, []);

  const onClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] min-h-[520px] flex-col gap-4 lg:flex-row">
      <div className="min-h-[360px] flex-1 lg:min-h-0">
        <RoadmapGraph
          flowNodes={flowNodes}
          flowEdges={flowEdges}
          onNodeClick={onNodeClick}
          className="h-full min-h-[360px]"
        />
      </div>
      <div className="h-[280px] shrink-0 lg:h-auto lg:w-[340px]">
        <Sidebar
          selectedNode={selectedNode}
          onClose={selectedNode ? onClose : undefined}
          className="h-full"
        />
      </div>
    </div>
  );
}
