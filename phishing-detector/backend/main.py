"""
SecureLens — URL Security & Threat Assessment API
FastAPI backend that runs 5 independent security checks on a URL
and returns a risk score and verdict.
"""

import asyncio
import logging
import os
import re
from contextlib import asynccontextmanager
from typing import Any, Dict, List

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from tldextract import extract as tld_extract
from urllib.parse import urlparse

from checks import domain_age, keywords, lookalike, safe_browsing, ssl_check
from explanations import build_explanations, recommendation as build_recommendation
from scorer import score

# ─────────────────────────────────────────────
# Bootstrap
# ─────────────────────────────────────────────
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger("securelens")

# ─────────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SecureLens API starting up…")
    yield
    logger.info("SecureLens API shutting down.")


app = FastAPI(
    title="SecureLens — URL Security & Threat Assessment",
    description=(
        "Analyses a URL across five security dimensions "
        "(domain age, keywords, Safe Browsing, lookalike domain, SSL) "
        "and returns a risk verdict."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ─────────────────────────────────────────────
# CORS — allow any localhost origin (dev)
# ─────────────────────────────────────────────
CORS_ORIGINS = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Request / Response models
# ─────────────────────────────────────────────
_URL_RE = re.compile(r"^https?://", re.IGNORECASE)


class AnalyzeRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("URL must not be empty.")
        if not _URL_RE.match(v):
            raise ValueError("URL must start with http:// or https://")
        if len(v) > 2048:
            raise ValueError("URL exceeds maximum allowed length of 2048 characters.")
        return v


class CheckResult(BaseModel):
    name: str
    score: int
    status: str   # "safe" | "warning" | "danger"
    reason: str


class WebsiteInfo(BaseModel):
    """Facts derived only from the submitted URL string itself.
    Everything else stays "Not available" — we never invent data."""

    url: str
    scheme: str
    domain: str
    hostname: str
    domain_info: str
    page_title: str = "Not available"
    description: str = "Not available"
    technologies: str = "Not available"
    registration: str = "Not available"
    server: str = "Not available"


class AnalyzeResponse(BaseModel):
    url: str
    total_score: int
    max_score: int
    verdict: str          # "safe" | "suspicious" | "dangerous"
    highest_status: str
    checks: List[CheckResult]
    explanations: List[str]
    recommendation: str
    website_info: WebsiteInfo


# ─────────────────────────────────────────────
# Helper — run a single check safely
# ─────────────────────────────────────────────
SINGLE_CHECK_TIMEOUT = 8  # seconds per individual check


async def _run_check(name: str, fn, url: str) -> Dict[str, Any]:
    """
    Execute a synchronous check function inside a thread pool with a timeout.
    Any exception is caught and turned into a warning result so the rest of
    the checks are unaffected.
    """
    loop = asyncio.get_running_loop()
    try:
        result = await asyncio.wait_for(
            loop.run_in_executor(None, fn, url),
            timeout=SINGLE_CHECK_TIMEOUT,
        )
        logger.info("✓ %s → score=%d status=%s", name, result["score"], result["status"])
        return result
    except asyncio.TimeoutError:
        logger.warning("✗ %s timed out after %ds", name, SINGLE_CHECK_TIMEOUT)
        return {
            "name": name,
            "score": 0,
            "status": "warning",
            "reason": f"{name} check timed out and was skipped.",
        }
    except Exception as exc:
        logger.error("✗ %s raised an exception: %s", name, exc)
        return {
            "name": name,
            "score": 0,
            "status": "warning",
            "reason": f"{name} check failed unexpectedly: {str(exc)[:120]}",
        }


# ─────────────────────────────────────────────
# Website info — derived ONLY from the URL string and the
# WHOIS data the Domain Age check already fetched. No new
# network requests, no invented facts.
# ─────────────────────────────────────────────
def _build_website_info(url: str, check_results: List[Dict[str, Any]]) -> WebsiteInfo:
    scheme = ""
    hostname = ""
    registered_domain = ""

    try:
        parsed = urlparse(url)
        scheme = parsed.scheme.lower()
        hostname = parsed.netloc.rsplit("@", 1)[-1]
        # strip credentials, then port
        if ":" in hostname:
            host_only, _, port = hostname.rpartition(":")
            if port.isdigit():
                hostname = host_only
        hostname = hostname.strip("[]")
    except Exception:
        pass

    try:
        extracted = tld_extract(url)
        if extracted.domain and extracted.suffix:
            registered_domain = f"{extracted.domain}.{extracted.suffix}"
    except Exception:
        pass

    # WHOIS facts surfaced by the Domain Age check (no duplicate lookup):
    # if it scored 0/safe we only know it's not young — don't guess the age.
    registration = "Not available"
    for r in check_results:
        if r.get("name") == "Domain Age" and r.get("status") == "danger" and r.get("score", 0) >= 25:
            registration = "WHOIS indicates a very recently registered domain (see Domain Age check for details)."
            break

    return WebsiteInfo(
        url=url,
        scheme=scheme or "Not available",
        domain=registered_domain or "Not available",
        hostname=hostname or "Not available",
        domain_info=registration,
        registration=registration,
    )


# ─────────────────────────────────────────────
# Endpoint
# ─────────────────────────────────────────────
CHECKS = [
    ("Domain Age",             domain_age.check),
    ("Suspicious Keywords",    keywords.check),
    ("Google Safe Browsing",   safe_browsing.check),
    ("Lookalike Domain",       lookalike.check),
    ("SSL / HTTPS",            ssl_check.check),
]

TOTAL_TIMEOUT = 12  # overall hard deadline (seconds)


@app.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyse a URL for phishing indicators",
    response_description="Risk score, verdict, and per-check details.",
)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Run all five security checks against the supplied URL concurrently
    and return a composite risk assessment.

    - **url**: The fully-qualified URL to analyse (must start with http:// or https://).
    """
    if not _URL_RE.match(request.url):
        raise HTTPException(
            status_code=422,
            detail="URL must start with http:// or https://",
        )

    logger.info("Analysing URL: %s", request.url)

    tasks = [
        _run_check(name, fn, request.url)
        for name, fn in CHECKS
    ]

    try:
        results: List[Dict[str, Any]] = await asyncio.wait_for(
            asyncio.gather(*tasks),
            timeout=TOTAL_TIMEOUT,
        )
    except asyncio.TimeoutError:
        logger.error("Overall analysis timed out for URL: %s", request.url)
        raise HTTPException(
            status_code=504,
            detail="Analysis timed out — the target URL may be unreachable.",
        )

    final = score(list(results))

    logger.info(
        "Result for %s → total_score=%d verdict=%s",
        request.url,
        final["total_score"],
        final["verdict"],
    )

    return AnalyzeResponse(
        url=request.url,
        total_score=final["total_score"],
        max_score=final["max_score"],
        verdict=final["verdict"],
        highest_status=final["highest_status"],
        checks=[CheckResult(**c) for c in final["checks"]],
        explanations=build_explanations(final["verdict"], final["checks"]),
        recommendation=build_recommendation(final["verdict"]),
        website_info=_build_website_info(request.url, final["checks"]),
    )


# ─────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────
@app.get("/health", summary="Health check", include_in_schema=False)
async def health():
    return {"status": "ok", "service": "SecureLens"}


# ─────────────────────────────────────────────
# Dev entry-point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info",
    )
