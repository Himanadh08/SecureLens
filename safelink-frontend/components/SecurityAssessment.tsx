"use client";

import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import { ScanResult } from "@/types/scan";

interface SecurityAssessmentProps {
  verdict: ScanResult["verdict"];
  explanations: string[];
  recommendation: string;
}

const toneByVerdict = {
  safe: {
    Icon: ShieldCheck,
    border: "border-emerald-500/20",
    heading: "text-emerald-300",
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
  suspicious: {
    Icon: AlertTriangle,
    border: "border-amber-500/20",
    heading: "text-amber-300",
    iconBg: "bg-amber-500/15 border-amber-500/30",
    iconColor: "text-amber-400",
  },
  dangerous: {
    Icon: XCircle,
    border: "border-red-500/20",
    heading: "text-red-300",
    iconBg: "bg-red-500/15 border-red-500/30",
    iconColor: "text-red-400",
  },
} as const;

/**
 * "SECURITY ASSESSMENT" — final summary below the scan details.
 * Dynamically reflects the actual findings; the safe wording never
 * claims the site is guaranteed safe.
 */
export function SecurityAssessment({
  verdict,
  explanations,
  recommendation,
}: SecurityAssessmentProps) {
  const tone = toneByVerdict[verdict] ?? toneByVerdict.safe;
  const { Icon } = tone;
  const hasFindings = explanations.length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
      className={`glass-card w-full p-6 border ${tone.border}`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`p-1.5 rounded-lg border ${tone.iconBg}`}>
          <Icon className={`w-4 h-4 ${tone.iconColor}`} />
        </div>
        <h2 className={`text-xs font-semibold uppercase tracking-widest ${tone.heading}`}>
          Security assessment
        </h2>
      </div>

      <p className="text-sm text-slate-200 leading-relaxed mb-3">
        {hasFindings ? "This website was flagged because:" : "No significant suspicious indicators were detected by the available scans."}
      </p>

      {hasFindings && (
        <ul className="flex flex-col gap-2 mb-4">
          {explanations.map((explanation, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${tone.iconColor.replace("text-", "bg-")}`} />
              <span className="min-w-0 break-words">{explanation}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-3 border-t border-white/[0.06]">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Recommendation
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">{recommendation}</p>
      </div>
    </motion.section>
  );
}
