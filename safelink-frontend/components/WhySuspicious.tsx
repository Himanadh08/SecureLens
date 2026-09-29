"use client";

import { motion } from "framer-motion";
import { HelpCircle, AlertTriangle } from "lucide-react";

interface WhySuspiciousProps {
  explanations: string[];
}

/**
 * "WHY THIS URL IS SUSPICIOUS" — rendered only when the backend
 * reported at least one real finding. Every bullet is backed by an
 * actual check result; nothing is invented client-side.
 */
export function WhySuspicious({ explanations }: WhySuspiciousProps) {
  if (!explanations || explanations.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="glass-card w-full p-6 border-amber-500/20"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
          <HelpCircle className="w-4 h-4 text-amber-400" />
        </div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-300">
          Why this URL is suspicious
        </h2>
      </div>

      <ul className="flex flex-col gap-2.5">
        {explanations.map((explanation, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.07, duration: 0.3 }}
            className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
            <span className="min-w-0 break-words">{explanation}</span>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
