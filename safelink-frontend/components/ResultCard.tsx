"use client";

import { motion } from "framer-motion";
import { ScanResult, ScanError } from "@/types/scan";
import { VerdictBadge } from "./VerdictBadge";
import { ScoreRing } from "./ScoreRing";
import { CheckRow } from "./CheckRow";
import { WhySuspicious } from "./WhySuspicious";
import { SecurityAssessment } from "./SecurityAssessment";
import { WebsiteInfo } from "./WebsiteInfo";
import { WifiOff, RefreshCw, RotateCcw } from "lucide-react";

interface ResultCardProps {
  result?: ScanResult;
  error?: ScanError | null;
  onReset: () => void;
  onRetry?: () => void;
}

export function ResultCard({ result, error, onReset, onRetry }: ResultCardProps) {
  /* ── Error State ── */
  if (error) {
    const isOffline = error.type === "network";
    const isTimeout = error.type === "timeout";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="glass-card w-full max-w-2xl mx-auto p-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
            <WifiOff className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          {isOffline ? "Scanner Offline" : isTimeout ? "Request Timed Out" : "Something went wrong"}
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">{error.message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {(isOffline || isTimeout) && onRetry && (
            <button
              onClick={onRetry}
              className="btn-gradient flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          )}
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> New Scan
          </button>
        </div>
      </motion.div>
    );
  }

  if (!result) return null;

  const explanations = result.explanations ?? [];
  const date = new Date(result.scanned_at);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="glass-card w-full max-w-2xl mx-auto overflow-hidden"
    >
      {/* ── Top: Verdict + Score ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 pb-5">
        <div className="flex flex-col items-center sm:items-start gap-3">
          <VerdictBadge verdict={result.verdict} />
          <p className="text-xs text-slate-500 max-w-xs text-center sm:text-left break-all">
            {result.url}
          </p>
        </div>
        <ScoreRing score={result.total_score} />
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-white/[0.06] mx-6" />

      {/* ── Check Details ── */}
      <div className="p-6 pt-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
          Scan Details
        </h2>
        <div className="flex flex-col gap-2">
          {result.checks.map((check, i) => (
            <CheckRow key={check.name} check={check} index={i} />
          ))}
        </div>
      </div>

      {result.verdict === "dangerous" && (
        <div className="px-6 py-4 bg-red-500/5 border-t border-red-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-red-400">Do not visit this site</p>
          <button className="px-4 py-2 rounded-lg text-xs font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors">
            Report this URL
          </button>
        </div>
      )}
      {/* ── Footer ── */}
      <div className="border-t border-white/[0.06] mx-6" />
      <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-600">
          Scanned {dateStr} at {timeStr}
        </p>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Scan another URL
        </button>
      </div>
    </motion.div>

    {/* ── Sections below the main result card ──
        Order: WHY SUSPICIOUS → SECURITY ASSESSMENT → WEBSITE INFO. ── */}
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <WhySuspicious explanations={explanations} />
      <SecurityAssessment
        verdict={result.verdict}
        explanations={explanations}
        recommendation={result.recommendation}
      />
      {result.website_info && <WebsiteInfo info={result.website_info} />}
    </div>
    </>
  );
}
