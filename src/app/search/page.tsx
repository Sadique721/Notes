"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { MissionDock } from "@/components/ui/MissionDock";
import { NavBar } from "@/components/layout/NavBar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Search, Compass, Trophy, Award, ArrowRight } from "lucide-react";
import Fuse from "fuse.js";
import Link from "next/link";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [searchIndex, setSearchIndex] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [fuse, setFuse] = useState<Fuse<any> | null>(null);

  // Load content-index.json on mount
  useEffect(() => {
    async function loadIndex() {
      try {
        const res = await fetch("/content-index.json");
        const data = await res.json();
        setSearchIndex(data.searchIndex);

        // Configure Fuse.js options
        const options = {
          keys: ["topicTitle", "qaQuestion", "qaAnswer", "summary", "searchableText"],
          threshold: 0.3,
        };
        const fuseInstance = new Fuse(data.searchIndex, options);
        setFuse(fuseInstance);
      } catch (err) {
        console.error("Failed to load content index for search", err);
      }
    }
    loadIndex();
  }, []);

  // Update results when query or fuse instance updates
  useEffect(() => {
    if (!fuse) return;
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = fuse.search(query);
    setResults(searchResults.map((r) => r.item));
  }, [query, fuse]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    // Sync query parameters with URL history state
    const params = new URLSearchParams(window.location.search);
    if (val.trim()) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    router.replace(`/search?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-surface-base text-white relative overflow-hidden px-6 pb-28 flex flex-col items-center" style={{ paddingTop: "9.5rem" }}>
      <FloatingParticles />
      <NavBar />

      <div className="w-full max-w-2xl space-y-6 z-10">
        {/* Search Input Box */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/40">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Type search terms (e.g. HashMap, Bean Lifecycle, JWT)..."
            className="w-full pl-12 pr-6 py-4 rounded-2xl glass-vision border-white/10 bg-black/40 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all duration-300 shadow-glass-heavy"
            autoFocus
          />
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {results.length > 0 ? (
            results.slice(0, 15).map((item, idx) => {
              const isTopic = item.type === "topic";
              const Icon = isTopic ? Compass : Trophy;
              const linkUrl = isTopic
                ? `/topic/${item.topicSlug}`
                : `/topic/${item.topicSlug}?mode=interview`;

              return (
                <Link key={idx} href={linkUrl} className="block group cursor-pointer animate-slide-up">
                  <GlassPanel
                    hoverEffect
                    className="p-5 border-white/5 bg-white/2 hover:border-white/10 transition-all relative flex items-start gap-4"
                  >
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400">
                          {item.type} · {item.moduleTitle}
                        </span>
                      </div>
                      <h4 className="font-display font-semibold text-white group-hover:text-emerald-400 transition-colors text-sm">
                        {isTopic ? item.topicTitle : item.qaQuestion}
                      </h4>
                      <p className="text-white/50 text-xs leading-normal">
                        {isTopic ? item.summary : item.qaAnswer.substring(0, 160) + "..."}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/25 group-hover:text-emerald-400 transition-colors self-center" />
                  </GlassPanel>
                </Link>
              );
            })
          ) : query.trim() ? (
            <div className="text-center py-12 text-white/40 text-xs animate-pulse">
              No results found matching "{query}"
            </div>
          ) : (
            <div className="text-center py-12 text-white/30 text-xs">
              Begin typing to search across the entire 10-module curriculum.
            </div>
          )}
        </div>
      </div>

      <MissionDock />
    </main>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense fallback={<div className="text-white/40 text-xs text-center py-20">Loading Search...</div>}>
      <SearchContent />
    </React.Suspense>
  );
}

