"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { MissionDock } from "@/components/ui/MissionDock";
import { NavBar } from "@/components/layout/NavBar";
import { SearchEntry } from "@/types/content";
import { Trophy, ChevronLeft, ChevronRight, Search, Sparkles, BookOpen, Check, Target, Zap, Filter } from "lucide-react";
import { useProgressStore } from "@/components/providers/ProgressProvider";
import Fuse from "fuse.js";

const ITEMS_PER_PAGE = 6;

const MODULE_COLORS: Record<string, string> = {
  "spring-framework-fundamentals": "#10e39b",
  "spring-boot": "#22d3ee",
  "spring-boot-annotations": "#38bdf8",
  "microservices": "#a78bfa",
  "java-collections": "#fbbf24",
  "java-8-17-21": "#e879f9",
  "multithreading-concurrency": "#fb7185",
  "sql-database": "#a3e635",
  "jvm-internals": "#fb923c",
  "core-java": "#60a5fa",
};

function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  if (difficulty === "five-crore") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400">
        <Sparkles className="w-2.5 h-2.5" /> ₹5 CRORE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-400">
      <Target className="w-2.5 h-2.5" /> {difficulty || "medium"}
    </span>
  );
}

function QACard({ qa, idx, isReviewed, onReview }: { qa: SearchEntry; idx: number; isReviewed: boolean; onReview: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const isFC = qa.isFiveCrore;
  const color = MODULE_COLORS[qa.moduleSlug || ""] || "#22d3ee";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, type: "spring", stiffness: 200, damping: 24 }}
      className="relative rounded-2xl overflow-hidden border transition-all duration-300 group cursor-pointer"
      style={{
        background: isFC
          ? "linear-gradient(135deg, rgba(251,191,36,0.04) 0%, rgba(17,10,5,0.95) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(4,8,20,0.95) 100%)",
        borderColor: isFC ? "rgba(251,191,36,0.25)" : `${color}18`,
        boxShadow: isFC ? "0 0 30px rgba(251,191,36,0.06), inset 0 1px 0 rgba(251,191,36,0.08)" : `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Accent left bar */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl" style={{ background: isFC ? "#fbbf24" : color }} />

      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${isFC ? "rgba(251,191,36,0.06)" : `${color}08`} 0%, transparent 70%)` }} />

      <div className="p-5 pl-6">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Q number badge */}
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
              style={{ color, background: `${color}12`, border: `1px solid ${color}25` }}>
              Q{qa.qaNumber}
            </span>
            {/* Module pill */}
            <span className="text-[10px] font-mono text-white/40 bg-white/3 border border-white/8 px-2 py-0.5 rounded-md">
              {qa.moduleTitle?.replace("Spring Framework", "Spring")?.replace("fundamentals", "")}
            </span>
            <DifficultyBadge difficulty={qa.difficulty} />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <Link href={`/interview-vault/practice?qaNumber=${qa.qaNumber}`}>
              <button className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider border px-2.5 py-1 rounded-lg transition-all hover:scale-105 cursor-pointer"
                style={{ color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.08)" }}>
                <Zap className="w-2.5 h-2.5" /> Practice
              </button>
            </Link>
            <button
              onClick={onReview}
              className={`flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider border px-2.5 py-1 rounded-lg transition-all hover:scale-105 cursor-pointer ${
                isReviewed
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : "bg-white/3 text-white/45 border-white/8 hover:text-white hover:border-white/20"
              }`}
            >
              {isReviewed ? <><Check className="w-2.5 h-2.5" /> Done</> : "Mark read"}
            </button>
          </div>
        </div>

        {/* Question */}
        <h4 className="font-display font-semibold text-sm text-white leading-snug mb-2 group-hover:text-white transition-colors">
          {qa.qaQuestion}
        </h4>

        {/* Answer — toggleable */}
        <AnimatePresence>
          {expanded ? (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t mt-3 pt-3 pb-1" style={{ borderColor: `${color}15` }}>
                <p className="text-xs text-white/65 leading-relaxed font-sans">{qa.qaAnswer}</p>
              </div>
            </motion.div>
          ) : (
            <p className="text-xs text-white/40 leading-relaxed font-sans line-clamp-2">
              {qa.qaAnswer}
            </p>
          )}
        </AnimatePresence>

        {/* Expand hint */}
        <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-white/25">
          <span>{expanded ? "▲ Collapse" : "▼ Expand answer"}</span>
        </div>
      </div>
    </motion.div>
  );
}

function InterviewVaultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeDifficulty = searchParams.get("difficulty") || "all";
  const activeModule = searchParams.get("module") || "all";
  const activePage = parseInt(searchParams.get("page") || "1", 10);
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [qas, setQas] = useState<SearchEntry[]>([]);
  const [totalQAs, setTotalQAs] = useState(0);
  const [fuseInstance, setFuseInstance] = useState<Fuse<SearchEntry> | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { reviewedQANumbers, reviewQA } = useProgressStore();

  useEffect(() => {
    async function loadIndex() {
      try {
        const res = await fetch("/content-index.json");
        const index = await res.json();
        const allQAs = index.searchIndex.filter((s: SearchEntry) => s.type === "interviewQA");
        setQas(allQAs);
        setTotalQAs(index.totalQAs);
        setFuseInstance(new Fuse(allQAs, { keys: ["qaQuestion", "qaAnswer"], threshold: 0.35 }));
      } catch (err) {
        console.error("Failed to load vault index", err);
      }
    }
    loadIndex();
  }, []);

  const filteredQAs = useMemo(() => {
    let result = qas;
    if (searchQuery.trim() && fuseInstance) {
      result = fuseInstance.search(searchQuery).map(r => r.item);
    }
    return result.filter(qa => {
      const diffMatch = activeDifficulty === "all" || qa.difficulty === activeDifficulty;
      const modMatch = activeModule === "all" || qa.moduleSlug === activeModule;
      return diffMatch && modMatch;
    });
  }, [qas, searchQuery, fuseInstance, activeDifficulty, activeModule]);

  const totalPages = Math.max(1, Math.ceil(filteredQAs.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(activePage, totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedQAs = filteredQAs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const reviewedCount = filteredQAs.filter(qa => qa.qaNumber !== undefined && reviewedQANumbers.includes(qa.qaNumber)).length;

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    params.set("page", "1");
    router.replace(`/interview-vault?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    const params = new URLSearchParams(window.location.search);
    if (val.trim()) params.set("q", val); else params.delete("q");
    params.set("page", "1");
    router.replace(`/interview-vault?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.replace(`/interview-vault?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const modules = [
    { slug: "all", label: "All Modules" },
    { slug: "spring-framework-fundamentals", label: "Spring Core" },
    { slug: "spring-boot", label: "Spring Boot" },
    { slug: "spring-boot-annotations", label: "Annotations" },
    { slug: "microservices", label: "Microservices" },
    { slug: "java-collections", label: "Collections" },
    { slug: "java-8-17-21", label: "Modern Java" },
    { slug: "multithreading-concurrency", label: "Multithreading" },
    { slug: "sql-database", label: "SQL Database" },
    { slug: "jvm-internals", label: "JVM Internals" },
    { slug: "core-java", label: "Core Java" },
  ];

  const renderPagination = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center gap-1.5">
        {currentPage > 1 && <span className="text-white/25 text-xs font-mono">...</span>}
        {pages.map(p => (
          <button key={p} onClick={() => handlePageChange(p)}
            className={`w-9 h-9 rounded-xl font-mono text-xs border transition-all cursor-pointer flex items-center justify-center font-semibold ${
              currentPage === p
                ? "text-white border-cyan-500/40 shadow-lg"
                : "bg-white/3 text-white/45 border-white/8 hover:bg-white/8 hover:text-white"
            }`}
            style={currentPage === p ? { background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(16,227,155,0.08))", borderColor: "rgba(34,211,238,0.4)", boxShadow: "0 0 16px rgba(34,211,238,0.2)" } : {}}
          >{p}</button>
        ))}
        {currentPage < totalPages && <span className="text-white/25 text-xs font-mono">...</span>}
      </div>
    );
  };

  return (
    <main className="min-h-screen text-white relative overflow-hidden px-6 pb-28 flex flex-col items-center"
      style={{
        paddingTop: "9.5rem",
        background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(34,211,238,0.08) 0%, transparent 55%), #040814",
      }}
    >
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(ellipse 50% 30% at 90% 90%, rgba(167,139,250,0.05) 0%, transparent 60%)" }} />
      <FloatingParticles />
      <NavBar />

      <div className="w-full max-w-4xl space-y-6 z-10">

        {/* ── Hero Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b"
          style={{ borderColor: "rgba(34,211,238,0.1)" }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))", border: "1px solid rgba(251,191,36,0.3)" }}>
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-yellow-400/70">Technical Interview Vault</span>
            </div>
            <h1 className="text-2xl font-display font-black text-white" style={{ textShadow: "0 0 30px rgba(251,191,36,0.15)" }}>
              Interview Question Bank
            </h1>
            <p className="text-xs text-white/40 mt-1">
              {filteredQAs.length} questions · {reviewedCount} reviewed
            </p>
          </div>

          {/* Stats chips */}
          <div className="flex items-center gap-2">
            <div className="text-center px-3 py-2 rounded-xl border" style={{ borderColor: "rgba(34,211,238,0.15)", background: "rgba(34,211,238,0.05)" }}>
              <div className="text-lg font-display font-black text-cyan-400">{totalQAs}</div>
              <div className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Total Qs</div>
            </div>
            <div className="text-center px-3 py-2 rounded-xl border" style={{ borderColor: "rgba(16,227,155,0.15)", background: "rgba(16,227,155,0.05)" }}>
              <div className="text-lg font-display font-black text-emerald-400">{reviewedCount}</div>
              <div className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Reviewed</div>
            </div>
          </div>
        </motion.div>

        {/* ── Search + Filter Bar ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-3">
          <div className="flex gap-3">
            {/* Search box */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search questions, topics, keywords..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm text-white placeholder-white/25 focus:outline-none transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(34,211,238,0.15)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(34,211,238,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(34,211,238,0.15)"}
              />
            </div>
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium border transition-all cursor-pointer"
              style={{
                background: showFilters ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.04)",
                borderColor: showFilters ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.08)",
                color: showFilters ? "#22d3ee" : "rgba(255,255,255,0.5)",
              }}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Expandable filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-2xl space-y-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* Difficulty */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 w-20">Difficulty</span>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { id: "all", label: "All", color: "#ffffff" },
                        { id: "medium", label: "Medium", color: "#60a5fa" },
                        { id: "five-crore", label: "₹5 Crore", color: "#fbbf24" },
                      ].map(d => (
                        <button key={d.id} onClick={() => updateFilters("difficulty", d.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
                          style={{
                            color: activeDifficulty === d.id ? d.color : "rgba(255,255,255,0.45)",
                            borderColor: activeDifficulty === d.id ? `${d.color}40` : "rgba(255,255,255,0.08)",
                            background: activeDifficulty === d.id ? `${d.color}12` : "rgba(255,255,255,0.03)",
                          }}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Module */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 w-20">Module</span>
                    <div className="flex gap-2 flex-wrap">
                      {modules.map(m => {
                        const color = MODULE_COLORS[m.slug] || "#ffffff";
                        return (
                          <button key={m.slug} onClick={() => updateFilters("module", m.slug)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
                            style={{
                              color: activeModule === m.slug ? color : "rgba(255,255,255,0.45)",
                              borderColor: activeModule === m.slug ? `${color}40` : "rgba(255,255,255,0.08)",
                              background: activeModule === m.slug ? `${color}10` : "rgba(255,255,255,0.03)",
                            }}>
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── QA Cards ── */}
        <div className="space-y-3">
          {paginatedQAs.length > 0 ? (
            paginatedQAs.map((qa, idx) => (
              <QACard
                key={`${qa.topicSlug || ""}-${qa.qaNumber || idx}`}
                qa={qa}
                idx={idx}
                isReviewed={qa.qaNumber !== undefined && reviewedQANumbers.includes(qa.qaNumber)}
                onReview={() => qa.qaNumber !== undefined && reviewQA(qa.qaNumber)}
              />
            ))
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="text-4xl">🔍</div>
              <p className="text-white/40 text-sm font-mono">No questions matched your filters.</p>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-center pt-4 border-t"
            style={{ borderColor: "rgba(34,211,238,0.08)" }}
          >
            <span className="text-xs text-white/35 font-mono">
              Page <span className="text-white/60">{currentPage}</span> of <span className="text-white/60">{totalPages}</span>
              {" "}· <span className="text-white/60">{filteredQAs.length}</span> questions
            </span>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}
                className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/8"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
                <ChevronLeft className="w-4 h-4 text-white/60" />
              </button>
              {renderPagination()}
              <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}
                className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/8"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
                <ChevronRight className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <MissionDock />
    </main>
  );
}

export default function InterviewVaultPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/40 text-xs font-mono">Loading Interview Vault...</p>
        </div>
      </div>
    }>
      <InterviewVaultContent />
    </React.Suspense>
  );
}
