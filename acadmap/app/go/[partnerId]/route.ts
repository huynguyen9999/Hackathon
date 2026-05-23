import { NextResponse } from "next/server";

import { getPartnerCatalogEntry } from "@/lib/partners";

type ClickLog = {
  partnerId: string;
  nodeLabel?: string;
  destination: string;
  timestamp: string;
};

const clickLog: ClickLog[] = [];

export function GET(
  request: Request,
  { params }: { params: { partnerId: string } },
) {
  const entry = getPartnerCatalogEntry(params.partnerId);
  if (!entry) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const nodeLabel = url.searchParams.get("node") ?? undefined;

  const logEntry: ClickLog = {
    partnerId: params.partnerId,
    nodeLabel,
    destination: entry.url,
    timestamp: new Date().toISOString(),
  };
  clickLog.push(logEntry);
  console.info("[partner-redirect]", logEntry);

  return NextResponse.redirect(entry.url);
}
