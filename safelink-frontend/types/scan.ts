export interface CheckResult {
  name: string;
  score: number;
  status: "safe" | "warning" | "danger";
  reason: string;
}

/** Facts about the scanned site, derived only from the URL and WHOIS data
 *  the backend already fetched. Any missing value is the string "Not available". */
export interface WebsiteInfo {
  url: string;
  scheme: string;
  domain: string;
  hostname: string;
  domain_info: string;
  page_title: string;
  description: string;
  technologies: string;
  registration: string;
  server: string;
}

export interface ScanResult {
  url: string;
  total_score: number;
  max_score: number;
  verdict: "safe" | "suspicious" | "dangerous";
  highest_status: string;
  checks: CheckResult[];
  /** Bullet list of actual triggered findings ("WHY THIS URL IS SUSPICIOUS"). */
  explanations: string[];
  /** Fixed, verdict-appropriate recommendation sentence. */
  recommendation: string;
  website_info: WebsiteInfo;
  scanned_at: string;
}

export type ScanState = "idle" | "scanning" | "done" | "error";

export interface ScanError {
  type: "network" | "timeout" | "invalid_url" | "unknown";
  message: string;
}
