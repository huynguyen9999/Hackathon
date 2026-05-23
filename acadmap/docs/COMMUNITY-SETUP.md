# Live community writes — setup guide

Follow these steps once to enable Supabase-backed Q&A, reviews, and announcements.

## 1. Create Supabase project

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Region: `us-east-1` (near Vercel iad1)
3. Save the database password

## 2. Run database schema

**SQL Editor** → New query → paste and run the full file:

```
acadmap/supabase/schema.sql
```

This creates roadmap tables, planner tables, and community tables (`user_profiles`, `community_questions`, `school_announcements`, etc.).

## 3. GitHub OAuth

### GitHub OAuth App

GitHub → Settings → Developer settings → OAuth Apps → New:

| Field | Value |
|-------|--------|
| Homepage URL | `https://hackathon-nu-taupe.vercel.app` |
| Callback URL | `https://<PROJECT-REF>.supabase.co/auth/v1/callback` |

### Supabase

**Authentication → Providers → GitHub** — paste Client ID + Secret, enable.

**Authentication → URL Configuration**

- Site URL: `https://hackathon-nu-taupe.vercel.app`
- Redirect URLs:
  - `https://hackathon-nu-taupe.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

## 4. Environment variables

### Vercel (Project → Settings → Environment Variables)

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` public key |
| `NEXT_PUBLIC_SITE_URL` | `https://hackathon-nu-taupe.vercel.app` |

Redeploy from `acadmap/`:

```bash
cd acadmap && vercel --prod --yes
```

### Local

```bash
cp .env.example .env.local
# fill in the three NEXT_PUBLIC_* values
```

Verify: open `/contribute` — the “Supabase not configured” warning should be gone.

## 5. Bootstrap maintainer

1. Sign in: `/auth/sign-in?next=/schools/ucla`
2. Supabase → **Authentication → Users** → copy your UUID
3. SQL Editor → run [`supabase/scripts/bootstrap-community.sql`](../supabase/scripts/bootstrap-community.sql) with your UUID

## 6. Verified student badges

Answers show “Verified student” when your GitHub account’s **public email** ends with `@ucla.edu` or `@ucsb.edu`. Set this in GitHub → Settings → Emails → check “Keep my email addresses private” **off** and set a public school email.

## 7. Smoke test

1. `/schools/ucla` — pinned announcement from DB (not demo JSON)
2. Sign in → use **Ask a question** form on the hub
3. Submit a **course review** in the sidebar form
4. Maintainer: use **Pin announcement** form (visible only to maintainers)
