"use client";

import { useMemo, useState } from "react";

import type { ExternalCredit } from "@/lib/planner/contracts";
import { mapCreditRuleToCredit } from "@/lib/planner/credit-mapper";

type CreditRule = {
  exam?: string;
  source?: string;
  external_course?: string;
  min_score?: number;
  mapped_course_codes: string[];
  notes?: string;
};

export type CreditInjectorProps = {
  apRules: CreditRule[];
  transferRules: CreditRule[];
  nodeIdByCourseCode: Map<string, string>;
  externalCredits: ExternalCredit[];
  onAddCredit: (credit: ExternalCredit) => void;
  onRemoveCredit: (creditId: string) => void;
};

export function CreditInjector({
  apRules,
  transferRules,
  nodeIdByCourseCode,
  externalCredits,
  onAddCredit,
  onRemoveCredit,
}: CreditInjectorProps) {
  const [type, setType] = useState<"ap" | "transfer">("ap");
  const [ruleIndex, setRuleIndex] = useState(0);
  const [scoreOrGrade, setScoreOrGrade] = useState("");

  const rules = type === "ap" ? apRules : transferRules;
  const selectedRule = rules[ruleIndex];

  const mappedNodeIds = useMemo(() => {
    if (!selectedRule) return [];
    return mapCreditRuleToCredit({
      id: "preview",
      type,
      rule: selectedRule,
      scoreOrGrade: scoreOrGrade || undefined,
      nodeIdByCourseCode,
    }).mappedNodeIds;
  }, [nodeIdByCourseCode, scoreOrGrade, selectedRule, type]);

  function injectSelectedRule() {
    if (!selectedRule) return;
    onAddCredit(
      mapCreditRuleToCredit({
        id: `${type}-${Date.now()}`,
        type,
        rule: selectedRule,
        scoreOrGrade: scoreOrGrade || undefined,
        nodeIdByCourseCode,
      }),
    );
    setScoreOrGrade("");
  }

  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-4 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
        AP / transfer credit injector
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Inject external credits to mark equivalent roadmap nodes completed.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <select
          value={type}
          onChange={(event) => {
            setType(event.target.value as "ap" | "transfer");
            setRuleIndex(0);
          }}
          className="rounded-md border border-gaucho-blue/15 bg-white px-2 py-2 text-sm dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/50"
        >
          <option value="ap">AP credit</option>
          <option value="transfer">Transfer credit</option>
        </select>

        <select
          value={ruleIndex}
          onChange={(event) => setRuleIndex(Number(event.target.value))}
          className="rounded-md border border-gaucho-blue/15 bg-white px-2 py-2 text-sm dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/50 sm:col-span-2"
        >
          {rules.map((rule, index) => (
            <option key={`${rule.exam ?? rule.external_course}-${index}`} value={index}>
              {rule.exam ?? rule.external_course ?? `Rule ${index + 1}`}
            </option>
          ))}
        </select>

        <input
          value={scoreOrGrade}
          onChange={(event) => setScoreOrGrade(event.target.value)}
          placeholder={type === "ap" ? "AP score (optional)" : "Grade (optional)"}
          className="rounded-md border border-gaucho-blue/15 bg-white px-2 py-2 text-sm dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/50"
        />
        <button
          type="button"
          onClick={injectSelectedRule}
          className="rounded-md bg-gaucho-blue px-3 py-2 text-sm font-semibold text-white transition hover:bg-gaucho-blue-light sm:col-span-2"
        >
          Inject and mark completed ({mappedNodeIds.length} mapped nodes)
        </button>
      </div>

      <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
        {externalCredits.map((credit) => (
          <li key={credit.id} className="flex items-start justify-between gap-3 rounded-md bg-slate-50 px-2 py-1.5 dark:bg-gaucho-blue-dark/50">
            <span>
              <strong>{credit.examOrCourse}</strong> · {credit.mappedNodeIds.length} mapped node(s)
            </span>
            <button
              type="button"
              onClick={() => onRemoveCredit(credit.id)}
              className="text-gaucho-blue hover:underline dark:text-gaucho-gold-light"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
