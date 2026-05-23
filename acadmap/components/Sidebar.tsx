"use client";

import { useMemo } from "react";
import type { Node } from "@xyflow/react";
import type { iGauchoBackNodeData } from "@/lib/types";
import type { DepartmentFacultyFile } from "@/lib/ucsb-faculty-types";
import { FacultySidebarSection } from "@/components/FacultySidebarSection";
import { PartnerResourcesSection } from "@/components/PartnerResourcesSection";
import { getPartnerOffersForNode } from "@/lib/partners";

export type SidebarProps = {
  selectedNode: Node<iGauchoBackNodeData> | null;
  departmentFaculty?: DepartmentFacultyFile | null;
  onToggleCompleted?: (nodeId: string) => void;
  onTogglePlanned?: (nodeId: string) => void;
  onRunWhatIf?: (nodeId: string) => void;
  onClearWhatIf?: () => void;
  onClose?: () => void;
  className?: string;
};

export function Sidebar({
  selectedNode,
  departmentFaculty,
  onToggleCompleted,
  onTogglePlanned,
  onRunWhatIf,
  onClearWhatIf,
  onClose,
  className = "",
}: SidebarProps) {
  const partnerOffers = useMemo(() => {
    if (!selectedNode) {
      return { affiliates: [], sponsored: undefined };
    }
    const { data } = selectedNode;
    if (data.nodeType !== "course" || !data.selfLearnable) {
      return { affiliates: [], sponsored: undefined };
    }
    return getPartnerOffersForNode(data.label);
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <aside
        className={`flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-gaucho-blue-light/25 bg-slate-50 dark:bg-slate-900/50 px-6 py-10 text-center ${className}`}
      >
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Select a course or career node to view details
        </p>
      </aside>
    );
  }

  const { data } = selectedNode;
  const isCourse = data.nodeType === "course";
  const resources = data.resources ?? [];
  const isCapstone =
    isCourse && data.nodeMetadata?.role === "capstone";
  const showPartnerSection =
    isCourse &&
    data.selfLearnable &&
    (partnerOffers.affiliates.length > 0 || partnerOffers.sponsored !== undefined);

  return (
    <aside
      className={`flex h-full flex-col overflow-hidden rounded-xl border border-gaucho-blue-light/30 bg-white dark:bg-slate-900/95 shadow-xl ${className}`}
    >
      <header className="border-b border-gaucho-blue-light/20 bg-gradient-to-r from-gaucho-gold-light dark:from-gaucho-blue-dark/80 to-gaucho-gold-light dark:to-gaucho-blue-dark/60 px-5 py-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <span className="font-mono text-xs font-semibold text-gaucho-blue dark:text-gaucho-gold">
              {data.label}
            </span>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
              {data.title}
            </h2>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-slate-100"
              aria-label="Close panel"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isCourse
                ? "bg-gaucho-blue-light/20 text-gaucho-blue dark:text-gaucho-gold-light ring-1 ring-gaucho-blue-light/30"
                : "bg-gaucho-gold/20 text-gaucho-blue dark:text-gaucho-gold-light ring-1 ring-gaucho-gold/30"
            }`}
          >
            {isCourse ? "Course" : "Career"}
          </span>
          {isCourse && (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 ring-1 ring-slate-600/50">
              {data.units} units
            </span>
          )}
          {isCourse && data.selfLearnable && (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-400/30">
              Self-learnable
            </span>
          )}
          {isCapstone && (
            <>
              <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-medium text-indigo-800 dark:text-indigo-200 ring-1 ring-indigo-400/30">
                Capstone
              </span>
              {data.nodeMetadata?.optional ? (
                <span className="rounded-full bg-slate-500/10 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 ring-1 ring-slate-400/30">
                  Optional elective
                </span>
              ) : null}
            </>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-blue/80 dark:text-gaucho-gold/80">
            Description
          </h3>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {data.description || "No description available yet."}
          </p>
          <p className="mt-3 text-xs text-slate-900 dark:text-slate-500">
            Click the canvas or another node to change focus.
          </p>
        </section>

        {isCourse && data.selfLearnable && (
          <section className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2.5">
            <p className="text-xs leading-relaxed text-emerald-800/90 dark:text-emerald-200/90">
              This topic can be studied independently—useful if you want to
              prepare ahead or fill gaps outside the official sequence.
            </p>
          </section>
        )}

        {isCapstone && (
          <section className="mb-6 rounded-lg border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/20 px-3 py-2.5">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-200">
              Senior capstone
            </h3>
            <p className="text-xs leading-relaxed text-indigo-900/90 dark:text-indigo-100/90">
              {data.nodeMetadata?.optional
                ? "Optional capstone elective—not required to graduate. Many CS students finish in three years without this sequence."
                : "Required senior design sequence. Teams design, build, and present an engineering project, often showcased at the COE Engineering Design Expo."}
              {data.nodeMetadata?.sequence
                ? ` Quarter ${data.nodeMetadata.sequence} of the capstone series.`
                : null}
            </p>
          </section>
        )}

        {isCourse && (onToggleCompleted || onTogglePlanned || onRunWhatIf || onClearWhatIf) ? (
          <section className="mb-6 rounded-lg border border-gaucho-blue/15 bg-gaucho-blue/5 px-3 py-3 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/40">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
              Schedule tools
            </h3>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => onToggleCompleted?.(selectedNode.id)}
                className="rounded-lg border border-emerald-500/30 px-3 py-2 text-left text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/10 dark:text-emerald-300"
              >
                {data.scheduleStatus === "completed"
                  ? "Undo completed"
                  : "Mark completed"}
              </button>
              <button
                type="button"
                onClick={() => onTogglePlanned?.(selectedNode.id)}
                className="rounded-lg border border-gaucho-gold/40 px-3 py-2 text-left text-xs font-semibold text-gaucho-blue transition hover:bg-gaucho-gold/10 dark:text-gaucho-gold-light"
              >
                {data.scheduleStatus === "planned"
                  ? "Undo planned"
                  : "Mark planned next quarter"}
              </button>
              <button
                type="button"
                onClick={() => onRunWhatIf?.(selectedNode.id)}
                className="rounded-lg border border-orange-500/30 px-3 py-2 text-left text-xs font-semibold text-orange-700 transition hover:bg-orange-500/10 dark:text-orange-300"
              >
                What if I drop this?
              </button>
              {data.analysisState === "removed" ? (
                <button
                  type="button"
                  onClick={onClearWhatIf}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Clear what-if
                </button>
              ) : null}
            </div>
            {data.analysisNote ? (
              <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs leading-relaxed text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                {data.analysisNote}
              </p>
            ) : null}
          </section>
        ) : null}

        {departmentFaculty ? (
          <FacultySidebarSection
            faculty={departmentFaculty}
            nodeType={isCourse ? "course" : "career"}
            label={data.label}
          />
        ) : null}

        {resources.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-blue/80 dark:text-gaucho-gold/80">
              Resources
            </h3>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li key={resource.url}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-lg border border-gaucho-blue-light/20 bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 px-3 py-2 text-sm text-gaucho-blue dark:text-gaucho-gold-light transition hover:border-gaucho-blue-light/40 hover:bg-gaucho-blue/5 dark:bg-gaucho-blue-dark/40 hover:text-gaucho-blue-dark dark:text-gaucho-gold-light"
                  >
                    <span
                      className="text-gaucho-blue-light transition group-hover:translate-x-0.5"
                      aria-hidden
                    >
                      →
                    </span>
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {showPartnerSection ? (
          <PartnerResourcesSection
            nodeLabel={data.label}
            offers={partnerOffers}
          />
        ) : null}

        {resources.length === 0 && !showPartnerSection && (
          <p className="text-xs text-slate-900 dark:text-slate-500">No resources listed yet.</p>
        )}
      </div>
    </aside>
  );
}
