import { ScanResult, ScanError } from "@/types/scan";

/**
 * API client.
 *
 * By default all requests go through the Next.js same-origin proxy
 * (/api/* → FastAPI backend, see next.config.mjs), so the browser
 * never needs to know the backend URL. Set NEXT_PUBLIC_API_URL only
 * if you must bypass the proxy and call the backend directly.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
const TIMEOUT_MS = 20_000;

export async function analyzeURL(url: string): Promise<ScanResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal,
      // same-origin request — cookies/credentials not needed
      credentials: "omit",
    });

    if (!response.ok) {
      let message = `Server returned ${response.status}`;
      try {
        const body = await response.json();
        // FastAPI validation errors return {detail: [{msg, ...}]}
        if (Array.isArray(body?.detail) && body.detail.length > 0) {
          message = body.detail[0].msg || message;
        } else if (typeof body?.detail === "string") {
          message = body.detail;
        }
      } catch {
        // non-JSON error body — keep the generic message
      }
      const err: ScanError = {
        type: response.status === 504 ? "timeout" : "unknown",
        message,
      };
      throw err;
    }

    const data: ScanResult = await response.json();
    data.scanned_at = new Date().toISOString();
    return data;
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      const err: ScanError = {
        type: "timeout",
        message: "Request timed out. The target site may be slow — please try again.",
      };
      throw err;
    }
    if (e instanceof TypeError && e.message.includes("fetch")) {
      const err: ScanError = {
        type: "network",
        message: "Cannot reach the scanner service. Please make sure the app is fully started and try again.",
      };
      throw err;
    }
    // Re-throw typed errors
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
