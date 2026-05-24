const MANAGEMENT_API = "https://api.supabase.com/v1";

export type OAuthCredentialsInput = {
  clientId: string;
  clientSecret: string;
};

export type AuthUrlConfigInput = {
  siteUrl: string;
  redirectUrls: string[];
};

export type OAuthVerifyResult = {
  ok: boolean;
  status: number;
  message: string;
  redirectUri?: string;
};

export type OAuthProviderSlug = "google" | "linkedin_oidc";

const OAUTH_PROVIDER_VERIFY: Record<
  OAuthProviderSlug,
  { host: string; label: string }
> = {
  google: { host: "accounts.google.com", label: "Google" },
  linkedin_oidc: { host: "linkedin.com", label: "LinkedIn" },
};

function projectRefFromSupabaseUrl(url: string): string {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match?.[1]) {
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: ${url}`);
  }
  return match[1];
}

function managementHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export function getSupabaseProjectRef(): string {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
    process.env.SUPABASE_URL?.trim();
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  return projectRefFromSupabaseUrl(url);
}

export function getSupabaseAccessToken(): string {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN is not set (Supabase dashboard → Account → Access Tokens)",
    );
  }
  return token;
}

export async function patchSupabaseAuthConfig(
  accessToken: string,
  projectRef: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await fetch(
    `${MANAGEMENT_API}/projects/${projectRef}/config/auth`,
    {
      method: "PATCH",
      headers: managementHeaders(accessToken),
      body: JSON.stringify(body),
    },
  );

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : `Management API PATCH failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export async function configureGoogleOAuth(
  input: OAuthCredentialsInput,
): Promise<Record<string, unknown>> {
  const accessToken = getSupabaseAccessToken();
  const projectRef = getSupabaseProjectRef();

  return patchSupabaseAuthConfig(accessToken, projectRef, {
    external_google_enabled: true,
    external_google_client_id: input.clientId.trim(),
    external_google_secret: input.clientSecret.trim(),
  });
}

export async function configureLinkedInOAuth(
  input: OAuthCredentialsInput,
): Promise<Record<string, unknown>> {
  const accessToken = getSupabaseAccessToken();
  const projectRef = getSupabaseProjectRef();

  return patchSupabaseAuthConfig(accessToken, projectRef, {
    external_linkedin_oidc_enabled: true,
    external_linkedin_oidc_client_id: input.clientId.trim(),
    external_linkedin_oidc_secret: input.clientSecret.trim(),
  });
}

export async function configureAuthUrls(
  input: AuthUrlConfigInput,
): Promise<Record<string, unknown>> {
  const accessToken = getSupabaseAccessToken();
  const projectRef = getSupabaseProjectRef();

  return patchSupabaseAuthConfig(accessToken, projectRef, {
    site_url: input.siteUrl.trim(),
    uri_allow_list: input.redirectUrls.map((url) => url.trim()).join(","),
  });
}

function appCallbackUrl(): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://hackathon-nu-taupe.vercel.app"}/auth/callback`;
}

export async function verifyOAuthProvider(
  provider: OAuthProviderSlug,
): Promise<OAuthVerifyResult> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
    process.env.SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.SUPABASE_ANON_KEY?.trim();
  const { host, label } = OAUTH_PROVIDER_VERIFY[provider];

  if (!supabaseUrl || !anonKey) {
    return {
      ok: false,
      status: 0,
      message: "Supabase URL or anon key is not configured",
    };
  }

  const redirectTo = encodeURIComponent(appCallbackUrl());

  const response = await fetch(
    `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectTo}`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      redirect: "manual",
    },
  );

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location") ?? "";
    const redirectMatch = location.match(/redirect_uri=([^&]+)/);
    const redirectUri = redirectMatch
      ? decodeURIComponent(redirectMatch[1])
      : SUPABASE_OAUTH_CALLBACK_URI;

    if (location.includes(host)) {
      return {
        ok: true,
        status: response.status,
        message: `${label} OAuth redirect is configured`,
        redirectUri,
      };
    }
  }

  const body = await response.text();
  let message = body;
  try {
    const parsed = JSON.parse(body) as { msg?: string };
    if (parsed.msg) message = parsed.msg;
  } catch {
    // keep raw body
  }

  return {
    ok: false,
    status: response.status,
    message,
    redirectUri: SUPABASE_OAUTH_CALLBACK_URI,
  };
}

export async function verifyGoogleOAuth(): Promise<OAuthVerifyResult> {
  return verifyOAuthProvider("google");
}

export async function verifyLinkedInOAuth(): Promise<OAuthVerifyResult> {
  return verifyOAuthProvider("linkedin_oidc");
}

export const SUPABASE_OAUTH_CALLBACK_URI =
  "https://jhdxccwfisyhuqblartj.supabase.co/auth/v1/callback";

/** @deprecated Use SUPABASE_OAUTH_CALLBACK_URI */
export const GOOGLE_OAUTH_REDIRECT_URI = SUPABASE_OAUTH_CALLBACK_URI;

export const LINKEDIN_OAUTH_REDIRECT_URI = SUPABASE_OAUTH_CALLBACK_URI;

export const DEFAULT_AUTH_URL_CONFIG: AuthUrlConfigInput = {
  siteUrl: "https://hackathon-nu-taupe.vercel.app",
  redirectUrls: [
    "https://hackathon-nu-taupe.vercel.app/auth/callback",
    "http://localhost:3000/auth/callback",
  ],
};
