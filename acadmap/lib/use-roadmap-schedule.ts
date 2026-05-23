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
    return {
      completedCourseIds: Array.isArray(parsed.completedCourseIds)
        ? parsed.completedCourseIds
        : [],
      plannedCourseIds: Array.isArray(parsed.plannedCourseIds)
        ? parsed.plannedCourseIds
        : [],
      whatIfRemovedId: parsed.whatIfRemovedId ?? null,
      activeAnalysisMode: parsed.activeAnalysisMode ?? "conflicts",
    };
  } catch {
    return DEFAULT_STATE;
  }
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
      return {
        ...prev,
        completedCourseIds: isCompleted
          ? prev.completedCourseIds.filter((id) => id !== nodeId)
          : unique([...prev.completedCourseIds, nodeId]),
        plannedCourseIds: isCompleted
          ? prev.plannedCourseIds
          : prev.plannedCourseIds.filter((id) => id !== nodeId),
      };
    });
  }, []);

  const togglePlanned = useCallback((nodeId: string) => {
    setState((prev) => {
      const isPlanned = prev.plannedCourseIds.includes(nodeId);
      return {
        ...prev,
        plannedCourseIds: isPlanned
          ? prev.plannedCourseIds.filter((id) => id !== nodeId)
          : unique([...prev.plannedCourseIds, nodeId]),
        completedCourseIds: isPlanned
          ? prev.completedCourseIds
          : prev.completedCourseIds.filter((id) => id !== nodeId),
      };
    });
  }, []);

  const setWhatIfRemoved = useCallback((nodeId: string | null) => {
    setState((prev) => ({
      ...prev,
      whatIfRemovedId: nodeId,
      activeAnalysisMode: nodeId ? "whatIf" : prev.activeAnalysisMode,
    }));
  }, []);

  const setActiveAnalysisMode = useCallback((mode: AnalysisMode) => {
    setState((prev) => ({ ...prev, activeAnalysisMode: mode }));
  }, []);

  const clearSchedule = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return {
    state,
    hydrated,
    toggleCompleted,
    togglePlanned,
    setWhatIfRemoved,
    setActiveAnalysisMode,
    clearSchedule,
  };
}
