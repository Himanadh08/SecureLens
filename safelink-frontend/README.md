# SafeLink — URL Safety Scanner Frontend

> **Know before you click.** A Next.js 14 + TypeScript frontend for the SecureLens URL security & threat assessment system.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |

## Quick Start

This frontend is part of the one-command development setup at the repository root — do **not** start the backend manually:

```bash
# from the project root
npm install
npm run dev
```

Then open [http://localhost:3001](http://localhost:3001). This automatically:

1. Installs the frontend dependencies (root `postinstall` runs `npm install` here)
2. Starts the FastAPI backend on internal port 8000 and waits for its `/health` check
3. Starts this Next.js app on port 3001
4. Proxies all `/api/*` requests to the backend — the browser never talks to port 8000 directly

> Frontend-only development (rare): you can run `npm run dev` in this directory, but you would then need the backend running separately. For all normal development use the root command above.

> Backend API reference: [http://localhost:8000/docs](http://localhost:8000/docs) (while `npm run dev` is running).

## File Structure

```
safelink-frontend/
├── app/
│   ├── layout.tsx          # Root layout, dark theme, Inter font
│   ├── page.tsx            # Main scan page
│   └── globals.css         # Tailwind + custom CSS variables
├── components/
│   ├── URLInput.tsx        # Input field + scan button
│   ├── ResultCard.tsx      # Full result display (glassmorphism)
│   ├── CheckRow.tsx        # Individual check result row
│   ├── ScoreRing.tsx       # Animated SVG circular score
│   ├── VerdictBadge.tsx    # SAFE / SUSPICIOUS / DANGEROUS badge
│   └── ExampleChips.tsx    # Clickable example URL pills
├── types/
│   └── scan.ts             # All TypeScript interfaces
├── lib/
│   └── api.ts              # API client (POST /analyze, 20s timeout)
└── hooks/
    └── useScan.ts          # Scan state management hook
```

## API Contract

The browser only talks to this Next.js origin: `lib/api.ts` POSTs to `/api/analyze`, which `next.config.mjs` proxies to the FastAPI backend (`BACKEND_ORIGIN`, default `http://127.0.0.1:8000`). No backend URL is exposed to the browser.

```json
// POST /api/analyze
// Request
{ "url": "https://example.com" }

// Response
{
  "url": "https://example.com",
  "total_score": 15,
  "max_score": 150,
  "verdict": "safe",
  "highest_status": "safe",
  "checks": [
    { "name": "SSL / HTTPS", "score": 0, "status": "safe", "reason": "Valid SSL certificate confirmed..." }
  ],
  "explanations": [],
  "recommendation": "No significant threats were detected by the available checks. This does not guarantee that the website is completely safe.",
  "website_info": {
    "url": "https://example.com",
    "scheme": "https",
    "domain": "example.com",
    "hostname": "example.com",
    "domain_info": "Not available",
    "page_title": "Not available",
    "description": "Not available",
    "technologies": "Not available",
    "registration": "Not available",
    "server": "Not available"
  },
  "scanned_at": "2024-01-01T12:00:00Z"
}
```

`explanations` lists only the checks that actually triggered (score > 0 or an explicit finding); skipped/unavailable integrations are excluded so no invented reasons are shown.

## Design System

| Token | Value |
|---|---|
| Background | `#0a0a0f` |
| Surface | `#12121a` |
| Purple accent | `#7c3aed` |
| Safe green | `#10b981` |
| Warning amber | `#f59e0b` |
| Danger red | `#ef4444` |
