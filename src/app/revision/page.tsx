"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Star, Flame, BookOpen, Search, ArrowRight, Trash2, Calendar, Bookmark, FileText, Check } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { NavBar } from "@/components/layout/NavBar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useProgressStore } from "@/components/providers/ProgressProvider";
import { getAllNotes, getAllHighlights, getAllSRSCards, saveSRSCard, UserNote, UserHighlight, SRSState } from "@/utils/db";
import { MissionDock } from "@/components/ui/MissionDock";

// Standard SM-2 Spaced Repetition algorithm
function calculateSM2(quality: number, prevInterval: number, prevEase: number, prevRepetitions: number) {
  let ease = prevEase;
  let repetitions = prevRepetitions;
  let interval = 1;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.ceil(prevInterval * ease);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Adjust Ease Factor (EF)
  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3;

  return { intervalDays: interval, easeFactor: ease, repetitions };
}

export default function RevisionPage() {
  const { bookmarks, visitedTopicSlugs, addXp } = useProgressStore();
  
  const [activeTab, setActiveTab] = useState<"srs" | "bookmarks" | "notebook">("srs");
  const [searchQuery, setSearchQuery] = useState("");

  // Storage tiers states
  const [allNotes, setAllNotes] = useState<UserNote[]>([]);
  const [allHighlights, setAllHighlights] = useState<UserHighlight[]>([]);
  const [srsCards, setSrsCards] = useState<SRSState[]>([]);
  const [manifest, setManifest] = useState<Record<string, any>>({});

  // Active SRS Review Session
  const [activeReviewCard, setActiveReviewCard] = useState<SRSState | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Load manifest & user notes/highlights
  useEffect(() => {
    fetch("/content-manifest.json")
      .then(r => r.json())
      .then(data => setManifest(data))
      .catch(console.error);

    async function loadData() {
      try {
        const notes = await getAllNotes();
        const highlights = await getAllHighlights();
        const srs = await getAllSRSCards();
        setAllNotes(notes);
        setAllHighlights(highlights);
        setSrsCards(srs);
      } catch (err) {
        console.error("Failed to load local DB files for revision page", err);
      }
    }
    loadData();
  }, []);

  // Filter due cards based on today's date
  const dueCards = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return srsCards.filter(card => {
      // Due if nextReviewDate is today or past
      return card.nextReviewDate <= todayStr;
    });
  }, [srsCards]);

  useEffect(() => {
    if (dueCards.length > 0 && !activeReviewCard) {
      setActiveReviewCard(dueCards[0]);
    }
  }, [dueCards, activeReviewCard]);

  // Handle SRS Quality Grading
  const handleGradeSRS = async (quality: number) => {
    if (!activeReviewCard) return;

    const prevInterval = activeReviewCard.intervalDays;
    const prevEase = activeReviewCard.easeFactor;
    const prevRepetitions = activeReviewCard.repetitions;

    const sm2 = calculateSM2(quality, prevInterval, prevEase, prevRepetitions);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + sm2.intervalDays);
    const nextReviewDate = nextDate.toISOString().split("T")[0];

    const updatedCard: SRSState = {
      ...activeReviewCard,
      intervalDays: sm2.intervalDays,
      easeFactor: sm2.easeFactor,
      repetitions: sm2.repetitions,
      nextReviewDate,
      lastReviewedAt: new Date().toISOString(),
      reviewCount: activeReviewCard.reviewCount + 1,
      lapseCount: quality < 3 ? activeReviewCard.lapseCount + 1 : activeReviewCard.lapseCount,
      qualityHistory: [...(activeReviewCard.qualityHistory || []), quality]
    };

    try {
      await saveSRSCard(updatedCard);
      // Award XP
      addXp(20);
      
      // Update state arrays
      setSrsCards(prev => prev.map(c => 
        (c.topicId === updatedCard.topicId && c.cardId === updatedCard.cardId) ? updatedCard : c
      ));

      // Advance to next due card
      const remainingDue = dueCards.filter(c => c.topicId !== updatedCard.topicId || c.cardId !== updatedCard.cardId);
      if (remainingDue.length > 0) {
        setActiveReviewCard(remainingDue[0]);
      } else {
        setActiveReviewCard(null);
      }
      setIsRevealed(false);
    } catch (err) {
      console.error("Failed to update SRS card state", err);
    }
  };

  // Group Notebook contents by Topic
  const notebookTopics = useMemo(() => {
    const topicsMap: Record<string, { notes: UserNote[]; highlights: UserHighlight[] }> = {};

    allNotes.forEach(note => {
      if (!topicsMap[note.topicId]) topicsMap[note.topicId] = { notes: [], highlights: [] };
      topicsMap[note.topicId].notes.push(note);
    });

    allHighlights.forEach(hl => {
      if (!topicsMap[hl.topicId]) topicsMap[hl.topicId] = { notes: [], highlights: [] };
      topicsMap[hl.topicId].highlights.push(hl);
    });

    // Filter by query if query exists
    if (!searchQuery.trim()) return topicsMap;
    const q = searchQuery.toLowerCase();

    const filtered: Record<string, { notes: UserNote[]; highlights: UserHighlight[] }> = {};
    Object.keys(topicsMap).forEach(k => {
      const topicTitle = manifest[k]?.title || k;
      const nMatches = topicsMap[k].notes.filter(n => n.text.toLowerCase().includes(q));
      const hMatches = topicsMap[k].highlights.filter(h => h.text.toLowerCase().includes(q));

      if (topicTitle.toLowerCase().includes(q) || nMatches.length > 0 || hMatches.length > 0) {
        filtered[k] = { notes: nMatches, highlights: hMatches };
      }
    });

    return filtered;
  }, [allNotes, allHighlights, searchQuery, manifest]);

  return (
    <main className="min-h-screen bg-surface-base text-white relative overflow-hidden px-6 pb-28" style={{ paddingTop: "9.5rem" }}>
      <div className="absolute inset-0 bg-aurora-1 opacity-5 pointer-events-none z-0" />
      <FloatingParticles />
      <NavBar />

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Header Overview */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-1">Knowledge Engine</p>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Award className="w-8 h-8 text-purple-400" /> Revision Control Center
          </h1>
          <p className="text-sm text-white/45 mt-1">Review active notebook collections, bookmark folders, and spaced repetition card decks.</p>
        </div>

        {/* Tab Controls Panel */}
        <div className="flex border-b border-white/5 gap-6 text-sm font-medium">
          {([
            { id: "srs", label: `SRS Review Deck (${dueCards.length})`, icon: Calendar },
            { id: "bookmarks", label: `Bookmarks (${bookmarks.length})`, icon: Bookmark },
            { id: "notebook", label: `My Notebook (${allNotes.length + allHighlights.length})`, icon: FileText }
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3.5 relative transition-colors cursor-pointer ${
                  isActive ? "text-purple-400" : "text-white/45 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Render Active View */}
        <AnimatePresence mode="wait">
          {activeTab === "srs" && (
            <motion.div
              key="srs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {activeReviewCard && manifest[activeReviewCard.topicId] ? (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="text-center font-mono text-[10px] text-white/35">
                    SRS Decks · {dueCards.length} cards remaining
                  </div>

                  <GlassPanel className="p-8 border-white/8 bg-black/40 text-center space-y-6 relative min-h-[300px] flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[9px] text-purple-400 font-bold uppercase tracking-wider">
                        {manifest[activeReviewCard.topicId].title}
                      </span>
                      <h3 className="text-lg font-display font-semibold mt-4 leading-snug">
                        {activeReviewCard.cardId}
                      </h3>
                    </div>

                    <AnimatePresence>
                      {isRevealed ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-6 border-t border-white/5 space-y-4"
                        >
                          <div className="text-xs text-white/70 leading-relaxed font-sans max-w-lg mx-auto">
                            {/* Detailed concept verification */}
                            Recall reference answers or execute contextual deep dives. Verify that you accurately referenced low-level heap sizes, annotations, or execution algorithms.
                          </div>

                          {/* Grade buttons */}
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-[9px] font-mono text-white/45">Grade your recall quality:</span>
                            <div className="flex justify-center gap-1.5 flex-wrap">
                              {["Blackout (0)", "Incorrect (1)", "Hard (2)", "Good (3)", "Easy (4)"].map((label, idx) => (
                                <button
                                  key={label}
                                  onClick={() => handleGradeSRS(idx)}
                                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold cursor-pointer transition-all ${
                                    idx >= 3
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                      : "bg-red-500/5 border-red-500/15 text-red-400 hover:bg-red-500/15"
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => setIsRevealed(true)}
                          className="w-fit mx-auto px-6 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 font-display font-semibold text-xs cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Reveal Reference Solution
                        </button>
                      )}
                    </AnimatePresence>
                  </GlassPanel>

                  <div className="flex justify-center">
                    <Link href={`/topic/${activeReviewCard.topicId}`} className="text-xs text-purple-400/80 hover:text-purple-400 font-mono flex items-center gap-1.5">
                      Open contextual topic page <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-white/30 text-xs font-mono max-w-sm mx-auto space-y-4">
                  <div className="p-4 rounded-full bg-purple-500/5 w-fit mx-auto border border-purple-500/10">
                    <Check className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-display font-bold text-white">All Caught Up!</h3>
                  <p className="leading-relaxed">No flashcards are due for revision today. Visited topics will appear here based on standard spaced-repetition schedules.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "bookmarks" && (
            <motion.div
              key="bookmarks"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {bookmarks.length > 0 ? (
                bookmarks.map((slug) => {
                  const tMeta = manifest[slug];
                  if (!tMeta) return null;
                  return (
                    <Link key={slug} href={`/topic/${slug}`} className="block group cursor-pointer">
                      <GlassPanel hoverEffect className="p-5 border-white/5 bg-black/20 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="font-mono text-[8px] uppercase tracking-wider text-purple-400/80">
                            {tMeta.moduleSlug.replace(/-/g, " ")}
                          </span>
                          <h3 className="font-display font-bold text-sm text-white group-hover:text-purple-400 transition-colors">
                            {tMeta.title}
                          </h3>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition-all group-hover:translate-x-1" />
                      </GlassPanel>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-16 text-white/30 text-xs font-mono max-w-xs mx-auto space-y-2">
                  <Bookmark className="w-6 h-6 text-white/20 mx-auto" />
                  <p className="leading-normal">No bookmarked topics found. Bookmark topics inside the reading engine to save them here.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "notebook" && (
            <motion.div
              key="notebook"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Search Notebook */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inside notes and highlights..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/25 text-xs focus:outline-none focus:border-purple-400/50 transition-colors"
                />
              </div>

              {Object.keys(notebookTopics).length > 0 ? (
                Object.keys(notebookTopics).map((topicId) => {
                  const entry = notebookTopics[topicId];
                  const topicTitle = manifest[topicId]?.title || topicId;

                  return (
                    <GlassPanel key={topicId} className="p-6 border-white/5 bg-black/20 space-y-4">
                      {/* Topic Header */}
                      <div className="flex justify-between items-start gap-4 border-b border-white/5 pb-2">
                        <div>
                          <h3 className="font-display font-bold text-sm text-purple-300 leading-snug">{topicTitle}</h3>
                          <span className="text-[9px] font-mono text-white/30 uppercase">{topicId.replace(/-/g, " ")}</span>
                        </div>
                        <Link href={`/topic/${topicId}`} className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-0.5">
                          View topic <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Highlights */}
                      {entry.highlights.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[9px] font-mono text-white/40 uppercase">Highlights:</div>
                          <div className="space-y-2 pl-3 border-l-2 border-purple-500/20">
                            {entry.highlights.map((hl) => (
                              <p key={hl.id} className="text-xs text-white/80 italic leading-relaxed bg-white/2 p-2 rounded-lg">
                                "{hl.text}"
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {entry.notes.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[9px] font-mono text-white/40 uppercase">My Notes:</div>
                          <div className="space-y-2">
                            {entry.notes.map((note) => (
                              <div key={note.id} className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-2">
                                <p className="text-xs text-white/85 leading-relaxed font-sans">{note.text}</p>
                                <div className="flex justify-between items-center text-[9px] text-white/30 font-mono">
                                  <span>{new Date(note.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </GlassPanel>
                  );
                })
              ) : (
                <div className="text-center py-16 text-white/30 text-xs font-mono max-w-xs mx-auto space-y-2">
                  <FileText className="w-6 h-6 text-white/20 mx-auto" />
                  <p className="leading-normal">No notes or highlights matching selected filters found.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MissionDock />
    </main>
  );
}
