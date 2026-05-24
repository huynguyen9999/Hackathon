# iGauchoBack

**Your degree, mapped.**

Interactive degree roadmaps for UC campuses—courses, prerequisites, career paths, and school community hubs. Built with Next.js 14, React Flow, and optional Supabase.

The app lives in [`acadmap/`](./acadmap/). See [acadmap/README.md](./acadmap/README.md) for setup, API docs, and deployment. See [acadmap/AGENTS.md](./acadmap/AGENTS.md) for multi-agent task delegation.

**Live:** [hackathon-nu-taupe.vercel.app](https://hackathon-nu-taupe.vercel.app)

```bash
cd acadmap
npm install
npm run dev
```

Demo roadmap: [http://localhost:3000/roadmap/ucsb/electrical-engineering](http://localhost:3000/roadmap/ucsb/electrical-engineering)

## Deploy (Vercel)

Set the project **Root Directory** to `acadmap`, then deploy from [github.com/huynguyen9999/Hackathon](https://github.com/huynguyen9999/Hackathon). Production ops (Upstash rate limits, Sentry, edge cache): [acadmap/docs/PRODUCTION-OPS.md](./acadmap/docs/PRODUCTION-OPS.md).
