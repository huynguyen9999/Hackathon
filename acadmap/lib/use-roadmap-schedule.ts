"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type AnalysisMode =
  | "conflicts"
  | "criticalPath"
  | "whatIf"
  | "bottlenecks";

export type RoadmapScheduleState = {
  completedCourseIds: string[];
  plannedCourseIds: string[];
  whatIfRemovedId: string | null;
  activeAnalysisMode: AnalysisMode;
};

const DEFAULT_STATE: RoadmapScheduleState = {
  completedCourseIds: [],
  plannedCourseIds: [],
  whatIfRemovedId: null,
  activeAnalysisMode: "conflicts",
};

function storageKey(roadmapId: string): string {
  return `igauchoback:roadmap-schedule:${roadmapId}`;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function parseStoredState(value: string | null): RoadmapScheduleState {
  if (!value) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(value) as Partial<RoadmapScheduleState>;
    return sanitizeScheduleState({
      completedCourseIds: Array.isArray(parsed.completedCourseIds)
        ? parsed.completedCourseIds
        : [],
      plannedCourseIds: Array.isArray(parsed.plannedCourseIds)
        ? parsed.plannedCourseIds
        : [],
      whatIfRemovedId: parsed.whatIfRemovedId ?? null,
      activeAnalysisMode: parsed.activeAnalysisMode ?? "conflicts",
    });
  } catch {
    return DEFAULT_STATE;
  }
}

/** Drop schedule marks on the what-if node (legacy localStorage may have both). */
function sanitizeScheduleState(state: RoadmapScheduleState): RoadmapScheduleState {
  if (!state.whatIfRemovedId) return state;
  const { whatIfRemovedId } = state;
  return {
    ...state,
    completedCourseIds: state.completedCourseIds.filter((id) => id !== whatIfRemovedId),
    plannedCourseIds: state.plannedCourseIds.filter((id) => id !== whatIfRemovedId),
  };
}

export function useRoadmapSchedule(roadmapId: string) {
  const key = useMemo(() => storageKey(roadmapId), [roadmapId]);
  const [state, setState] = useState<RoadmapScheduleState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(parseStoredState(window.localStorage.getItem(key)));
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [hydrated, key, state]);

  const toggleCompleted = useCallback((nodeId: string) => {
    setState((prev) => {
      const isCompleted = prev.completedCourseIds.includes(nodeId);
      if (isCompleted) {
        return {
          ...prev,
          completedCourseIds: prev.completedCourseIds.filter((id) => id !== nodeId),
        };
      }
      return {
        ...prev,
        completedCourseIds: unique([...prev.completedCourseIds, nodeId]),
        plannedCourseIds: prev.plannedCourseIds.filter((id) => id !== nodeId),
        ...(prev.whatIfRemovedId === nodeId
          ? { whatIfRemovedId: null as string | null, activeAnalysisMode: "conflicts" as const }
          : {}),
      };
    });
  }, []);

  const togglePlanned = useCallback((nodeId: string) => {
    setState((prev) => {
      const isPlanned = prev.plannedCourseIds.includes(nodeId);
      if (isPlanned) {
        return {
          ...prev,
          plannedCourseIds: prev.plannedCourseIds.filter((id) => id !== nodeId),
        };
      }
      return {
        ...prev,
        plannedCourseIds: unique([...prev.plannedCourseIds, nodeId]),
        completedCourseIds: prev.completedCourseIds.filter((id) => id !== nodeId),
        ...(prev.whatIfRemovedId === nodeId
          ? { whatIfRemovedId: null as string | null, activeAnalysisMode: "conflicts" as const }
          : {}),
      };
    });
  }, []);

  const setWhatIfRemoved = useCallback((nodeId: string | null) => {
    setState((prev) => {
      if (!nodeId) {
        return { ...prev, whatIfRemovedId: null };
      }
      return {
        ...prev,
        whatIfRemovedId: nodeId,
        activeAnalysisMode: "whatIf",
        completedCourseIds: prev.completedCourseIds.filter((id) => id !== nodeId),
        plannedCourseIds: prev.plannedCourseIds.filter((id) => id !== nodeId),
      };
    });
  }, []);

  const setActiveAnalysisMode = useCallback((mode: AnalysisMode) => {
    setState((prev) => ({ ...prev, activeAnalysisMode: mode }));
  }, []);

  const clearSchedule = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const applyStatusByNodeId = useCallback(
    (statusByNodeId: Record<string, "planned" | "completed">) => {
      const completedCourseIds: string[] = [];
      const plannedCourseIds: string[] = [];
      for (const [nodeId, status] of Object.entries(statusByNodeId)) {
        if (status === "completed") {
          completedCourseIds.push(nodeId);
        } else if (status === "planned") {
          plannedCourseIds.push(nodeId);
        }
      }
      setState((prev) => ({
        ...prev,
        completedCourseIds,
        plannedCourseIds,
      }));
    },
    [],
  );

  return {
    state,
    hydrated,
    toggleCompleted,
    togglePlanned,
    setWhatIfRemoved,
    setActiveAnalysisMode,
    clearSchedule,
    applyStatusByNodeId,
  };
}
