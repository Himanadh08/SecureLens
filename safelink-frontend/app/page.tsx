"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Github, Shield } from "lucide-react";
import { URLInput } from "@/components/URLInput";
import { ExampleChips } from "@/components/ExampleChips";
import { ResultCard } from "@/components/ResultCard";
import { useScan } from "@/hooks/useScan";

// IP Fetch Component
function IPDisplay() {
  const [ip, setIp] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp("Unknown"));
  }, []);

  if (!ip) return null;

  return (
    <div className="text-xs font-mono text-purple-300/80 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-md hidden sm:flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      IP: {ip}
    </div>
  );
}

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const { result, scanState, error, scan, reset } = useScan();

  const isDone = scanState === "done";
  const isError = scanState === "error";
  const showResult = isDone || isError;

  const handleScan = useCallback(
    (url: string) => {
      setInputValue(url);
      scan(url);
    },
    [scan]
  );

  const handleChipSelect = useCallback(
    (url: string) => {
      setInputValue(url);
      scan(url);
    },
    [scan]
  );

  const handleReset = useCallback(() => {
    reset();
    setInputValue("");
  }, [reset]);

  const handleRetry = useCallback(() => {
    if (inputValue) scan(inputValue);
  }, [inputValue, scan]);

  return (
    <main className="dot-grid relative min-h-screen flex flex-col">
      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-pink-600/8 blur-[120px]" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">SecureLens</span>
          <IPDisplay />
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            How it works
          </Link>
          <a
            href="https://github.com/Himanadh08"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </nav>

      {/* ── Hero + Input ── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-16 pt-8">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="hero"
              className="flex flex-col items-center text-center w-full max-w-2xl"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            >
              {/* Pill badge */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, delay: 0 }}
                className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide"
              >
                <Shield className="w-3.5 h-3.5" />
                Real-Time Phishing URL Detection System
              </motion.div>

              {/* H1 */}
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4"
              >
                Know before you{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  click
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-400 max-w-md mb-10"
              >
                Paste any suspicious link and we&apos;ll tell you if it&apos;s safe in seconds.
              </motion.p>

              {/* Input */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full"
              >
                <URLInput
                  onScan={handleScan}
                  scanState={scanState}
                  value={inputValue}
                  onChange={setInputValue}
                />
                {scanState === "scanning" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex flex-col items-center gap-4"
                  >
                    <p className="text-sm text-purple-300 font-medium flex items-center gap-2">
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                      Analyzing URL...
                    </p>
                    <div className="w-full max-w-sm rounded-xl glass-card p-4 flex flex-col gap-3 opacity-60">
                      <div className="flex items-center justify-between">
                        <div className="w-1/3 h-5 bg-white/10 rounded-md animate-pulse" />
                        <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
                      </div>
                      <div className="w-full h-[1px] bg-white/10" />
                      <div className="flex flex-col gap-2">
                        <div className="w-full h-10 bg-white/5 rounded-md animate-pulse" />
                        <div className="w-full h-10 bg-white/5 rounded-md animate-pulse" style={{ animationDelay: "100ms" }} />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <ExampleChips
                    onSelect={handleChipSelect}
                    disabled={false}
                  />
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              className="w-full max-w-2xl flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Compact re-scan bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <URLInput
                  onScan={handleScan}
                  scanState={scanState}
                  value={inputValue}
                  onChange={setInputValue}
                />
              </div>

              <ResultCard
                result={result ?? undefined}
                error={error}
                onReset={handleReset}
                onRetry={handleRetry}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center py-6 text-xs text-slate-600">
        SecureLens &mdash; URL Security & Threat Assessment
      </footer>
    </main>
  );
}
