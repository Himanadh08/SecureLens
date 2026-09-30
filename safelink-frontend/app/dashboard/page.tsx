"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Clock, AlertTriangle, XCircle, Check } from "lucide-react";
import { ScanResult } from "@/types/scan";

function getVerdictStyles(verdict: string) {
  if (verdict === "safe") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (verdict === "suspicious") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-red-400 bg-red-500/10 border-red-500/20";
}

function VerdictIcon({ verdict }: { verdict: string }) {
  if (verdict === "safe") return <Check className="w-4 h-4 text-emerald-400" />;
  if (verdict === "suspicious") return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  return <XCircle className="w-4 h-4 text-red-400" />;
}

export default function DashboardPage() {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("safelink_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!mounted) return null;

  return (
    <main className="dot-grid relative min-h-screen flex flex-col">
      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full mb-8">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 group-hover:bg-purple-600/30 transition-colors">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">SecureLens Dashboard</span>
          </Link>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scanner
        </Link>
      </nav>

      {/* ── Content ── */}
      <section className="relative z-10 flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <h1 className="text-xl font-bold text-white">Recent Scans</h1>
            <p className="text-sm text-slate-400 mt-1">Your last 10 analyzed URLs (stored locally)</p>
          </div>

          <div className="overflow-x-auto">
            {history.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
                <Clock className="w-8 h-8 mb-3 opacity-50" />
                <p>No scan history yet.</p>
                <Link href="/" className="text-purple-400 hover:text-purple-300 mt-2 text-sm">
                  Go scan a URL
                </Link>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase text-slate-500 bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 font-medium">URL</th>
                    <th className="px-6 py-4 font-medium text-center">Score</th>
                    <th className="px-6 py-4 font-medium">Verdict</th>
                    <th className="px-6 py-4 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((scan, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                        {scan.url}
                      </td>
                      <td className="px-6 py-4 text-center font-bold">
                        {Math.round(scan.total_score)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase border ${getVerdictStyles(scan.verdict)}`}>
                          <VerdictIcon verdict={scan.verdict} />
                          {scan.verdict}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 text-xs">
                        {new Date(scan.scanned_at).toLocaleString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
