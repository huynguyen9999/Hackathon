/** Minimum spacing for roadmap cards (title + description + units badge). */
export const ROADMAP_LAYOUT = {
  originX: 80,
  originY: 80,
  rowGap: 220,
  colGap: 300,
  /** Nodes within this x delta share a column. */
  columnTolerance: 100,
} as const;

export const COMPACT_ROADMAP_LAYOUT = {
  originX: 80,
  originY: 60,
  rowGap: 175,
  colGap: 240,
  columnTolerance: 100,
} as const;

type PositionedNode = {
  id: string;
  position_x: number;
  position_y: number;
};

type LayoutNode = PositionedNode & {
  node_type?: string;
  label?: string;
};

type LayoutGaps = {
  originX?: number;
  originY?: number;
  rowGap?: number;
  colGap?: number;
  columnTolerance?: number;
};

const DIGIT_TIERS = ["single", "double", "triple"] as const;
type DigitTier = (typeof DIGIT_TIERS)[number];

/** Parse the numeric part of a course label (e.g. "MATH 118A" → 118). */
export function parseCourseNumber(label: string): number | null {
  const match = label.match(/\b(\d{1,3})[A-Z]?\b/);
  return match ? Number.parseInt(match[1]!, 10) : null;
}

function digitTier(courseNumber: number): DigitTier {
  if (courseNumber < 10) return "single";
  if (courseNumber < 100) return "double";
  return "triple";
}

/**
 * Stack courses in vertical columns by course-number width (1–9, 10–99, 100+),
 * sorted ascending within each column. Career nodes stack in the rightmost column.
 */
export function layoutCourseDigitColumns<T extends LayoutNode>(
  nodes: T[],
  gaps: LayoutGaps = COMPACT_ROADMAP_LAYOUT,
): T[] {
  if (nodes.length === 0) return nodes;

  const rowGap = gaps.rowGap ?? COMPACT_ROADMAP_LAYOUT.rowGap;
  const colGap = gaps.colGap ?? COMPACT_ROADMAP_LAYOUT.colGap;
  const originX = gaps.originX ?? COMPACT_ROADMAP_LAYOUT.originX;
  const originY = gaps.originY ?? COMPACT_ROADMAP_LAYOUT.originY;

  const courses: T[] = [];
  const careers: T[] = [];
  const other: T[] = [];

  for (const node of nodes) {
    if (node.node_type === "career") careers.push(node);
    else if (node.node_type === "course") courses.push(node);
    else other.push(node);
  }

  const buckets: Record<DigitTier, T[]> = {
    single: [],
    double: [],
    triple: [],
  };

  for (const node of courses) {
    const num = parseCourseNumber(node.label ?? "");
    const tier = num != null ? digitTier(num) : "double";
    buckets[tier].push(node);
  }

  for (const tier of DIGIT_TIERS) {
    buckets[tier].sort((a, b) => {
      const na = parseCourseNumber(a.label ?? "") ?? 999;
      const nb = parseCourseNumber(b.label ?? "") ?? 999;
      if (na !== nb) return na - nb;
      return (a.label ?? "").localeCompare(b.label ?? "");
    });
  }

  const activeTiers = DIGIT_TIERS.filter((tier) => buckets[tier].length > 0);
  const byId = new Map<string, T>();

  activeTiers.forEach((tier, colIndex) => {
    buckets[tier].forEach((node, rowIndex) => {
      byId.set(node.id, {
        ...node,
        position_x: originX + colIndex * colGap,
        position_y: originY + rowIndex * rowGap,
      });
    });
  });

  const careerCol = activeTiers.length;
  careers.forEach((node, rowIndex) => {
    byId.set(node.id, {
      ...node,
      position_x: originX + careerCol * colGap,
      position_y: originY + rowIndex * rowGap,
    });
  });

  for (const node of other) {
    byId.set(node.id, { ...node });
  }

  return nodes.map((node) => byId.get(node.id) ?? node);
}

/**
 * Reassign node positions so columns and rows never overlap when cards show descriptions.
 * Preserves left-to-right column order and top-to-bottom row order from the seed.
 */
export function spreadRoadmapNodePositions<T extends PositionedNode>(
  nodes: T[],
  gaps: LayoutGaps = ROADMAP_LAYOUT,
): T[] {
  if (nodes.length === 0) return nodes;

  const rowGap = gaps.rowGap ?? ROADMAP_LAYOUT.rowGap;
  const colGap = gaps.colGap ?? ROADMAP_LAYOUT.colGap;
  const originX = gaps.originX ?? ROADMAP_LAYOUT.originX;
  const originY = gaps.originY ?? ROADMAP_LAYOUT.originY;
  const columnTolerance =
    gaps.columnTolerance ?? ROADMAP_LAYOUT.columnTolerance;

  const sorted = [...nodes].sort(
    (a, b) => a.position_x - b.position_x || a.position_y - b.position_y,
  );

  const columns: T[][] = [];
  for (const node of sorted) {
    const existing = columns.find(
      (col) =>
        Math.abs(col[0]!.position_x - node.position_x) <= columnTolerance,
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
    const x = originX + colIndex * colGap;
    col.forEach((node, rowIndex) => {
      byId.set(node.id, {
        ...node,
        position_x: x,
        position_y: originY + rowIndex * rowGap,
      });
    });
  });

  return nodes.map((n) => byId.get(n.id)!);
}

export function layoutRoadmapNodes<T extends LayoutNode>(
  nodes: T[],
  layout?: string,
): T[] {
  if (layout === "digit_columns") {
    return spreadRoadmapNodePositions(
      layoutCourseDigitColumns(nodes),
      COMPACT_ROADMAP_LAYOUT,
    );
  }
  return spreadRoadmapNodePositions(nodes);
}
