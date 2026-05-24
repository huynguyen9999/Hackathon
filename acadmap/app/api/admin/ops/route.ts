import { NextResponse } from "next/server";

import { isAdminOpsAuthorized } from "@/lib/admin-ops-auth";
import { applyDatabaseSchema } from "@/lib/apply-schema";
import { runCommunityBootstrap } from "@/lib/bootstrap-community";
import { runSeedMigration } from "@/lib/migrate-seeds";
import {
  configureAuthUrls,
  configureGoogleOAuth,
  configureLinkedInOAuth,
  DEFAULT_AUTH_URL_CONFIG,
  verifyGoogleOAuth,
  verifyLinkedInOAuth,
} from "@/lib/supabase-auth-config";

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

    if (action === "configure-auth-urls") {
      const result = await configureAuthUrls(DEFAULT_AUTH_URL_CONFIG);
      return NextResponse.json({ action, configured: true, result });
    }

    if (action === "configure-google-oauth") {
      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
      const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
      if (!clientId || !clientSecret) {
        return NextResponse.json(
          {
            error:
              "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set on the server",
          },
          { status: 400 },
        );
      }

      await configureAuthUrls(DEFAULT_AUTH_URL_CONFIG);
      const result = await configureGoogleOAuth({ clientId, clientSecret });
      const verification = await verifyGoogleOAuth();
      return NextResponse.json({
        action,
        configured: true,
        verification,
        result,
      });
    }

    if (action === "verify-google-oauth") {
      const verification = await verifyGoogleOAuth();
      return NextResponse.json({ action, ...verification });
    }

    if (action === "configure-linkedin-oauth") {
      const clientId = process.env.LINKEDIN_OAUTH_CLIENT_ID?.trim();
      const clientSecret = process.env.LINKEDIN_OAUTH_CLIENT_SECRET?.trim();
      if (!clientId || !clientSecret) {
        return NextResponse.json(
          {
            error:
              "LINKEDIN_OAUTH_CLIENT_ID and LINKEDIN_OAUTH_CLIENT_SECRET must be set on the server",
          },
          { status: 400 },
        );
      }

      await configureAuthUrls(DEFAULT_AUTH_URL_CONFIG);
      const result = await configureLinkedInOAuth({ clientId, clientSecret });
      const verification = await verifyLinkedInOAuth();
      return NextResponse.json({
        action,
        configured: true,
        verification,
        result,
      });
    }

    if (action === "verify-linkedin-oauth") {
      const verification = await verifyLinkedInOAuth();
      return NextResponse.json({ action, ...verification });
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
