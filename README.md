# SecureLens

URL Security & Threat Assessment

A modern web-based URL security analysis and threat assessment application.

## Overview

SecureLens analyzes a submitted URL and returns a structured risk assessment:

- Analyzes the submitted URL across several independent security checks (domain age via WHOIS, suspicious URL keywords, Google Safe Browsing when an API key is configured, lookalike/typosquat domain detection, and SSL/HTTPS validation).
- Collects available security and website information (scheme, registered domain, hostname, and registration notes when WHOIS data is available).
- Evaluates the findings into a weighted risk score (0–150) and a verdict: **safe**, **suspicious**, or **dangerous**.
- Explains suspicious indicators using only the evidence the checks actually found — findings that could not be verified are reported as skipped or unavailable rather than invented.
- Provides a **Security Assessment** — a verdict-appropriate recommendation on how to proceed.
- Handles incomplete or unavailable information gracefully: individual checks that time out or fail become warnings, and the rest of the analysis continues.

A "safe" verdict means no risk indicators were detected by the available checks. It is **not** an absolute guarantee that a URL is harmless.

## Key Features

- **URL analysis** — five concurrent security checks per scan with a per-check breakdown
- **Indicator explanations** — evidence-based "why is this suspicious" details listing only findings that actually triggered
- **Security Assessment** — final verdict-appropriate recommendation
- **Website Information** — site facts derived from the URL and WHOIS data; missing values are shown as "Not available"
- **Safe / suspicious / dangerous verdict** — weighted 0–150 score with configurable thresholds
- **Malformed URL validation** — URLs must include a scheme (`http://` / `https://`); invalid input returns a clear error
- **Graceful degradation** — per-check timeouts, skipped optional services, and partial data never break a scan
- **Next.js frontend** — dark, responsive dashboard with scan history (stored locally in the browser)
- **FastAPI backend** — async Python API with health endpoint and OpenAPI docs
- **One-command development setup** — a single `npm run dev` starts both servers
- **Same-origin API proxy** — browser calls `/api/*` on the frontend origin; Next.js forwards them to the backend server-side (no CORS, backend URL never exposed)

## Architecture

```
Browser
  ↓
Next.js frontend  →  http://localhost:3001   (the only user-facing port)
  ↓
/api/* requests proxied server-side by Next.js rewrites
  ↓
FastAPI backend  →  http://127.0.0.1:8000    (internal only)
  ↓
Analysis services (WHOIS, Safe Browsing, keyword/lookalike heuristics, SSL validation)
```

Port 8000 is internal. Normal users only interact with `http://localhost:3001`; the Next.js server forwards API requests to the backend automatically.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide icons |
| Backend | Python 3.10+, FastAPI, Uvicorn, Pydantic, python-whois, tldextract, requests |
| Dev tooling | npm, concurrently, wait-on |
| Containers | Docker, Docker Compose (both services have Dockerfiles) |
| CI/CD | GitHub Actions, Jenkins |

## How It Works

1. The user submits a URL in the web UI.
2. The frontend sends the request to same-origin `/api/analyze`; Next.js proxies it to the FastAPI backend.
3. The backend runs the five security checks concurrently, each inside a thread pool with its own timeout. WHOIS and Safe Browsing results may be unavailable (missing key, registry timeout) and are reported as such.
4. Findings are aggregated and scored (0–150) and mapped to a verdict.
5. The backend builds the evidence-based explanation list (only triggered findings), the Security Assessment recommendation, and the Website Information block derived from the URL and WHOIS data already collected.
6. The frontend displays the verdict, per-check breakdown, Why Suspicious explanations, Security Assessment, and Website Information. The scan is saved to the browser's local history.

## Getting Started

### Requirements

- Node.js 18+
- Python 3.10+ with pip
- (Optional) A Google Safe Browsing API key — the scan works without it; the check reports as skipped

### Installation

From the project root:

```bash
npm install
```

This installs the root tooling and the frontend dependencies (via `postinstall`).

### Run

```bash
npm run dev
```

Then open **http://localhost:3001**.

You do **not** need to start Python, run `uvicorn`, or open a second terminal — `npm run dev` starts the FastAPI backend automatically, waits until its health check passes, then starts the Next.js frontend. Stop both with `Ctrl+C`.

## API / Backend

The FastAPI backend listens internally on `127.0.0.1:8000` and is not intended to be called directly from the browser. Next.js rewrites forward all `/api/*` requests to it (configurable via the `BACKEND_ORIGIN` environment variable, default `http://127.0.0.1:8000`).

Main endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/analyze` | POST | Run the URL analysis — `{ "url": "https://…" }` |
| `/api/health` | GET | Health check (proxied from the backend's `/health`) |

While the app is running, FastAPI's auto-generated API docs are available at `http://localhost:8000/docs`.

## Project Structure

```
├── package.json                  # One-command dev setup (backend + frontend)
├── docker-compose.yml            # Optional containerized deployment
├── Jenkinsfile                   # Deploy pipeline (pulls published images)
├── .github/workflows/ci.yml      # Tests + Docker image publishing
├── phishing-detector/backend/    # FastAPI backend
│   ├── main.py                   # API, validation, orchestration
│   ├── checks/                   # domain_age, keywords, lookalike, safe_browsing, ssl_check
│   ├── scorer.py                 # Score aggregation + verdict
│   ├── explanations.py           # Evidence-based explanations + recommendations
│   ├── smoke_test.py             # Live-server smoke test
│   ├── requirements.txt
│   └── Dockerfile
└── safelink-frontend/            # Next.js frontend
    ├── app/                      # Pages and layout
    ├── components/               # ResultCard, WhySuspicious, SecurityAssessment, WebsiteInfo, …
    ├── hooks/useScan.ts          # Scan state management
    ├── lib/api.ts                # Same-origin API client
    ├── types/scan.ts             # Shared TypeScript interfaces
    ├── next.config.mjs           # /api/* → backend rewrites
    └── Dockerfile
```

## Security and Privacy

- API keys and secrets belong in server-side environment variables (e.g. `SAFE_BROWSING_KEY` in `phishing-detector/backend/.env`). No secrets are bundled in the frontend; the backend URL is only known server-side.
- External services (WHOIS registries, Safe Browsing) may return incomplete or unavailable information; the UI reports such checks as skipped or warning instead of guessing.
- A **safe** verdict is not an absolute guarantee of safety — it only means no risk indicators were found by the available checks. SecureLens is an assessment aid, not a substitute for caution.
- Scan history is stored only in your browser's local storage.

## Development

```bash
npm run dev          # Start backend + frontend (development mode)
npm run build        # Production build of the frontend
npm start            # Production mode: backend + next start on :3001

# Backend
pip install -r phishing-detector/backend/requirements.txt
python phishing-detector/backend/smoke_test.py   # run while the app is live

# Frontend type check
cd safelink-frontend && npx tsc --noEmit
```

## Docker

`docker-compose.yml` deploys both services: the backend on internal port 8000 and the frontend published at `http://localhost:3001` (mapped to the container's 3000), with frontend `/api/*` requests proxied to the backend over the internal network.

```bash
docker-compose up -d
```

The compose file pulls prebuilt images (`himanadh08/securelens-backend`, `himanadh08/securelens-frontend`); the included Dockerfiles build the same images from source.

## CI/CD

- **GitHub Actions** (`.github/workflows/ci.yml`): on push to `master`, runs the backend smoke test, then builds and publishes the two Docker images (requires `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` repository secrets).
- **Jenkins** (`Jenkinsfile`): pulls the published images, restarts the Docker Compose stack, and health-checks `http://localhost:3001` and `http://localhost:8000`.

## License / Attribution

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for the complete license text.

Copyright (c) 2026 Himanadh08.

This repository is a customized version of an earlier PhishGuard codebase that was published without a license file; rights in that earlier code remain with their respective owners, and Himanadh08 claims ownership only of the customizations made in this repository. Third-party dependencies bundled or referenced by this project remain under their own respective licenses.

## Author / Maintainer

**Himanadh08**
GitHub: https://github.com/Himanadh08
