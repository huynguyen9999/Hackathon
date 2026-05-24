# Production ops — rate limits, observability, edge cache

## Upstash rate limiting (roadmap API)

Protects `GET/POST/PATCH /api/roadmaps*` with per-IP sliding windows via Edge middleware.

| Method | Limit |
|--------|-------|
| GET | 120 requests / 60 seconds |
| POST, PATCH | 10 requests / 60 seconds |

### Setup

1. [Upstash Console](https://console.upstash.com/) → **Create database** (Regional, near `us-east-1` for Vercel iad1)
2. Copy **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN** from the REST API section
3. Add to Vercel → Project → Environment Variables (Production + Preview)
4. Optional local: add to `.env.local` for testing 429 responses

If Upstash env vars are **not** set, rate limiting is skipped (local dev works without Redis).

### Verify

```bash
# After env is set on production:
for i in $(seq 1 130); do
  curl -s -o /dev/null -w "%{http_code}\n" https://hackathon-nu-taupe.vercel.app/api/roadmaps
done
# Expect 200s then 429 with Retry-After header
```

---

## Sentry error tracking

Captures client graph crashes (React Flow error boundary), server API failures, and edge middleware errors.

### Setup

1. [sentry.io](https://sentry.io/) → Create project → **Next.js**
2. Copy the DSN
3. Vercel env vars:

| Name | Value |
|------|--------|
| `SENTRY_DSN` | Project DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | Same DSN (client SDK) |
| `SENTRY_ORG` | Optional — org slug for source map upload |
| `SENTRY_PROJECT` | Optional — project slug |
| `SENTRY_AUTH_TOKEN` | Optional — CI source maps only |

Sentry is **enabled in production only** when a DSN is present.

### What gets reported

- `RoadmapGraphErrorBoundary` — React Flow render failures
- `GET/POST /api/roadmaps` — unhandled server errors
- Automatic Next.js request errors (via `@sentry/nextjs`)

---

## Edge caching (roadmap GET API)

Approved roadmap JSON is cacheable at Vercel's edge (not user-specific):

| Route | Cache-Control |
|-------|----------------|
| `GET /api/roadmaps` | `public, s-maxage=3600, stale-while-revalidate=86400` |
| `GET /api/roadmaps/[id]` | same |

POST/PATCH responses use `Cache-Control: no-store`.

**Requires `SUPABASE_SERVICE_ROLE_KEY` on Vercel** for GET handlers to avoid cookie-based session reads (which disable edge caching). The key is already needed for maintainer PATCH routes.

### Verify

```bash
curl -I https://hackathon-nu-taupe.vercel.app/api/roadmaps
# Cache-Control: public, s-maxage=3600, ...
# x-vercel-cache: HIT (on repeat requests)
```

**Note:** After a maintainer approves a new roadmap via PATCH, edge cache may serve stale list/detail for up to 1 hour. Acceptable for static seed data; shorten `s-maxage` in `lib/http-cache.ts` if needed.

---

## Transcript PDF import

`POST /api/transcript/parse` — upload PDF, extract courses, match to roadmap nodes.

| Control | Setting |
|---------|---------|
| Rate limit | **5 parses / hour / IP** (prefix `rl:transcript`) |
| Max file size | 5 MB (override with `TRANSCRIPT_MAX_FILE_MB`) |
| AI fallback | Requires `AI_GATEWAY_API_KEY` on Vercel |

See [TRANSCRIPT-PARSING.md](./TRANSCRIPT-PARSING.md) for setup and privacy notes.

### Verify

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://hackathon-nu-taupe.vercel.app/api/transcript/parse
# Expect 400 (missing file), not 404
```

---

## Deploy checklist

```bash
cd acadmap
npm run build
git push origin main
```

Ensure Vercel has: Supabase vars (existing), **`SUPABASE_SERVICE_ROLE_KEY`** (edge cache + maintainer PATCH), Upstash vars, Sentry DSN vars, **`AI_GATEWAY_API_KEY`** (transcript AI fallback).
