"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Flame, Star, BookOpen, ArrowRight } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { MissionDock } from "@/components/ui/MissionDock";
import { NavBar } from "@/components/layout/NavBar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useProgressStore } from "@/components/providers/ProgressProvider";

import { SYLLABUS_MAP } from "@/lib/syllabusGenerator";

const MODULE_META = [
  { slug: "spring-framework-fundamentals", title: "Spring Core", color: "#10E39B", total: 19 },
  { slug: "spring-boot", title: "Spring Boot", color: "#22D3EE", total: 17 },
  { slug: "spring-boot-annotations", title: "Annotations", color: "#38BDF8", total: 26 },
  { slug: "microservices", title: "Microservices", color: "#A78BFA", total: 25 },
  { slug: "java-collections", title: "Collections", color: "#FBBF24", total: 26 },
  { slug: "java-8-17-21", title: "Modern Java", color: "#E879F9", total: 12 },
  { slug: "multithreading-concurrency", title: "Multithreading", color: "#FB7185", total: 12 },
  { slug: "sql-database", title: "SQL Database", color: "#A3E635", total: 24 },
  { slug: "jvm-internals", title: "JVM Internals", color: "#FB923C", total: 16 },
  { slug: "core-java", title: "Core Java", color: "#60A5FA", total: 17 },
];

function ProgressRing({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
        transition={{ duration: 1.2, ease: "easeOut" }} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" className="font-mono font-bold" style={{ fontSize: size * 0.18, fill: color }}>
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

export default function ProgressPage() {
  const { visitedTopicSlugs, reviewedQANumbers, xp, streak } = useProgressStore();
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    const all = Object.keys(SYLLABUS_MAP).map(slug => ({
      slug,
      moduleSlug: SYLLABUS_MAP[slug].moduleSlug,
      title: SYLLABUS_MAP[slug].title
    }));
    setTopics(all);
  }, []);

  const totalTopics = topics.length || 194;
  const completedTopics = visitedTopicSlugs.length;
  const overallPct = Math.round((completedTopics / totalTopics) * 100);
  const reviewedCount = reviewedQANumbers.length;

  return (
    <main className="min-h-screen bg-surface-base text-white relative overflow-hidden px-6 pb-28" style={{ paddingTop: "9.5rem" }}>
      <div className="absolute inset-0 bg-aurora-3 opacity-10 pointer-events-none z-0" />
      <FloatingParticles />
      <NavBar />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/70 mb-1">Learning Journey</p>
          <h1 className="text-3xl font-display font-bold text-white">Progress Dashboard</h1>
          <p className="text-sm text-white/45 mt-1">Track your path through the Java &amp; Spring universe</p>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "XP Points", value: xp, icon: Star, color: "#FBBF24" },
            { label: "Day Streak", value: streak, icon: Flame, color: "#FB7185" },
            { label: "Topics Read", value: completedTopics, icon: BookOpen, color: "#10E39B" },
            { label: "QAs Reviewed", value: reviewedCount, icon: Trophy, color: "#A78BFA" },
          ].map(({ label, value, icon: Icon, color }) => (
            <GlassPanel key={label} className="p-5 border-white/5 bg-black/20 flex items-center gap-4">
              <div className="p-2.5 rounded-xl" style={{ background: `${color}15` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <div className="font-display font-bold text-2xl text-white">{value}</div>
                <div className="text-[11px] text-white/40">{label}</div>
              </div>
            </GlassPanel>
          ))}
        </div>

        {/* Overall progress ring */}
        <GlassPanel className="p-6 border-white/5 bg-black/20 flex items-center gap-8">
          <ProgressRing pct={overallPct} color="#10E39B" size={100} />
          <div>
            <h2 className="text-lg font-display font-bold text-white">Overall Curriculum Progress</h2>
            <p className="text-sm text-white/50 mt-1">{completedTopics} of {totalTopics} topics visited across all 10 modules</p>
            <p className="text-sm text-white/40 mt-0.5">{reviewedCount} interview questions reviewed</p>
          </div>
        </GlassPanel>

        {/* Per-module breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULE_META.map((mod) => {
            const modTopics = topics.filter(t => t.moduleSlug === mod.slug);
            const done = modTopics.filter(t => visitedTopicSlugs.includes(t.slug)).length;
            const total = mod.total;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <motion.div key={mod.slug} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120 }}>
                <Link href={`/modules/${mod.slug}`} className="block group">
                  <GlassPanel hoverEffect className="p-5 border-white/5 bg-black/20 flex items-center gap-4">
                    <ProgressRing pct={pct} color={mod.color} size={56} />
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-sm" style={{ color: mod.color }}>{mod.title}</h3>
                      <p className="text-xs text-white/40 mt-0.5">{done} / {total} topics</p>
                      <div className="mt-2 h-1 rounded-full bg-white/8 overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          style={{ backgroundColor: mod.color }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: "easeOut" }} />
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                  </GlassPanel>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
      <MissionDock />
    </main>
  );
}