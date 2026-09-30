"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Brain, Activity, Lock, ArrowLeft } from "lucide-react";

export default function HowItWorks() {
  return (
    <main className="dot-grid relative min-h-screen flex flex-col">
      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-pink-600/8 blur-[120px]" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full mb-4">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 group-hover:bg-purple-600/30 transition-colors">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">SecureLens</span>
          </Link>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Scanner
        </Link>
      </nav>

      <section className="relative z-10 flex-1 flex flex-col items-center px-4 pb-16">
        <motion.div
          className="flex flex-col items-center text-center w-full max-w-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide"
          >
            <Activity className="w-3.5 h-3.5" />
            Multi-Factor Analysis Engine
          </motion.div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
            How{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              SecureLens
            </span>{" "}
            works
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-12">
            Our real-time detection system analyzes URLs across multiple threat vectors to determine if a link is safe or a phishing attempt.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 border border-purple-500/30">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Heuristic Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Analyzes URL structure, suspicious keywords, excessive subdomains, and obfuscation techniques commonly used by attackers.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4 border border-pink-500/30">
                <Lock className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Threat Intelligence</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Cross-references links against the Google Safe Browsing API and continuously updated databases of known malicious domains.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-500/30">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Risk Scoring</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Aggregates signals to calculate a comprehensive threat score, instantly providing a clear, actionable verdict on link safety.
              </p>
            </motion.div>
          </div>

          {/* Scoring Explanation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-full mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 text-left"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Understanding the Risk Score</h3>
            <p className="text-slate-400 mb-6">
              Our system generates a Risk Score from 0 to 100 for every URL scanned. A lower score indicates a safer link, while a higher score means the link is highly dangerous.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                <div className="text-emerald-400 font-bold text-xl mb-1">0 - 29</div>
                <h4 className="text-white font-semibold mb-2">Safe</h4>
                <p className="text-xs text-emerald-200/70">No significant threats or suspicious patterns detected. The URL is generally safe to visit.</p>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
                <div className="text-amber-400 font-bold text-xl mb-1">30 - 59</div>
                <h4 className="text-white font-semibold mb-2">Suspicious</h4>
                <p className="text-xs text-amber-200/70">Some warning signs were found. Proceed with caution and verify the source.</p>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
                <div className="text-red-400 font-bold text-xl mb-1">60 - 100</div>
                <h4 className="text-white font-semibold mb-2">Dangerous</h4>
                <p className="text-xs text-red-200/70">High probability of phishing or malware. Do not click or enter personal information.</p>
              </div>
            </div>
          </motion.div>

          {/* API Backend Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 text-left"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Powerful FastAPI Backend</h3>
            <p className="text-slate-400 mb-6">
              Our real-time analysis is powered by a high-performance Python FastAPI backend. When you submit a URL, the backend concurrently executes 5 advanced security checks via our <code className="text-pink-400 bg-pink-400/10 px-1 py-0.5 rounded">/analyze</code> endpoint.
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 mb-4">
              <li><strong>Domain Age:</strong> Checks if the domain was recently registered (a common trait of phishing sites).</li>
              <li><strong>Suspicious Keywords:</strong> Scans the URL for words typically used to trick users (e.g., &quot;login&quot;, &quot;secure&quot;, &quot;verify&quot;).</li>
              <li><strong>Google Safe Browsing:</strong> Cross-references the domain against Google&apos;s constantly updated threat database.</li>
              <li><strong>Lookalike Domains:</strong> Detects typosquatting where attackers mimic legitimate domains (e.g., &quot;g00gle.com&quot;).</li>
              <li><strong>SSL/HTTPS Check:</strong> Verifies the presence and validity of security certificates.</li>
            </ul>
            <p className="text-sm text-slate-400 italic">
              All checks run asynchronously with a strict 12-second timeout to guarantee you get your verdict instantly without sacrificing thoroughness.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center py-6 text-xs text-slate-600 mt-auto">
        SecureLens &mdash; URL Security & Threat Assessment
      </footer>
    </main>
  );
}
