"use client";

import { motion } from "framer-motion";
import { Globe, Info } from "lucide-react";
import { WebsiteInfo as WebsiteInfoType } from "@/types/scan";

interface WebsiteInfoProps {
  info: WebsiteInfoType;
}

const NOT_AVAILABLE = "Not available";

/** Only render rows whose value actually exists — no invented data. */
function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value || value === NOT_AVAILABLE) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4 py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-xs font-medium text-slate-500 sm:w-36 shrink-0">
        {label}
      </span>
      <span className="text-xs text-slate-300 break-words min-w-0">{value}</span>
    </div>
  );
}

/**
 * "WEBSITE INFORMATION" — small facts grid below the security assessment.
 * Shows only values the backend actually derived from the URL / WHOIS data
 * it already collected; anything missing simply doesn't appear. If nothing
 * is available at all, a single "Not available" line is shown instead.
 */
export function WebsiteInfo({ info }: WebsiteInfoProps) {
  const rows: { label: string; value: string }[] = [
    { label: "URL", value: info.url },
    { label: "Scheme", value: info.scheme },
    { label: "Domain", value: info.domain },
    { label: "Hostname", value: info.hostname },
    { label: "Domain info", value: info.domain_info },
    { label: "Page title", value: info.page_title },
    { label: "Description", value: info.description },
    { label: "Technologies", value: info.technologies },
    { label: "Registration", value: info.registration },
    { label: "Server", value: info.server },
  ];

  const visibleRows = rows.filter(
    (r) => r.value && r.value !== NOT_AVAILABLE
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.35 }}
      className="glass-card w-full p-6"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30">
          <Globe className="w-4 h-4 text-purple-400" />
        </div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Website information
        </h2>
      </div>

      {visibleRows.length === 0 ? (
        <p className="text-sm text-slate-500 flex items-center gap-2">
          <Info className="w-3.5 h-3.5" />
          Not available
        </p>
      ) : (
        <div className="flex flex-col">
          {visibleRows.map((row) => (
            <InfoRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}
    </motion.section>
  );
}
