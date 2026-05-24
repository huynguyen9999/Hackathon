# iGauchoBack

**Your degree, mapped.**

Interactive degree roadmaps for UC campuses—official requirements, React Flow graphs, and per-school community hubs. Ships with 70+ JSON seed roadmaps; optional Supabase powers auth, contributions, and live community writes.

**Live:** [hackathon-nu-taupe.vercel.app](https://hackathon-nu-taupe.vercel.app)

## Features

- **Landing & explore** — School picker, searchable major catalog with filters, compare mode, and shareable URLs
- **School community hubs** — Pinned announcements, Q&A, course reviews, alumni outcomes, and contributor spotlight (demo JSON or Supabase-backed)
- **Roadmap viewer** — React Flow graph with course/career nodes, detail sidebar, and Sentry-backed error boundary
- **Major requirement pages** — GEAR-aligned CoE sheets, L&S LASAR/DUELS frameworks, CCS admission + quarter plans
- **Contribute** — Submit roadmaps for review (Supabase auth when configured)
- **UCSB extras** — Course catalog, grade distributions, graduate program index
- **Production hardening** — Upstash per-IP rate limits on roadmap API, Sentry error tracking, edge-cached GET responses
- **Transcript import** — Upload PDF on roadmap pages to auto-mark completed courses ([docs/TRANSCRIPT-PARSING.md](./docs/TRANSCRIPT-PARSING.md))

## Schools

| School | Status | Colleges | Live graphs |
|--------|--------|----------|-------------|
| **UC Santa Barbara** | Full | Engineering (5 BS), Letters & Science (58 majors), Creative Studies (9 majors) | 65+ seed roadmaps |
| **UC Los Angeles** | Preview | Henry Samueli School of Engineering | CS, EE, ME |
| **UC Berkeley** | Preview | College of Engineering (12 majors catalog) | EECS pilot |

UCSB curriculum source: [GEAR 2025-26 PDF](https://engineering.ucsb.edu/sites/default/files/docs/25-26_GEAR.pdf)

## Tech stack

- **Next.js 14** (App Router) · **React Flow** · **Tailwind CSS**
- **Supabase** — auth (Google, GitHub, LinkedIn OAuth), roadmap submissions, community tables
- **Upstash Redis** — sliding-window rate limits on `/api/roadmaps*`
- **Sentry** — client graph crashes, API errors, middleware failures

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm

## Setup

```bash
npm install
cp .env.example .env.local   # optional for JSON-only local dev
npm run dev                  # http://localhost:3000
```

Without Supabase env vars, the app runs on local JSON seeds—auth, contribute submissions, and live community writes are disabled.

### Environment variables

Copy `.env.example` to `.env.local`. Key groups:

| Group | Variables | Required for |
|-------|-----------|--------------|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Auth, contribute, community, maintainer PATCH |
| App URL | `NEXT_PUBLIC_SITE_URL` | OAuth redirects |
| Upstash | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Production rate limiting |
| Sentry | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | Production error tracking |

Setup guides:

- [docs/COMMUNITY-SETUP.md](./docs/COMMUNITY-SETUP.md) — Supabase schema, OAuth, community tables
- [docs/PRODUCTION-OPS.md](./docs/PRODUCTION-OPS.md) — Upstash, Sentry, edge cache on Vercel

## Deploy (Vercel)

Deploy from the monorepo at [github.com/huynguyen9999/Hackathon](https://github.com/huynguyen9999/Hackathon).

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `acadmap`.
3. Framework: **Next.js** (auto-detected).
4. Add env vars from `.env.example` (see [PRODUCTION-OPS.md](./docs/PRODUCTION-OPS.md)).

```bash
npm run build
git push origin main
```

## Sample routes

| Route | Description |
|-------|-------------|
| `/` | Landing |
| `/explore` | Search and filter majors across schools |
| `/schools` | School directory |
| `/schools/ucsb` | UCSB community hub + college picker |
| `/schools/ucsb/engineering` | CoE major catalog |
| `/schools/ucsb/letters-science` | L&S major catalog |
| `/schools/ucsb/creative-studies` | CCS major catalog |
| `/schools/ucla` | UCLA preview hub |
| `/schools/berkeley` | Berkeley preview hub |
| `/roadmap/ucsb/electrical-engineering` | Interactive EE graph |
| `/roadmap/ucla/computer-science` | UCLA CS graph |
| `/roadmap/berkeley/eecs` | Berkeley EECS graph |
| `/schools/ucsb/courses` | UCSB course catalog |
| `/schools/ucsb/grades` | UCSB grade distributions |
| `/contribute` | Submit a roadmap |

## API

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/roadmaps` | Approved roadmaps (edge-cached) |
| GET | `/api/roadmaps/:id` | Full roadmap detail (edge-cached) |
| POST | `/api/roadmaps` | Submit roadmap — auth required |
| PATCH | `/api/roadmaps/:id` | Approve/reject — maintainer only |
| GET | `/api/schools` | Schools with approved roadmaps |
| POST | `/api/transcript/parse` | Parse transcript PDF → match courses to roadmap |

Rate limits (when Upstash is configured): 120 GET / 10 write requests per IP per 60 seconds on `/api/roadmaps*`; 20 transcript parses per IP per hour.

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/SITE-LAYOUT.md](./docs/SITE-LAYOUT.md) | Page hierarchy and component map |
| [docs/GEAR-25-26.md](./docs/GEAR-25-26.md) | UCSB CoE curriculum sources |
| [docs/UCSB-CURRICULUM.md](./docs/UCSB-CURRICULUM.md) | UCSB course catalog connector |
| [docs/COMMUNITY-SETUP.md](./docs/COMMUNITY-SETUP.md) | Supabase + OAuth for community |
| [docs/PRODUCTION-OPS.md](./docs/PRODUCTION-OPS.md) | Rate limits, Sentry, edge cache |
| [docs/TRANSCRIPT-PARSING.md](./docs/TRANSCRIPT-PARSING.md) | PDF transcript import setup |
| [AGENTS.md](./AGENTS.md) | Multi-agent delegation guide |

## License

MIT (hackathon project)
