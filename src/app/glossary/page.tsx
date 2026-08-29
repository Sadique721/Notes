"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, BookOpen, Tag } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { MissionDock } from "@/components/ui/MissionDock";
import { NavBar } from "@/components/layout/NavBar";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function GlossaryPage() {
  const [terms, setTerms] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    fetch("/content-index.json").then(r => r.json()).then(d => {
      // Deduplicate glossary terms
      const seen = new Set<string>();
      const deduped = (d.glossaryTerms || []).filter((t: any) => {
        if (seen.has(t.term.toLowerCase())) return false;
        seen.add(t.term.toLowerCase());
        return true;
      });
      setTerms(deduped);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return terms;
    const q = query.toLowerCase();
    return terms.filter(t => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
  }, [terms, query]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-surface-base text-white relative overflow-hidden px-6 pb-28" style={{ paddingTop: "9.5rem" }}>
      <div className="absolute inset-0 bg-aurora-2 opacity-10 pointer-events-none z-0" />
      <FloatingParticles />
      <NavBar />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/70 mb-1">Technical Vocabulary</p>
          <h1 className="text-3xl font-display font-bold text-white">Glossary</h1>
          <p className="text-sm text-white/45 mt-1">{terms.length} terms extracted from the full curriculum</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search terms..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors" />
        </div>

        <p className="text-xs text-white/35 font-mono">{filtered.length} terms matching{query ? ` "${query}"` : ""}</p>

        {/* Term grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paginated.map((term, idx) => (
            <motion.div key={term.term + idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.3) }}>
              <GlassPanel className="p-4 border-white/5 bg-black/20 h-full hover:border-white/10 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-cyan-400/10 flex-shrink-0 mt-0.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-sm text-cyan-300 mb-1">{term.term}</h3>
                    <p className="text-xs text-white/55 leading-relaxed line-clamp-3">{term.definition}</p>
                    {term.relatedTopicSlugs?.length > 0 && (
                      <Link href={`/topic/${term.relatedTopicSlugs[0]}`}
                        className="inline-flex items-center gap-1 mt-2 text-[10px] text-cyan-400/70 hover:text-cyan-400 transition-colors">
                        <BookOpen className="w-3 h-3" /> View in context
                      </Link>
                    )}
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-xs text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
              Previous
            </button>
            <span className="text-xs text-white/40 font-mono">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-xs text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
              Next
            </button>
          </div>
        )}
      </div>
      <MissionDock />
    </main>
  );
}