"use client";

import { useMemo, useState } from "react";

import type { RoadmapNode } from "@/lib/types";

export type CourseDrawerProps = {
  nodes: RoadmapNode[];
  assignedNodeIds: Set<string>;
};

export function CourseDrawer({ nodes, assignedNodeIds }: CourseDrawerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nodes.filter((node) => {
      if (assignedNodeIds.has(node.id)) return false;
      if (!q) return true;
      return (
        node.label.toLowerCase().includes(q) ||
        (node.title ?? "").toLowerCase().includes(q)
      );
    });
  }, [assignedNodeIds, nodes, query]);

  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-4 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
        Course drawer
      </h2>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find course code or title"
        className="mt-2 w-full rounded-md border border-gaucho-blue/15 bg-white px-3 py-2 text-sm dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/50"
      />
      <p className="mt-2 text-xs text-slate-500">Drag courses onto planner quarters.</p>
      <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto">
        {filtered.map((node) => (
          <li
            key={node.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("text/node-id", node.id);
            }}
            className="cursor-move rounded-md border border-gaucho-blue/20 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark dark:text-slate-200"
          >
            <span className="font-semibold">{node.label}</span>
            {node.title ? <span className="ml-1 text-slate-500">{node.title}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
