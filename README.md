# 🛡️ PhishGuard | URL Safety Scanner

**PhishGuard** is an intelligence-based web application that helps users identify potential phishing threats in real time. It analyses URLs across five security dimensions — domain age (WHOIS), suspicious keywords, Google Safe Browsing, lookalike-domain detection and SSL/HTTPS validation — and returns a clear risk score and verdict.

> Based on the original PhishGuard project by Rohit Kumar Ranjan, with UI, security explanation, assessment, website information, and integration improvements extended for this version.

## 🚀 Key Features

- **Five Security Checks**: Domain age (WHOIS), suspicious keyword scanning, Google Safe Browsing, lookalike/typosquat detection, and SSL/HTTPS validation run concurrently on every scan.
- **Clear Verdicts**: A weighted risk score (0–150) maps to Safe / Suspicious / Dangerous, with a per-check breakdown.
- **Why Is This Suspicious?**: When checks trigger, the UI lists the actual findings behind the verdict — no invented reasons.
- **Security Assessment**: A final recommendation matched to the verdict, so users know what to do next.
- **Website Information**: The site facts the scan actually collected — scheme, registered domain, hostname, and registration notes — never fabricated data.
- **Single Website Experience**: The Next.js frontend proxies API calls to the FastAPI backend, so users only ever open `http://localhost:3001`.
- **Modern Dashboard**: Next.js-powered frontend with a dark glassmorphism UI, scan history, and risk breakdowns.
- **Optional Dockerized Deployment**: Docker Compose configuration included for container-based runs.

## 🏗️ Technology Stack

### Backend
- **Framework**: Python FastAPI (high-performance API)
- **Security checks**: `python-whois` (domain age), Google Safe Browsing API (optional key), heuristic keyword & lookalike detection, live SSL certificate validation

### Frontend
- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS with a custom dark glassmorphism theme
- **Icons & Typography**: Lucide React, Inter (Google Fonts)

### Deployment & DevOps
- **One-command local dev**: Root npm scripts (`concurrently` + `wait-on`) start the FastAPI backend and Next.js frontend together
- **Containerization**: Docker & Docker Compose (optional)
- **CI/CD**: GitHub Actions workflow and Jenkinsfile included

## 🛠️ Getting Started (local development)

One command starts **both** the frontend and the backend — no second terminal required:

```bash
# from the project root
npm install
npm run dev
```

Then open **[http://localhost:3001](http://localhost:3001)** — that's the whole app.

What happens under the hood when you run `npm run dev`:

1. The FastAPI backend starts automatically on `http://127.0.0.1:8000` (internal only).
2. `wait-on` waits until the backend's `/health` endpoint responds (no race conditions).
3. The Next.js frontend starts on `http://localhost:3001`.
4. All browser API calls go to same-origin `/api/*` paths, which Next.js proxies to the backend (`BACKEND_ORIGIN`, default `http://127.0.0.1:8000`). The browser never talks to port 8000 directly, so there are no CORS issues and the backend URL stays server-side.

> Prerequisites: Node.js 18+ and Python 3.10+ with `pip install -r phishing-detector/backend/requirements.txt`.

### Backend API docs (optional, for debugging)

While `npm run dev` is running, FastAPI's auto-generated docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

### Docker (optional alternative)

1. **Ensure Docker and Docker Compose are installed and running.**
2. **Set up environment variables:** Add a `.env` file in `./phishing-detector/backend/.env` with required API keys if necessary.
3. **Run Docker Compose from the project root:**
   ```bash
   docker-compose up -d
   ```
4. **Access the Application:**
   - Frontend UI (the app users interact with): Visit [http://localhost:3001](http://localhost:3001)
   - Backend API Docs (for development/debugging): Visit [http://localhost:8000/docs](http://localhost:8000/docs)

### Optional environment variables

| Variable | Where | Purpose |
|---|---|---|
| `SAFE_BROWSING_KEY` | `phishing-detector/backend/.env` | Enables the Google Safe Browsing check (the scan still works without it — the check reports as skipped) |
| `BACKEND_ORIGIN` | `safelink-frontend` environment | Backend URL used by the Next.js proxy (default `http://127.0.0.1:8000`) |
| `NEXT_PUBLIC_API_URL` | `safelink-frontend` environment | Optional: bypass the proxy and call the backend directly (not recommended) |

## 📁 Project Structure

- `/phishing-detector/backend`: Python FastAPI server and scanning pipeline (5 security checks + scoring + explanation builder).
- `/safelink-frontend`: Next.js user interface (scanner, dashboard, how-it-works).
- Root `package.json`: one-command dev setup — starts the FastAPI backend, waits for it to be healthy, then starts the Next.js frontend on port 3001.
- `docker-compose.yml`: Orchestrates both frontend and backend services (optional alternative to `npm run dev`).

## 🙏 Credits

Based on the original **PhishGuard** project by [Rohit Kumar Ranjan](https://github.com/rohit124551). This customized version — the redesigned UI, the "Why Suspicious" explanations, Security Assessment, Website Information, and the one-command single-port development setup — is maintained by [Himanadh08](https://github.com/Himanadh08), who does not claim ownership of the original project.

---

© 2025 Rohit Kumar Ranjan (original PhishGuard). Extensions and modifications © 2026 [Himanadh08](https://github.com/Himanadh08).
