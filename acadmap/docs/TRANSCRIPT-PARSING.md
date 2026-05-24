# Transcript PDF import

Upload an official transcript PDF on any roadmap page to auto-mark completed courses on the graph.

## How it works

1. User uploads PDF on `/roadmap/[school]/[major]`
2. Server extracts text with `unpdf` (in memory only — **PDF is never stored**)
3. Regex parser extracts course codes + passing grades
4. If regex finds too few courses, AI fallback via Vercel AI Gateway (text only, not raw PDF)
5. Courses are matched to roadmap node labels and previewed before apply
6. User confirms → nodes marked **completed** via the same schedule overlay as manual marking

## Supported formats

Best results:

- UCSB GOLD / Banner **text-based** PDF exports
- UCLA / Berkeley official transcript PDFs with selectable text

Scanned image-only PDFs require AI fallback (`AI_GATEWAY_API_KEY` must be set).

## Environment variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `AI_GATEWAY_API_KEY` | For AI fallback | — | Vercel AI Gateway key |
| `TRANSCRIPT_AI_MODEL` | No | `google/gemini-2.0-flash` | Model for structured extraction |
| `TRANSCRIPT_MAX_FILE_MB` | No | `5` | Upload size limit |
| `TRANSCRIPT_AI_FALLBACK_MIN_COURSES` | No | `3` | Regex threshold before AI |
| `UPSTASH_REDIS_REST_URL` | Prod recommended | — | Rate limit (5 parses/hour/IP) |
| `UPSTASH_REDIS_REST_TOKEN` | Prod recommended | — | Rate limit |

## Privacy (FERPA)

- PDF processed in server memory and discarded after response
- No Supabase/Blob storage of transcript files
- Parsed course list shown only to the uploading browser; applied to `localStorage` schedule unless planner collab is enabled

## API

```
POST /api/transcript/parse
Content-Type: multipart/form-data

file: PDF
roadmapId: string
school: ucsb | ucla | berkeley
```

Response:

```json
{
  "courses": [{ "code": "ECE 152A", "grade": "A", "term": "Fall 2024" }],
  "matched": [{ "nodeId": "...", "code": "ECE 152A", "label": "ECE 152A", "grade": "A" }],
  "unmatched": [{ "code": "WRIT 2", "reason": "Not on this major roadmap" }],
  "parser": "regex"
}
```

## Verify locally

```bash
npm run test:transcript
npm run build
npm run dev
# Open /roadmap/ucsb/electrical-engineering → Import transcript
```

Test with a text-based UCSB transcript PDF export from GOLD.
