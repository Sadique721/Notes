"use client";

/**
 * ProgressProvider — Zustand-backed learner progress store
 * Persisted to localStorage. Powers /progress, gamification, and graph node states.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { hasXPEvent, logXPEvent } from "@/utils/db";

interface GamificationState {
  xp: number;
  streak: number;
  lastVisitDate: string | null;
  milestones: string[];
  visitedTopicSlugs: string[];
  reviewedQANumbers: number[];
  lastViewMode: "grid" | "graph";
  sidebarOpen: boolean;
  bookmarks: string[];
}

interface GamificationActions {
  visitTopic: (slug: string) => Promise<void>;
  reviewQA: (number: number) => Promise<void>;
  addXp: (amount: number) => void;
  setViewMode: (mode: "grid" | "graph") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addMilestone: (key: string) => void;
  toggleBookmark: (slug: string) => void;
  getModuleCompletion: (
    moduleSlug: string,
    totalTopics: number
  ) => number;
  reset: () => void;
}

const XP_PER_TOPIC = 10;
const XP_PER_QA = 5;

const initialState: GamificationState = {
  xp: 0,
  streak: 0,
  lastVisitDate: null,
  milestones: [],
  visitedTopicSlugs: [],
  reviewedQANumbers: [],
  lastViewMode: "graph",
  sidebarOpen: false,
  bookmarks: [],
};

export const useProgressStore = create<
  GamificationState & GamificationActions
>()(
  persist(
    (set, get) => ({
      ...initialState,

      visitTopic: async (slug: string) => {
        const state = get();
        if (state.visitedTopicSlugs.includes(slug)) return;

        const eventId = `read-topic:${slug}`;
        const alreadyLogged = await hasXPEvent(eventId);
        if (alreadyLogged) {
          set({
            visitedTopicSlugs: [...state.visitedTopicSlugs, slug],
          });
          return;
        }

        await logXPEvent(eventId, XP_PER_TOPIC);

        const today = new Date().toDateString();
        const lastDate = state.lastVisitDate;
        const isConsecutiveDay =
          lastDate === new Date(Date.now() - 86400000).toDateString();
        const newStreak =
          lastDate === today
            ? state.streak
            : isConsecutiveDay
            ? state.streak + 1
            : 1;

        set({
          visitedTopicSlugs: [...state.visitedTopicSlugs, slug],
          xp: state.xp + XP_PER_TOPIC,
          streak: newStreak,
          lastVisitDate: today,
        });
      },

      reviewQA: async (number: number) => {
        const state = get();
        if (state.reviewedQANumbers.includes(number)) return;

        const eventId = `review-qa:${number}`;
        const alreadyLogged = await hasXPEvent(eventId);
        if (alreadyLogged) {
          set({
            reviewedQANumbers: [...state.reviewedQANumbers, number],
          });
          return;
        }

        await logXPEvent(eventId, XP_PER_QA);

        set({
          reviewedQANumbers: [...state.reviewedQANumbers, number],
          xp: state.xp + XP_PER_QA,
        });
      },

      addXp: (amount: number) => {
        set((state) => ({ xp: state.xp + amount }));
      },

      setViewMode: (mode) => set({ lastViewMode: mode }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addMilestone: (key: string) => {
        const state = get();
        if (state.milestones.includes(key)) return;
        set({ milestones: [...state.milestones, key] });
      },

      toggleBookmark: (slug: string) => {
        const state = get();
        const bms = state.bookmarks || [];
        const newBms = bms.includes(slug)
          ? bms.filter((b) => b !== slug)
          : [...bms, slug];
        set({ bookmarks: newBms });
      },

      getModuleCompletion: (moduleSlug: string, totalTopics: number) => {
        // NOTE: This method cannot know which topic slugs belong to the module
        // without external data. It returns a percentage based on visited slugs
        // that were explicitly passed to visitTopic for this module.
        // For accurate per-module counts use the Sidebar's moduleCompletion memo.
        const state = get();
        if (totalTopics === 0) return 0;
        // Filter slugs that start with moduleSlug only if they contain it exactly
        // (this is a best-effort approximation — prefer using SYLLABUS_MAP directly)
        const completed = state.visitedTopicSlugs.filter((s) => {
          // Topic slugs are standalone (e.g. "hashmap-internals"), not prefixed.
          // This method is not reliable without slug→module mapping.
          // Return 0 unless caller provides topic slugs via moduleSlug prefix convention.
          return s.startsWith(moduleSlug + "-") || s === moduleSlug;
        }).length;
        return Math.round((completed / totalTopics) * 100);
      },

      reset: () => set(initialState),
    }),
    {
      name: "injoyreadplay-progress",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Level computation from XP
export function getLevel(xp: number): {
  level: string;
  label: string;
  next: number;
  progress: number;
} {
  const thresholds = [
    { xp: 0, level: "beginner", label: "Beginner" },
    { xp: 200, level: "intermediate", label: "Intermediate" },
    { xp: 500, level: "advanced", label: "Advanced" },
    { xp: 1000, level: "expert", label: "Expert" },
    { xp: 2000, level: "god-mode", label: "⚡ GOD MODE" },
  ];

  let current = thresholds[0];
  let next = thresholds[1];

  for (let i = 0; i < thresholds.length - 1; i++) {
    if (xp >= thresholds[i].xp && xp < thresholds[i + 1].xp) {
      current = thresholds[i];
      next = thresholds[i + 1];
      break;
    }
    if (xp >= thresholds[thresholds.length - 1].xp) {
      current = thresholds[thresholds.length - 1];
      next = thresholds[thresholds.length - 1];
    }
  }

  const range = next.xp - current.xp;
  const earned = xp - current.xp;
  const progress = range === 0 ? 100 : Math.min(100, Math.round((earned / range) * 100));

  return { level: current.level, label: current.label, next: next.xp, progress };
}
