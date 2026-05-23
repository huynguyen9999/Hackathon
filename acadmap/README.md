# AcadMap

Interactive degree roadmaps—courses, prerequisites, and career paths—built with Next.js 14, React Flow, and optional Supabase.

**Live:** [hackathon-huynguyen67.vercel.app](https://hackathon-huynguyen67.vercel.app)

## Features

- **Landing** — Hero, feature highlights, links to explore and UCSB CoE hub
- **School hub** — `/schools/ucsb` with GEAR 2025-26 requirements for all 5 CoE majors
- **Roadmap viewer** — React Flow graph with course/career nodes and detail sidebar
- **Explore** — Browse and search approved roadmaps
- **Contribute** — Submit roadmaps (Supabase auth when configured)
- **REST API** — `GET/POST /api/roadmaps`, `GET /api/roadmaps/[id]`, `GET /api/schools`

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
cp .env.example .env.local   # optional until Supabase
npm run dev                  # http://localhost:3000
```

## Deploy (Vercel)

This app deploys from the **monorepo** at [github.com/huynguyen9999/Hackathon](https://github.com/huynguyen9999/Hackathon).

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `acadmap`.
3. Framework: **Next.js** (auto-detected).

Production URL: https://hackathon-huynguyen67.vercel.app

Official curriculum source: [UCSB GEAR 2025-26 PDF](https://engineering.ucsb.edu/sites/default/files/docs/25-26_GEAR.pdf)

## Sample routes

- Home: `/`
- UCSB CoE: `/schools/ucsb`
- EE requirements: `/schools/ucsb/electrical-engineering`
- EE graph: `/roadmap/ucsb/electrical-engineering`
- Explore: `/explore`

## API

- `GET /api/roadmaps` — Approved roadmaps with school + major
- `GET /api/roadmaps/:id` — Full roadmap (nodes + edges)
- `POST /api/roadmaps` — Auth required; seed JSON body
- `GET /api/schools` — Schools with approved roadmaps

## License

MIT (hackathon project)
