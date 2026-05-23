/** Minimum spacing for roadmap cards (title + description + units badge). */
export const ROADMAP_LAYOUT = {
  originX: 80,
  originY: 80,
  rowGap: 220,
  colGap: 300,
  /** Nodes within this x delta share a column. */
  columnTolerance: 100,
} as const;

type PositionedNode = {
  id: string;
  position_x: number;
  position_y: number;
};

/**
 * Reassign node positions so columns and rows never overlap when cards show descriptions.
 * Preserves left-to-right column order and top-to-bottom row order from the seed.
 */
export function spreadRoadmapNodePositions<T extends PositionedNode>(
  nodes: T[],
): T[] {
  if (nodes.length === 0) return nodes;

  const sorted = [...nodes].sort(
    (a, b) => a.position_x - b.position_x || a.position_y - b.position_y,
  );

  const columns: T[][] = [];
  for (const node of sorted) {
    const existing = columns.find(
      (col) =>
        Math.abs(col[0]!.position_x - node.position_x) <=
        ROADMAP_LAYOUT.columnTolerance,
    );
    if (existing) {
      existing.push(node);
    } else {
      columns.push([node]);
    }
  }

  columns.sort((a, b) => a[0]!.position_x - b[0]!.position_x);

  const byId = new Map<string, T>();
  columns.forEach((col, colIndex) => {
    col.sort((a, b) => a.position_y - b.position_y);
    const x = ROADMAP_LAYOUT.originX + colIndex * ROADMAP_LAYOUT.colGap;
    col.forEach((node, rowIndex) => {
      byId.set(node.id, {
        ...node,
        position_x: x,
        position_y: ROADMAP_LAYOUT.originY + rowIndex * ROADMAP_LAYOUT.rowGap,
      });
    });
  });

  return nodes.map((n) => byId.get(n.id)!);
}
