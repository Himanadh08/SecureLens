"""
Explanation Builder
Derives human-readable reasons from the ACTUAL results of the five
security checks. Nothing is invented here: every explanation line is
backed by a check that really triggered (score > 0 or an explicit
danger/warning finding). Unavailable integrations (e.g. missing API
keys) are deliberately excluded so we never present "skipped" as a
finding.
"""

import re
from typing import Any, Dict, List

# Statuses that mean "the check could not actually run" — these are
# infrastructure noise, not user-facing findings.
_SKIP_MARKERS = (
    "skipped",
    "timed out",
    "failed",
    "not set",
    "could not verify",
    "could not extract",
    "could not determine",
)


def _is_real_finding(check: Dict[str, Any]) -> bool:
    """
    A finding is real when the check actually produced evidence:
      - score > 0 (the scorer assigned risk points), or
      - an explicit danger/warning reason that is not an availability issue.
    """
    if check.get("score", 0) > 0:
        return True

    status = check.get("status", "safe")
    if status not in ("warning", "danger"):
        return False

    reason = check.get("reason", "").lower()
    return not any(marker in reason for marker in _SKIP_MARKERS)


def _matched_keywords_from_reason(reason: str) -> List[str]:
    """Extract quoted keywords the Keywords check reported, e.g. "login", "verify"."""
    return re.findall(r'"([^"]+)"', reason)


def _tidy(reason: str, limit: int = 180) -> str:
    """Collapse whitespace/line noise (e.g. raw WHOIS output), drop server
    boilerplate (">>>" banners / "NOTICE:" blocks) and cap length."""
    cleaned = " ".join(reason.split())
    for marker in (">>>", "NOTICE:"):
        idx = cleaned.find(marker)
        if idx > 0:
            cleaned = cleaned[:idx].rstrip(" .,-")
    if len(cleaned) > limit:
        cleaned = cleaned[: limit - 1].rstrip() + "…"
    return cleaned


def build_explanations(verdict: str, check_results: List[Dict[str, Any]]) -> List[str]:
    """
    Build the "WHY THIS URL IS SUSPICIOUS" bullet list from real findings.

    Only checks that genuinely triggered appear. For a "safe" verdict the
    list is empty — the UI then shows the neutral assessment instead.
    """
    explanations: List[str] = []

    for check in check_results:
        name = check.get("name", "Unknown check")
        status = check.get("status", "safe")
        reason = check.get("reason", "")

        if not _is_real_finding(check):
            continue

        if name == "Suspicious Keywords":
            # Re-derive the matched keywords from the reason text the
            # check itself produced (format: ...in URL: "kw1", "kw2").
            matched = _matched_keywords_from_reason(reason)
            if matched:
                explanations.append(
                    "Suspicious URL pattern detected: phishing-related keyword(s) "
                    + ", ".join(f'"{kw}"' for kw in matched)
                    + " appear in the URL."
                )
            else:
                explanations.append(f"Suspicious URL pattern detected. {reason}")
            continue

        if name == "Lookalike Domain":
            explanations.append(f"Lookalike domain detected: {reason.rstrip('.')}")
            continue

        if name == "Domain Age":
            if status == "danger":
                # Real evidence (e.g. domain registered days ago).
                explanations.append(
                    f"The domain contains characteristics associated with phishing: "
                    f"{reason[0].lower() + reason[1:] if reason else reason}"
                )
            else:
                # Warning without hard evidence (lookup failed, data missing) —
                # report it readably instead of claiming phishing traits.
                explanations.append(f"Domain Age check: {_tidy(reason)}")
            continue

        if name == "Google Safe Browsing":
            explanations.append(f"Threat intelligence returned a warning: {reason}")
            continue

        if name == "SSL / HTTPS":
            explanations.append(reason)
            continue

        # Any future check: fall back to its own reason, tidied.
        explanations.append(f"{name}: {_tidy(reason)}")

    return explanations


def recommendation(verdict: str) -> str:
    """
    Fixed, honest recommendation text per verdict. The "safe" wording
    explicitly avoids claiming the site is guaranteed safe.
    """
    if verdict == "dangerous":
        return (
            "Avoid entering credentials, payment information, or other sensitive "
            "information on this website. The findings indicate a significant security risk."
        )
    if verdict == "suspicious":
        return (
            "Proceed with caution. Several indicators warrant attention — verify the "
            "site's authenticity before entering credentials, payment information, "
            "or other sensitive information."
        )
    return (
        "No significant threats were detected by the available checks. "
        "This does not guarantee that the website is completely safe."
    )
