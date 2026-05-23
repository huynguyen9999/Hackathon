import catalogData from "@/data/partners/catalog.json";
import placementsData from "@/data/partners/placements.json";
import type {
  PartnerCatalogEntry,
  PartnerOffers,
  PartnerPlacement,
} from "@/lib/types";

const catalogById = new Map<string, PartnerCatalogEntry>(
  catalogData.entries.map((entry) => [entry.id, entry as PartnerCatalogEntry]),
);

const placements = placementsData.placements as PartnerPlacement[];

function normalizeLabel(label: string): string {
  return label.trim().toUpperCase();
}

function findPlacement(label: string): PartnerPlacement | undefined {
  const normalized = normalizeLabel(label);
  return placements.find((placement) =>
    placement.node_labels.some(
      (nodeLabel) => normalizeLabel(nodeLabel) === normalized,
    ),
  );
}

export function getPartnerCatalogEntry(
  id: string,
): PartnerCatalogEntry | undefined {
  return catalogById.get(id);
}

export function getPartnerOffersForNode(label: string): PartnerOffers {
  const placement = findPlacement(label);
  if (!placement) {
    return { affiliates: [] };
  }

  const affiliates = placement.affiliate_ids
    .map((id) => catalogById.get(id))
    .filter((entry): entry is PartnerCatalogEntry => entry !== undefined);

  const sponsored = placement.sponsored_id
    ? catalogById.get(placement.sponsored_id)
    : undefined;

  return { affiliates, sponsored };
}

export function buildPartnerRedirectUrl(
  partnerId: string,
  nodeLabel?: string,
): string {
  const params = new URLSearchParams();
  if (nodeLabel) {
    params.set("node", nodeLabel);
  }
  const query = params.toString();
  return query ? `/go/${partnerId}?${query}` : `/go/${partnerId}`;
}
