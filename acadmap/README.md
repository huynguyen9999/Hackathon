# AcadMap

Interactive degree roadmaps—courses, prerequisites, and career paths—built with Next.js 14, React Flow, and optional Supabase.

## Features

- **Landing** — Hero, feature highlights, links to explore and sample UCSB EE roadmap
- **Explore** — Browse and search seed (and Supabase) roadmaps
- **Roadmap viewer** — React Flow graph with course/career nodes and detail sidebar
- **Contribute** — Submit new school/major proposals (API stub until Supabase auth)
- **REST API** — `GET/POST /api/roadmaps`, `GET /api/roadmaps/[id]`, `GET /api/schools`

## Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

## Setup

```bash
cd acadmap
npm install
cp .env.example .env.local
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No* | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No* | Supabase anon key for client/server reads |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Service role for admin writes (future) |

\*Local development works with JSON seeds in `data/seeds/` only. Without Supabase env vars, the app serves seed roadmaps and skips remote fetches.

## Supabase migration

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run the schema in [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy your project URL and anon key into `.env.local`.
4. (Optional) Enable GitHub auth in Supabase Authentication for contributor sign-in.

## Development

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint (Next.js config)
```

### Sample routes

- Home: `/`
- Explore: `/explore`
- UCSB Electrical Engineering: `/roadmap/ucsb/electrical-engineering`
- Contribute: `/contribute`

## Project structure

```
acadmap/
├── app/                 # App Router pages & API routes
├── components/          # UI, RoadmapGraph, RoadmapView, forms
├── data/seeds/          # JSON roadmaps (server-loaded)
├── lib/                 # types, roadmap loader, flow adapters, Supabase
└── supabase/schema.sql  # Postgres schema + RLS
```

## API

- `GET /api/roadmaps` — Approved roadmaps with `school` + `major` (no nodes/edges)
- `GET /api/roadmaps/:id` — Full roadmap including nodes and edges (approved only)
- `POST /api/roadmaps` — **Auth required.** Body = seed JSON (`school`, `major`, `nodes`, `edges`). Inserts into Supabase with `status: "pending"`.
- `GET /api/schools` — Schools that have at least one approved roadmap

Example POST body: see `data/seeds/ucsb-electrical-engineering.json`.

## License

MIT (hackathon project)
