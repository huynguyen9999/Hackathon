"use client";

import type { GoalLaneId } from "@/lib/explore-types";
import { GOAL_LANE_PRESETS } from "@/lib/explore-types";

const LANES: {
  id: GoalLaneId;
  title: string;
  description: string;
}[] = [
  {
    id: "switching",
    title: "Switching majors?",
    description: "Browse majors with interactive graphs to see prerequisite overlap.",
  },
  {
    id: "undecided",
    title: "Pre-major / undecided",
    description: "Open L&S majors with broad career paths—explore before you commit.",
  },
  {
    id: "selective",
    title: "Selective programs",
    description: "CCS and competitive majors with separate admission requirements.",
  },
];

export type ExploreGoalLanesProps = {
  activeLane: GoalLaneId | null;
  onSelectLane: (lane: GoalLaneId | null) => void;
};

export function ExploreGoalLanes({
  activeLane,
  onSelectLane,
}: ExploreGoalLanesProps) {
  return (
    <section className="mb-8 grid gap-3 sm:grid-cols-3">
      {LANES.map((lane) => {
        const active = activeLane === lane.id;
        return (
          <button
            key={lane.id}
            type="button"
            onClick={() => onSelectLane(active ? null : lane.id)}
            className={[
              "rounded-lg border p-4 text-left transition",
              active
                ? "border-gaucho-gold bg-gaucho-gold/10 dark:bg-gaucho-gold/15"
                : "border-gaucho-blue/15 bg-white hover:border-gaucho-blue/30 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30 dark:hover:border-gaucho-gold/30",
            ].join(" ")}
          >
            <h2 className="text-sm font-semibold text-gaucho-blue dark:text-white">
              {lane.title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {lane.description}
            </p>
          </button>
        );
      })}
    </section>
  );
}

export { GOAL_LANE_PRESETS };
