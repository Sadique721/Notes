"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Trophy, CheckCircle, ChevronDown, ChevronRight, 
  Search, ShieldAlert, Cpu, Award, Zap, Star, Compass
} from "lucide-react";
import { useProgressStore } from "@/components/providers/ProgressProvider";
import { GlassPanel } from "@/components/ui/GlassPanel";

const MODULE_THEMES: Record<string, { color: string; label: string; index: number }> = {
  "dashboard": { color: "#10E39B", label: "Dashboard", index: 1 },
  "api-providers": { color: "#22D3EE", label: "API Providers", index: 2 },
  "services": { color: "#38BDF8", label: "Services", index: 3 },
  "inventory": { color: "#A78BFA", label: "Inventory", index: 4 },
  "orders": { color: "#FBBF24", label: "Orders", index: 5 },
  "users": { color: "#E879F9", label: "Users", index: 6 },
  "message": { color: "#FB7185", label: "Message", index: 7 },
  "payments": { color: "#A3E635", label: "Payments", index: 8 },
  "invoices": { color: "#FB923C", label: "Invoices", index: 9 },
  "currency": { color: "#60A5FA", label: "Currency", index: 10 },
};

import { SYLLABUS_MAP } from "@/lib/syllabusGenerator";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, visitedTopicSlugs } = useProgressStore();
  const [manifest, setManifest] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  
  const params = useParams();
  const activeTopicSlug = params?.slug as string;

  // Load modules-manifest.json on mount
  useEffect(() => {
    fetch("/modules-manifest.json")
      .then((res) => res.json())
      .then((data) => {
        // Build the complete list of modules and topics from SYLLABUS_MAP
        const completeManifest: Record<string, any> = {
          "dashboard": { slug: "dashboard", title: "Dashboard", topics: [] },
          "api-providers": { slug: "api-providers", title: "API Providers", topics: [] },
          "services": { slug: "services", title: "Services", topics: [] },
          "inventory": { slug: "inventory", title: "Inventory", topics: [] },
          "orders": { slug: "orders", title: "Orders", topics: [] },
          "users": { slug: "users", title: "Users", topics: [] },
          "message": { slug: "message", title: "Message", topics: [] },
          "payments": { slug: "payments", title: "Payments", topics: [] },
          "invoices": { slug: "invoices", title: "Invoices", topics: [] },
          "currency": { slug: "currency", title: "Currency", topics: [] },
        };

        // Populate topics from SYLLABUS_MAP in order
        Object.keys(SYLLABUS_MAP).forEach((slug) => {
          const item = SYLLABUS_MAP[slug];
          const mod = completeManifest[item.moduleSlug];
          if (mod) {
            // Find existing topic stats if available in fetched data
            const existingTopic = data[item.moduleSlug]?.topics?.find((t: any) => t.slug === slug);
            
            mod.topics.push({
              slug,
              moduleSlug: item.moduleSlug,
              title: item.title,
              order: item.order,
              summaryOneLiner: existingTopic?.summaryOneLiner || `Detailed 69-point syllabus explainer guide for ${item.title}.`,
              estimatedReadMinutes: existingTopic?.estimatedReadMinutes || 25,
              generated: existingTopic?.generated ?? true,
              qaCount: existingTopic?.qaCount || 3,
              diagramCount: existingTopic?.diagramCount || 0,
              partCount: existingTopic?.partCount || 1,
            });
          }
        });

        // Sort topics in each module by their defined order
        Object.keys(completeManifest).forEach((key) => {
          completeManifest[key].topics.sort((a: any, b: any) => a.order - b.order);
        });

        setManifest(completeManifest);
      })
      .catch((err) => console.error("Failed to load modules manifest in sidebar", err));
  }, []);

  // Auto-expand active module when activeTopicSlug or manifest changes
  useEffect(() => {
    if (!activeTopicSlug || !manifest || Object.keys(manifest).length === 0) return;
    const activeModule = Object.keys(manifest).find(moduleKey => 
      manifest[moduleKey].topics?.some((topic: any) => topic.slug === activeTopicSlug)
    );
    if (activeModule) {
      setExpandedModules(prev => ({ ...prev, [activeModule]: true }));
    }
  }, [activeTopicSlug, manifest]);

  const toggleModule = (slug: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  // Filter modules and topics based on search
  const filteredManifest = useMemo(() => {
    if (!searchQuery.trim()) return manifest;
    const query = searchQuery.toLowerCase();
    
    const result: Record<string, any> = {};
    Object.keys(manifest).forEach((key) => {
      const mod = manifest[key];
      const matchingTopics = mod.topics.filter(
        (t: any) =>
          t.title.toLowerCase().includes(query) ||
          (t.summaryOneLiner || "").toLowerCase().includes(query)
      );
      
      if (mod.title.toLowerCase().includes(query) || matchingTopics.length > 0) {
        result[key] = {
          ...mod,
          topics: matchingTopics.length > 0 ? matchingTopics : mod.topics,
        };
      }
    });
    return result;
  }, [manifest, searchQuery]);

  // Compute overall progress per module
  const moduleCompletion = useMemo(() => {
    const stats: Record<string, { completed: number; total: number; pct: number }> = {};
    Object.keys(manifest).forEach((key) => {
      const topics = manifest[key].topics || [];
      const completed = topics.filter((t: any) => visitedTopicSlugs.includes(t.slug)).length;
      stats[key] = {
        completed,
        total: topics.length,
        pct: topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0,
      };
    });
    return stats;
  }, [manifest, visitedTopicSlugs]);

  if (pathname === "/") return null;

  return (
    <>
      {/* Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed top-16 left-0 h-[calc(100vh-64px)] w-80 bg-surface-base/95 border-r border-white/10 backdrop-blur-2xl z-30 flex flex-col overflow-hidden"
          >
            {/* Header / Search bar */}
            <div className="p-4 border-b border-white/5 space-y-3 bg-black/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">
                  Curriculum Navigator
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  10 Modules
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  type="text"
                  placeholder="Filter syllabus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Modules / Topics list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-emerald-500/10 scrollbar-track-transparent">
              {/* Curriculum Portals Grid */}
              <div className="space-y-1.5 border-b border-white/5 pb-3">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white/30 block px-1">
                  Curriculum Portals
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link href="/knowledge-graph" onClick={() => setSidebarOpen(false)} className="block">
                    <div className="p-2 rounded-lg border border-white/5 bg-white/2 hover:bg-white/5 transition-colors text-center cursor-pointer">
                      <Compass className="w-3.5 h-3.5 mx-auto text-emerald-400 mb-1" />
                      <div className="text-[8px] font-semibold text-white/80">Concept Map</div>
                    </div>
                  </Link>
                  <Link href="/interview-vault" onClick={() => setSidebarOpen(false)} className="block">
                    <div className="p-2 rounded-lg border border-white/5 bg-white/2 hover:bg-white/5 transition-colors text-center cursor-pointer">
                      <Trophy className="w-3.5 h-3.5 mx-auto text-yellow-400 mb-1" />
                      <div className="text-[8px] font-semibold text-white/80">Interview Prep</div>
                    </div>
                  </Link>
                  <Link href="/revision" onClick={() => setSidebarOpen(false)} className="block">
                    <div className="p-2 rounded-lg border border-white/5 bg-white/2 hover:bg-white/5 transition-colors text-center cursor-pointer">
                      <Award className="w-3.5 h-3.5 mx-auto text-purple-400 mb-1" />
                      <div className="text-[8px] font-semibold text-white/80">Revision Vault</div>
                    </div>
                  </Link>
                  <Link href="/glossary" onClick={() => setSidebarOpen(false)} className="block">
                    <div className="p-2 rounded-lg border border-white/5 bg-white/2 hover:bg-white/5 transition-colors text-center cursor-pointer">
                      <BookOpen className="w-3.5 h-3.5 mx-auto text-cyan-400 mb-1" />
                      <div className="text-[8px] font-semibold text-white/80">Vocabulary</div>
                    </div>
                  </Link>
                </div>
              </div>

              {Object.keys(filteredManifest).length > 0 ? (
                Object.keys(filteredManifest).map((moduleKey) => {
                  const mod = filteredManifest[moduleKey];
                  const theme = MODULE_THEMES[moduleKey] || { color: "#10E39B", label: "Core", index: 0 };
                  const isExpanded = !!expandedModules[moduleKey] || searchQuery.trim().length > 0;
                  const stats = moduleCompletion[moduleKey] || { completed: 0, total: 0, pct: 0 };

                  return (
                    <div key={moduleKey} className="space-y-1">
                      {/* Module Trigger Header */}
                      <button
                        onClick={() => toggleModule(moduleKey)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="font-mono text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                            style={{ background: `${theme.color}15`, color: theme.color }}
                          >
                            {theme.index}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-xs font-semibold text-white/90 truncate group-hover:text-white transition-colors">
                              {mod.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-white/30 font-mono">
                                {stats.completed}/{stats.total} Completed
                              </span>
                              {stats.pct > 0 && (
                                <span
                                  className="text-[9px] font-mono font-semibold"
                                  style={{ color: theme.color }}
                                >
                                  {stats.pct}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                        )}
                      </button>

                      {/* Expanded Topics Constellation */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden pl-3 border-l border-white/5 ml-4.5 space-y-1 mt-1"
                          >
                            {mod.topics?.map((topic: any) => {
                              const isActive = activeTopicSlug === topic.slug;
                              const isVisited = visitedTopicSlugs.includes(topic.slug);

                              return (
                                <Link
                                  key={topic.slug}
                                  href={`/topic/${topic.slug}`}
                                  onClick={() => setSidebarOpen(false)}
                                  className="block"
                                >
                                  <div
                                    className={`flex items-center justify-between p-2 rounded-lg text-[11px] font-medium transition-all group ${
                                      isActive
                                        ? "text-white"
                                        : "text-white/50 hover:text-white hover:bg-white/2"
                                    }`}
                                    style={
                                      isActive
                                        ? {
                                            background: `${theme.color}15`,
                                            borderLeft: `2px solid ${theme.color}`,
                                            color: theme.color,
                                          }
                                        : {}
                                    }
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="w-1 h-1 rounded-full bg-white/25 flex-shrink-0" 
                                        style={isActive ? { backgroundColor: theme.color } : {}} 
                                      />
                                      <span className="truncate">{topic.title}</span>
                                    </div>

                                    {isVisited ? (
                                      <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0 ml-1.5" />
                                    ) : topic.generated ? (
                                      <span className="text-[7px] font-mono font-bold text-white/30 group-hover:text-white/40 border border-white/10 px-1 py-0.5 rounded">
                                        AI
                                      </span>
                                    ) : null}
                                  </div>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-white/30 text-xs font-mono">
                  No matching topics found.
                </div>
              )}
            </div>

            {/* Footer summary info */}
            <div className="p-4 border-t border-white/5 bg-black/40 text-[10px] font-mono text-white/35 flex items-center justify-between">
              <span>Status: Online</span>
              <span>v1.0.0 Pro Max</span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Backdrop overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 top-16 bg-black z-20 pointer-events-auto backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
    </>
  );
}