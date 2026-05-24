"use client";

import { useCallback, useRef, useState } from "react";

import type {
  MatchedCourse,
  TranscriptParseResponse,
  UnmatchedCourse,
} from "@/lib/transcript/types";

type PanelState = "idle" | "uploading" | "preview" | "applied" | "error";

export type TranscriptUploadPanelProps = {
  roadmapId: string;
  school: string;
  onApply: (matched: MatchedCourse[]) => void;
  onUndo: () => void;
  onUndoAll: () => void;
  canUndo: boolean;
  canUndoAll: boolean;
  appliedCount: number;
  allAppliedCount: number;
};

const MAX_FILE_MB = 5;

const secondaryBtnClass =
  "rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800";

export function TranscriptUploadPanel({
  roadmapId,
  school,
  onApply,
  onUndo,
  onUndoAll,
  canUndo,
  canUndoAll,
  appliedCount,
  allAppliedCount,
}: TranscriptUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<PanelState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptParseResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [lastAppliedCount, setLastAppliedCount] = useState(0);

  const parseFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`PDF must be ${MAX_FILE_MB} MB or smaller.`);
        setState("error");
        return;
      }

      setState("uploading");
      setError(null);
      setResult(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("roadmapId", roadmapId);
        formData.append("school", school);

        const response = await fetch("/api/transcript/parse", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json()) as TranscriptParseResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to parse transcript.");
        }

        setResult(payload);
        setState("preview");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse transcript.");
        setState("error");
      }
    },
    [roadmapId, school],
  );

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) void parseFile(file);
      event.target.value = "";
    },
    [parseFile],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) void parseFile(file);
    },
    [parseFile],
  );

  const onApplyClick = useCallback(() => {
    if (!result?.matched.length) return;
    onApply(result.matched);
    setLastAppliedCount(result.matched.length);
    setState("applied");
  }, [onApply, result]);

  const onReset = useCallback(() => {
    setState("idle");
    setError(null);
    setResult(null);
  }, []);

  const onUndoClick = useCallback(() => {
    onUndo();
    setLastAppliedCount(0);
    setState("idle");
    setResult(null);
  }, [onUndo]);

  const onUndoAllClick = useCallback(() => {
    onUndoAll();
    setLastAppliedCount(0);
    setState("idle");
    setResult(null);
  }, [onUndoAll]);

  const undoCount = appliedCount > 0 ? appliedCount : lastAppliedCount;
  const allCount = allAppliedCount > 0 ? allAppliedCount : lastAppliedCount;
  const showUndoLast = canUndo || (state === "applied" && lastAppliedCount > 0);
  const showUndoAll = canUndoAll && allCount > undoCount;
  const showUndoBanner = showUndoLast || showUndoAll || (canUndoAll && !canUndo);

  return (
    <section className="rounded-2xl border border-gaucho-blue/15 bg-white p-4 shadow-card dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/70">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
            Import transcript
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
            Upload PDF to mark completed courses
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Your PDF is processed in memory and never stored. Best results with
            official UCSB GOLD/Banner transcript exports.
          </p>
        </div>
        {state === "applied" || state === "preview" ? (
          <button type="button" onClick={onReset} className={secondaryBtnClass}>
            Upload another
          </button>
        ) : null}
      </div>

      {showUndoBanner && state !== "applied" ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 dark:border-amber-500/25 dark:bg-amber-950/20">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            {showUndoLast && showUndoAll
              ? "Transcript courses on this roadmap — undo the last apply or every transcript apply."
              : showUndoAll
                ? `Transcript apply active on this roadmap (${allCount} course${allCount === 1 ? "" : "s"} total).`
                : `Transcript apply active on this roadmap (${undoCount} course${undoCount === 1 ? "" : "s"}).`}
          </p>
          <div className="flex flex-wrap gap-2">
            {showUndoLast ? (
              <button type="button" onClick={onUndoClick} className={secondaryBtnClass}>
                Undo transcript apply ({undoCount})
              </button>
            ) : null}
            {showUndoAll || (canUndoAll && !showUndoLast) ? (
              <button type="button" onClick={onUndoAllClick} className={secondaryBtnClass}>
                Undo all transcript applies ({allCount})
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {state === "idle" || state === "error" ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={[
              "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition",
              dragOver
                ? "border-gaucho-gold bg-gaucho-gold/10"
                : "border-gaucho-blue/25 hover:border-gaucho-blue/50 dark:border-gaucho-gold/25 dark:hover:border-gaucho-gold/50",
            ].join(" ")}
          >
            <span className="text-sm font-medium text-gaucho-blue dark:text-gaucho-gold-light">
              Drop PDF here or click to browse
            </span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Max {MAX_FILE_MB} MB · PDF only
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={onFileChange}
          />
          {error ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
        </div>
      ) : null}

      {state === "uploading" ? (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Parsing transcript…
        </p>
      ) : null}

      {state === "preview" && result ? (
        <PreviewTable
          matched={result.matched}
          unmatched={result.unmatched}
          parser={result.parser}
          onApply={onApplyClick}
        />
      ) : null}

      {state === "applied" && result ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
            Applied {lastAppliedCount} completed course
            {lastAppliedCount === 1 ? "" : "s"} to the graph.
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onUndoClick} className={secondaryBtnClass}>
              Undo transcript apply ({lastAppliedCount})
            </button>
            {allCount > lastAppliedCount ? (
              <button type="button" onClick={onUndoAllClick} className={secondaryBtnClass}>
                Undo all transcript applies ({allCount})
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PreviewTable({
  matched,
  unmatched,
  parser,
  onApply,
}: {
  matched: MatchedCourse[];
  unmatched: UnmatchedCourse[];
  parser: string;
  onApply: () => void;
}) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-medium text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
          {matched.length} matched on roadmap
        </span>
        <span className="rounded-full bg-slate-500/10 px-3 py-1 font-medium text-slate-600 ring-1 ring-slate-500/20 dark:text-slate-300">
          {unmatched.length} not on this major
        </span>
        <span className="rounded-full bg-gaucho-gold/15 px-3 py-1 font-medium text-gaucho-blue dark:text-gaucho-gold-light">
          Parsed via {parser}
        </span>
      </div>

      {matched.length > 0 ? (
        <div className="max-h-48 overflow-y-auto rounded-xl border border-gaucho-blue/10 dark:border-gaucho-gold/10">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/80">
              <tr>
                <th className="px-3 py-2">Course</th>
                <th className="px-3 py-2">Grade</th>
              </tr>
            </thead>
            <tbody>
              {matched.map((row) => (
                <tr
                  key={row.nodeId}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">
                    {row.label}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    {row.grade ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No courses from this transcript matched nodes on this roadmap.
        </p>
      )}

      {unmatched.length > 0 ? (
        <details className="text-sm text-slate-600 dark:text-slate-400">
          <summary className="cursor-pointer font-medium">
            {unmatched.length} course{unmatched.length === 1 ? "" : "s"} not on
            this major
          </summary>
          <ul className="mt-2 list-inside list-disc space-y-1 pl-1">
            {unmatched.slice(0, 12).map((row) => (
              <li key={row.code}>
                {row.code}
                {row.grade ? ` (${row.grade})` : ""}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <button
        type="button"
        onClick={onApply}
        disabled={matched.length === 0}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Apply {matched.length} to graph
      </button>
    </div>
  );
}
