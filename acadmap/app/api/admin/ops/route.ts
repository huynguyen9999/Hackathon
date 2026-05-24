import { NextResponse } from "next/server";

import { isAdminOpsAuthorized } from "@/lib/admin-ops-auth";
import { applyDatabaseSchema } from "@/lib/apply-schema";
import { runCommunityBootstrap } from "@/lib/bootstrap-community";
import { runSeedMigration } from "@/lib/migrate-seeds";

export const maxDuration = 300;

export async function POST(request: Request) {
  if (!isAdminOpsAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { action?: string; force?: boolean; offset?: number; limit?: number } =
    {};
  try {
    body = (await request.json()) as {
      action?: string;
      force?: boolean;
      offset?: number;
      limit?: number;
    };
  } catch {
    body = {};
  }

  const action = body.action ?? "migrate-seeds";

  try {
    if (action === "migrate-seeds") {
      const result = await runSeedMigration({
        force: body.force === true,
        offset: body.offset,
        limit: body.limit,
      });
      const status = result.errors.length > 0 ? 207 : 200;
      return NextResponse.json({ action, ...result }, { status });
    }

    if (action === "bootstrap-community") {
      const result = await runCommunityBootstrap();
      return NextResponse.json({ action, ...result });
    }

    if (action === "apply-schema") {
      const result = await applyDatabaseSchema();
      return NextResponse.json({ action, ...result });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[POST /api/admin/ops]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Admin operation failed",
      },
      { status: 500 },
    );
  }
}
