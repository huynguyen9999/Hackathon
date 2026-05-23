"use client";

import { buildPartnerRedirectUrl } from "@/lib/partners";
import type { PartnerCatalogEntry, PartnerOffers } from "@/lib/types";

type PartnerResourcesSectionProps = {
  nodeLabel: string;
  offers: PartnerOffers;
};

function PartnerOfferLink({
  entry,
  nodeLabel,
  variant,
}: {
  entry: PartnerCatalogEntry;
  nodeLabel: string;
  variant: "affiliate" | "sponsored";
}) {
  const href = buildPartnerRedirectUrl(entry.id, nodeLabel);
  const isSponsored = variant === "sponsored";

  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`group block rounded-lg border px-3 py-2.5 transition ${
          isSponsored
            ? "border-amber-400/40 bg-amber-50/80 hover:border-amber-400/60 hover:bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
            : "border-gaucho-blue-light/20 bg-slate-100 hover:border-gaucho-blue-light/40 hover:bg-gaucho-blue/5 dark:border-gaucho-blue-light/25 dark:bg-slate-800/50 dark:hover:bg-gaucho-blue-dark/40"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium ${
                isSponsored
                  ? "text-amber-900 dark:text-amber-100"
                  : "text-gaucho-blue dark:text-gaucho-gold-light"
              }`}
            >
              {entry.name}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
              {entry.partner_display_name}
              {entry.price_hint ? ` · ${entry.price_hint}` : null}
            </p>
            {entry.description ? (
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {entry.description}
              </p>
            ) : null}
          </div>
          <span
            className={`shrink-0 text-sm transition group-hover:translate-x-0.5 ${
              isSponsored
                ? "text-amber-600 dark:text-amber-400"
                : "text-gaucho-blue-light"
            }`}
            aria-hidden
          >
            →
          </span>
        </div>
      </a>
    </li>
  );
}

export function PartnerResourcesSection({
  nodeLabel,
  offers,
}: PartnerResourcesSectionProps) {
  const { affiliates, sponsored } = offers;
  const hasAffiliates = affiliates.length > 0;
  const hasSponsored = sponsored !== undefined;

  if (!hasAffiliates && !hasSponsored) {
    return null;
  }

  return (
    <section className="mt-6 border-t border-gaucho-blue-light/15 pt-5 dark:border-gaucho-gold/10">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
        Certification alternatives
      </h3>
      <p className="mb-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        Can&apos;t take this in class right now? Here&apos;s an equivalent
        certification.
      </p>

      {hasAffiliates ? (
        <ul className="space-y-2">
          {affiliates.map((entry) => (
            <PartnerOfferLink
              key={entry.id}
              entry={entry}
              nodeLabel={nodeLabel}
              variant="affiliate"
            />
          ))}
        </ul>
      ) : null}

      {hasSponsored && sponsored ? (
        <div className={hasAffiliates ? "mt-4" : undefined}>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 ring-1 ring-amber-400/30 dark:text-amber-200">
              Sponsored
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Featured partner
            </span>
          </div>
          <ul className="space-y-2">
            <PartnerOfferLink
              entry={sponsored}
              nodeLabel={nodeLabel}
              variant="sponsored"
            />
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-[10px] leading-relaxed text-slate-500 dark:text-slate-500">
        Disclosure: Some links above are affiliate or sponsored placements.
        AcadMap may earn a commission if you enroll through these links, at no
        extra cost to you. Organic course resources are listed separately above
        and are not influenced by partner relationships.
      </p>
    </section>
  );
}
