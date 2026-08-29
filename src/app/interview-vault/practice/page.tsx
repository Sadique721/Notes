"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowLeft, RefreshCw, Send, CheckCircle, AlertTriangle, Sparkles, Award, Info } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { NavBar } from "@/components/layout/NavBar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SearchEntry } from "@/types/content";
import { evaluateAnswer, EvaluationReport } from "@/utils/interviewEvaluator";
import { useProgressStore } from "@/components/providers/ProgressProvider";

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qaNumStr = searchParams.get("qaNumber");
  const qaNum = qaNumStr ? parseInt(qaNumStr, 10) : null;

  const { reviewQA, reviewedQANumbers } = useProgressStore();

  const [qas, setQas] = useState<SearchEntry[]>([]);
  const [selectedQA, setSelectedQA] = useState<SearchEntry | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load index & set active QA
  useEffect(() => {
    async function loadIndex() {
      try {
        const res = await fetch("/content-index.json");
        const index = await res.json();
        const allQAs = index.searchIndex.filter((s: SearchEntry) => s.type === "interviewQA");
        setQas(allQAs);
      } catch (err) {
        console.error("Failed to load content index for practice", err);
      }
    }
    loadIndex();
  }, []);

  useEffect(() => {
    if (qaNum && qas.length > 0) {
      const match = qas.find(q => q.qaNumber === qaNum);
      if (match) {
        setSelectedQA(match);
      }
    }
  }, [qaNum, qas]);

  const handleEvaluate = () => {
    if (!userAnswer.trim() || !selectedQA) return;

    setIsSubmitting(true);
    setTimeout(async () => {
      const evaluation = evaluateAnswer(
        userAnswer,
        selectedQA.qaAnswer || "",
        selectedQA.topicSlug || ""
      );
      setReport(evaluation);
      setIsSubmitting(false);

      // Save progress and award XP dynamically if candidate did well
      if (evaluation.grade !== "Review Needed" && selectedQA.qaNumber) {
        await reviewQA(selectedQA.qaNumber);
      }
    }, 1200);
  };

  const handleReset = () => {
    setUserAnswer("");
    setReport(null);
  };

  if (!qaNum) {
    return (
      <main className="min-h-screen bg-surface-base text-white flex flex-col items-center justify-center p-6">
        <NavBar />
        <GlassPanel className="p-8 text-center max-w-md space-y-4">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto" />
          <h2 className="text-lg font-display font-bold">Invalid Practice Request</h2>
          <p className="text-xs text-white/50">Please select an interview question from the vault to practice.</p>
          <Link href="/interview-vault" className="block">
            <button className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs cursor-pointer">
              Go to Interview Vault
            </button>
          </Link>
        </GlassPanel>
      </main>
    );
  }

  if (!selectedQA) {
    return (
      <main className="min-h-screen bg-surface-base text-white flex flex-col items-center justify-center">
        <NavBar />
        <div className="text-white/30 text-sm animate-pulse font-mono">Resolving QA credentials...</div>
      </main>
    );
  }

  const isReviewed = reviewedQANumbers.includes(selectedQA.qaNumber || 0);

  return (
    <main className="min-h-screen bg-surface-base text-white relative overflow-hidden px-6 pb-28 flex flex-col items-center" style={{ paddingTop: "9.5rem" }}>
      <div className="absolute inset-0 bg-aurora-3 opacity-5 pointer-events-none z-0" />
      <FloatingParticles />
      <NavBar />

      <div className="w-full max-w-4xl space-y-6 z-10">
        {/* Header Controls */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <Link href="/interview-vault" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vault
          </Link>
          <div className="text-right">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">Practice Workspace</span>
          </div>
        </div>

        {/* Question Panel */}
        <GlassPanel className="p-6 border-white/5 bg-black/20 space-y-3 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="font-mono text-[9px] text-white/45">
                QUESTION {selectedQA.qaNumber} · {selectedQA.moduleTitle}
              </span>
              <h2 className="text-sm md:text-base font-display font-bold text-white mt-1 leading-snug">
                {selectedQA.qaQuestion}
              </h2>
            </div>
            {isReviewed && (
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap self-start">
                ✓ Solved
              </span>
            )}
          </div>
        </GlassPanel>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* User Input Editor */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/45">Write your technical answer below:</span>
              <span className="text-white/30 font-mono">{userAnswer.length} chars</span>
            </div>

            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isSubmitting || !!report}
              placeholder="Start drafting your explanation here. Pro Tip: Incorporate structural keywords to demonstrate technical depth."
              className="w-full h-72 p-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-sans leading-relaxed resize-none disabled:opacity-75"
            />

            <div className="flex items-center gap-3">
              {!report ? (
                <button
                  onClick={handleEvaluate}
                  disabled={isSubmitting || !userAnswer.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-display font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Response
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/2 hover:bg-white/5 text-white font-display font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Another Attempt
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Results Checklists & Feedback */}
          <div className="md:col-span-5">
            <AnimatePresence mode="wait">
              {report ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4"
                >
                  {/* Score & Badge Panel */}
                  <GlassPanel
                    className={`p-5 text-center border-white/5 relative overflow-hidden ${
                      report.grade === "Mastered"
                        ? "bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/20"
                        : report.grade === "Proficient"
                        ? "bg-gradient-to-b from-cyan-500/10 to-transparent border-cyan-500/20"
                        : "bg-gradient-to-b from-red-500/5 to-transparent border-red-500/15"
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      <div
                        className={`p-3 rounded-full border ${
                          report.grade === "Mastered"
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                            : report.grade === "Proficient"
                            ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400"
                            : "bg-red-500/10 border-red-500/25 text-red-400"
                        }`}
                      >
                        {report.grade === "Mastered" ? (
                          <Sparkles className="w-6 h-6 animate-pulse" />
                        ) : report.grade === "Proficient" ? (
                          <Award className="w-6 h-6" />
                        ) : (
                          <AlertTriangle className="w-6 h-6" />
                        )}
                      </div>
                    </div>

                    <div className="font-display font-bold text-3xl text-white">{report.score}%</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-white/45 mt-1">Accuracy Score</div>
                    <div
                      className={`text-xs font-semibold mt-2 ${
                        report.grade === "Mastered"
                          ? "text-emerald-400"
                          : report.grade === "Proficient"
                          ? "text-cyan-400"
                          : "text-red-400"
                      }`}
                    >
                      Interview Grade: {report.grade}
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400/80 mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded px-2.5 py-1 inline-block">
                      + {report.xpEarned} XP Earned
                    </div>
                  </GlassPanel>

                  {/* Terms checklists */}
                  <GlassPanel className="p-5 border-white/5 bg-black/20 space-y-4">
                    <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white/40">Concept Checklist</h3>

                    {/* Critical checklist */}
                    {report.criticalMatched.length > 0 || report.criticalMissing.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-[10px] font-mono text-white/50">Must-Have Concepts:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {report.criticalMatched.map((t) => (
                            <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle className="w-2.5 h-2.5" /> {t}
                            </span>
                          ))}
                          {report.criticalMissing.map((t) => (
                            <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-1.5">
                              ✕ {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Other terms checklist */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-white/50">Optional Concepts:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {report.matchedTerms.filter(t => !report.criticalMatched.includes(t)).map((t) => (
                          <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
                            {t}
                          </span>
                        ))}
                        {report.missingTerms.filter(t => !report.criticalMissing.includes(t)).map((t) => (
                          <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/2 border border-white/5 text-white/25">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              ) : (
                <motion.div
                  key="instructions"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <GlassPanel className="p-6 border-white/5 bg-black/20 space-y-4">
                    <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-emerald-400" /> Practice Rules
                    </h3>
                    <ul className="text-xs text-white/60 space-y-2.5 leading-relaxed list-none pl-1">
                      <li className="flex gap-2">
                        <span className="text-emerald-400">▹</span>
                        <span>Answer directly in details, omitting greetings or simple yes/no.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-400">▹</span>
                        <span>Ensure you explain low-level JVM memory details, cache operations, or patterns when applicable.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-400">▹</span>
                        <span>Deterministic evaluation assesses core keyword matches and structural terminology.</span>
                      </li>
                    </ul>
                  </GlassPanel>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Answer comparison panels (shown after review is complete) */}
        {report && (
          <GlassPanel className="p-6 border-white/5 bg-black/20 space-y-4 animate-fade-in">
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Answer Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              <div className="space-y-2">
                <div className="font-mono text-[10px] text-white/40 uppercase">Your explanation:</div>
                <p className="text-white/80 whitespace-pre-wrap font-sans">{userAnswer}</p>
              </div>
              <div className="space-y-2">
                <div className="font-mono text-[10px] text-emerald-400 uppercase">Standard reference explanation:</div>
                <p className="text-emerald-300/90 whitespace-pre-wrap font-sans">{selectedQA.qaAnswer}</p>
              </div>
            </div>
          </GlassPanel>
        )}
      </div>
    </main>
  );
}

export default function PracticePage() {
  return (
    <React.Suspense fallback={<div className="text-white/40 text-xs text-center py-20">Initializing Practice Control...</div>}>
      <PracticeContent />
    </React.Suspense>
  );
}
