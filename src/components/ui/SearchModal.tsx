"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Trophy, Compass, ArrowRight, X } from "lucide-react";
import Fuse from "fuse.js";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "./GlassPanel";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [fuse, setFuse] = useState<Fuse<any> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load index once
  useEffect(() => {
    if (!isOpen) return;
    async function loadIndex() {
      try {
        const res = await fetch("/content-index.json");
        const data = await res.json();
        const options = {
          keys: ["topicTitle", "qaQuestion", "qaAnswer", "summary", "searchableText"],
          threshold: 0.3,
        };
        const fuseInstance = new Fuse(data.searchIndex, options);
        setFuse(fuseInstance);
      } catch (err) {
        console.error("Failed to load search index", err);
      }
    }
    loadIndex();
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Perform search
  useEffect(() => {
    if (!fuse) return;
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const searchResults = fuse.search(query);
    setResults(searchResults.map((r) => r.item).slice(0, 8));
  }, [query, fuse]);

  // Listen to escape key and Ctrl+K globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSelect = (item: any) => {
    onClose();
    if (item.type === "topic") {
      router.push(`/topic/${item.topicSlug}`);
    } else {
      router.push(`/topic/${item.topicSlug}?mode=interview`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-xl rounded-2xl glass-vision bg-black/40 overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Header Input */}
          <div className="relative border-b border-white/10 p-4 flex items-center">
            <Search className="w-5 h-5 text-white/40 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts, modules, Q&As (e.g. HashMap, JVM)..."
              className="flex-1 bg-transparent border-none text-white placeholder-white/30 text-sm focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-[360px] overflow-y-auto p-4 space-y-2">
            {results.length > 0 ? (
              results.map((item, idx) => {
                const isTopic = item.type === "topic";
                const Icon = isTopic ? Compass : Trophy;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-emerald-400 group-hover:bg-emerald-500/10 transition-all flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-emerald-400/80 block">
                        {item.type} · {item.moduleTitle}
                      </span>
                      <h4 className="font-display font-semibold text-white text-xs group-hover:text-emerald-400 transition-colors truncate mt-0.5">
                        {isTopic ? item.topicTitle : item.qaQuestion}
                      </h4>
                      <p className="text-white/40 text-[10px] truncate leading-normal mt-0.5">
                        {isTopic ? item.summary : item.qaAnswer}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-emerald-400 transition-colors self-center flex-shrink-0" />
                  </button>
                );
              })
            ) : query.trim() ? (
              <div className="text-center py-8 text-white/40 text-xs font-mono">
                No results found matching "{query}"
              </div>
            ) : (
              <div className="text-center py-8 text-white/30 text-xs font-mono">
                Search CodeVerse: The Interactive Universe
              </div>
            )}
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
