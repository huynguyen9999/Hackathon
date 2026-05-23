"use client";

import type { DegreeAuditRules } from "@/lib/planner/degree-audit";
import { useEffect, useState } from "react";

import { exportPlanAsPdf } from "@/lib/planner/export-plan-pdf";
import { quarterKey, type QuarterKey } from "@/lib/planner/plan-types";
import { usePlanState } from "@/lib/planner/use-plan-state";
import type { RoadmapDetail } from "@/lib/types";
import { CommentsPanel } from "@/components/planner/CommentsPanel";
import { CreditInjector } from "@/components/planner/CreditInjector";
import { CourseDrawer } from "@/components/planner/CourseDrawer";
import { QuarterGrid } from "@/components/planner/QuarterGrid";
import { ValidationPanel } from "@/components/planner/ValidationPanel";

export type PlannerWorkspaceProps = {
  roadmap: RoadmapDetail;
  auditRules: DegreeAuditRules | null;
  apRules: Array<{
    exam?: string;
    source?: string;
    external_course?: string;
    min_score?: number;
    mapped_course_codes: string[];
    notes?: string;
  }>;
  transferRules: Array<{
    exam?: string;
    source?: string;
    external_course?: string;
    min_score?: number;
    mapped_course_codes: string[];
    notes?: string;
  }>;
  onPlannerNodeStatusChange?: (statusByNodeId: Record<string, "planned" | "completed">) => void;
  className?: string;
};

export function PlannerWorkspace({
  roadmap,
  auditRules,
  apRules,
  transferRules,
  onPlannerNodeStatusChange,
  className = "",
}: PlannerWorkspaceProps) {
  const planner = usePlanState({ roadmap, auditRules });
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);

  const assignedNodeIds = new Set(
    Object.values(planner.assignments).flatMap((ids) => ids),
  );

  const allStatusNodeIds = new Set(Object.keys(planner.statusByNodeId));

  const assignedOrStatus = new Set([...assignedNodeIds, ...allStatusNodeIds]);

  const quarterRows = (Object.keys(planner.assignments) as QuarterKey[])
    .sort()
    .map((key) => {
      const nodeIds = planner.assignments[key] ?? [];
      const nodes = nodeIds
        .map((nodeId) => planner.nodesById.get(nodeId))
        .filter((node): node is NonNullable<typeof node> => Boolean(node));
      return {
        quarter: key,
        courses: nodes.map((node) => node.label),
        units: nodes.reduce((sum, node) => sum + (node.units ?? 4), 0),
      };
    });

  const defaultQuarter = quarterKey(1, "Fall");

  function handleExportPdf() {
    if (!planner.auditSnapshot) return;
    exportPlanAsPdf({
      title: planner.title,
      majorName: roadmap.major.name,
      quarterRows,
      audit: planner.auditSnapshot,
      validationIssues: planner.validationIssues,
    });
  }

  async function createShareLink(role: "advisor" | "viewer") {
    if (!planner.planId) {
      setShareError("Save plan first to create a share link.");
      return;
    }

    setShareLoading(true);
    setShareError(null);

    try {
      const res = await fetch(`/api/plans/${planner.planId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const body = (await res.json()) as { shareUrl?: string; error?: string };
      if (!res.ok || !body.shareUrl) {
        throw new Error(body.error ?? "Failed to generate share link.");
      }

      setShareUrl(body.shareUrl);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(body.shareUrl);
      }
    } catch (err) {
      setShareError(err instanceof Error ? err.message : "Failed to create share link.");
    } finally {
      setShareLoading(false);
    }
  }

  useEffect(() => {
    if (onPlannerNodeStatusChange) {
      onPlannerNodeStatusChange(planner.statusByNodeId);
    }
  }, [onPlannerNodeStatusChange, planner.statusByNodeId]);

  return (
    <section className={`space-y-4 ${className}`}>
      <header className="rounded-xl border border-gaucho-blue/15 bg-white p-4 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gaucho-blue dark:text-gaucho-gold-light">
              Personalization layer
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Plan across 8 quarters, inject AP/transfer credit, and track degree progress.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Advising aid only — not an official UCSB degree audit replacement.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={planner.persist}
              disabled={planner.isSaving}
              className="rounded-md bg-gaucho-blue px-3 py-2 text-xs font-semibold text-white transition hover:bg-gaucho-blue-light disabled:opacity-60"
            >
              {planner.isSaving ? "Saving..." : "Save collaborative plan"}
            </button>
            <button
              type="button"
              onClick={() => createShareLink("advisor")}
              disabled={shareLoading}
              className="rounded-md border border-gaucho-blue/20 px-3 py-2 text-xs font-semibold text-gaucho-blue transition hover:bg-gaucho-blue/5 disabled:opacity-60 dark:border-gaucho-gold/25 dark:text-gaucho-gold-light"
            >
              {shareLoading ? "Creating..." : "Advisor link"}
            </button>
            <button
              type="button"
              onClick={() => createShareLink("viewer")}
              disabled={shareLoading}
              className="rounded-md border border-gaucho-blue/20 px-3 py-2 text-xs font-semibold text-gaucho-blue transition hover:bg-gaucho-blue/5 disabled:opacity-60 dark:border-gaucho-gold/25 dark:text-gaucho-gold-light"
            >
              Viewer link
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={!planner.auditSnapshot}
              className="rounded-md border border-gaucho-blue/20 px-3 py-2 text-xs font-semibold text-gaucho-blue transition hover:bg-gaucho-blue/5 disabled:opacity-60 dark:border-gaucho-gold/25 dark:text-gaucho-gold-light"
            >
              Export PDF
            </button>
            <button
              type="button"
              onClick={planner.clearPlan}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {planner.planId
            ? `Plan ID ${planner.planId}`
            : "No collaborative plan created yet (saved locally until first save)."}
          {planner.lastSavedAt ? ` · Last saved ${new Date(planner.lastSavedAt).toLocaleString()}` : ""}
        </p>
        {shareUrl ? (
          <p className="mt-2 break-all rounded-md bg-gaucho-blue/5 px-2 py-1 text-xs text-gaucho-blue dark:bg-gaucho-blue-dark/60 dark:text-gaucho-gold-light">
            Share URL (copied): {shareUrl}
          </p>
        ) : null}
        {shareError ? (
          <p className="mt-2 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-300">
            {shareError}
          </p>
        ) : null}
        {planner.saveError ? (
          <p className="mt-2 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-300">
            {planner.saveError}
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.5fr,1fr]">
        <QuarterGrid
          assignments={planner.assignments}
          nodesById={planner.nodesById}
          onAssign={(nodeId, key) => {
            planner.ensurePlanned(nodeId, key ?? defaultQuarter);
          }}
        />
        <CourseDrawer
          nodes={planner.courseNodes}
          assignedNodeIds={assignedOrStatus}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CreditInjector
          apRules={apRules}
          transferRules={transferRules}
          nodeIdByCourseCode={planner.nodeCourseCodeMap}
          externalCredits={planner.externalCredits}
          onAddCredit={planner.addExternalCredit}
          onRemoveCredit={planner.removeExternalCredit}
        />
        <ValidationPanel
          issues={planner.validationIssues}
          auditSnapshot={planner.auditSnapshot}
        />
        <CommentsPanel planId={planner.planId} />
      </div>
    </section>
  );
}
