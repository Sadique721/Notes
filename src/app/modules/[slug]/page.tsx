"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Grid, Network, BookOpen, Trophy, GitBranch, ChevronRight } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { MissionDock } from "@/components/ui/MissionDock";
import { NavBar } from "@/components/layout/NavBar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useProgressStore } from "@/components/providers/ProgressProvider";

const TopicConstellationGraph = dynamic(() => import("@/components/graph/TopicConstellationGraph"), { ssr: false });

const MODULE_META: Record<string, { color: string; title: string; description: string }> = {
  "spring-framework-fundamentals": { color: "#10E39B", title: "Spring Framework Fundamentals", description: "Core IoC container, bean lifecycle, scopes, and dependency injection." },
  "spring-boot": { color: "#22D3EE", title: "Spring Boot", description: "Auto-configuration, starters, embedded Tomcat, and actuator monitoring." },
  "spring-boot-annotations": { color: "#38BDF8", title: "Spring Boot Annotations", description: "The annotation API surface — @Component, @RestController, @ConfigurationProperties." },
  "microservices": { color: "#A78BFA", title: "Microservices Architecture", description: "Service discovery, API gateways, circuit breakers, Kafka, and Docker/K8s." },
  "java-collections": { color: "#FBBF24", title: "Java Collections", description: "HashMap internals, Red-Black trees, ConcurrentHashMap, and collection hierarchies." },
  "java-8-17-21": { color: "#E879F9", title: "Modern Java (8/17/21)", description: "Streams, lambdas, records, sealed classes, pattern matching." },
  "multithreading-concurrency": { color: "#FB7185", title: "Multithreading & Concurrency", description: "Thread lifecycle, ThreadPoolExecutor, AQS, lock-free programming, Project Loom." },
  "sql-database": { color: "#A3E635", title: "SQL & Databases", description: "ACID transactions, isolation levels, join strategies, B-tree indexing." },
  "jvm-internals": { color: "#FB923C", title: "JVM Internals", description: "Heap, stack, metaspace, class loading, JIT compilation, GC algorithms." },
  "core-java": { color: "#60A5FA", title: "Core Java", description: "OOP principles, generics, type erasure, and exception handling internals." },
};

import { SYLLABUS_MAP } from "@/lib/syllabusGenerator";

export default function ModuleConstellationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [moduleData, setModuleData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"graph" | "grid">("graph");
  const { visitedTopicSlugs } = useProgressStore();
  const meta = MODULE_META[slug] || { color: "#10E39B", title: slug, description: "" };

  useEffect(() => {
    fetch("/modules-manifest.json")
      .then(r => r.json())
      .then(data => {
        // Build merged module data
        const mergedModule = {
          slug,
          title: meta.title,
          topics: [] as any[]
        };

        // Gather all topics for this module slug
        Object.keys(SYLLABUS_MAP).forEach(topicSlug => {
          const item = SYLLABUS_MAP[topicSlug];
          if (item.moduleSlug === slug) {
            const existingTopic = data[slug]?.topics?.find((t: any) => t.slug === topicSlug);
            mergedModule.topics.push({
              slug: topicSlug,
              moduleSlug: slug,
              title: item.title,
              order: item.order,
              summaryOneLiner: existingTopic?.summaryOneLiner || `Detailed 69-point syllabus explainer guide for ${item.title}.`,
              estimatedReadMinutes: existingTopic?.estimatedReadMinutes || 25,
              generated: existingTopic?.generated ?? true,
              qaCount: existingTopic?.qaCount || 3,
              diagramCount: existingTopic?.diagramCount || 0,
              partCount: existingTopic?.partCount || 1,
              prerequisiteTopicSlugs: existingTopic?.prerequisiteTopicSlugs || [],
            });
          }
        });

        // Sort by order
        mergedModule.topics.sort((a, b) => a.order - b.order);
        setModuleData(mergedModule);
      })
      .catch(console.error);
  }, [slug, meta.title]);

  const totalQAs = useMemo(() => moduleData?.topics?.reduce((s: number, t: any) => s + (t.qaCount || 0), 0) || 0, [moduleData]);
  const totalDiagrams = useMemo(() => moduleData?.topics?.reduce((s: number, t: any) => s + (t.diagramCount || 0), 0) || 0, [moduleData]);
  const completedTopics = useMemo(() => moduleData?.topics?.filter((t: any) => visitedTopicSlugs.includes(t.slug)).length || 0, [moduleData, visitedTopicSlugs]);

  return (
    <main className="min-h-screen bg-surface-base text-white relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: `radial-gradient(ellipse 60% 40% at 70% 10%, ${meta.color}15 0%, transparent 70%)` }} />
      <FloatingParticles />
      <NavBar />

      <div className="relative z-10 px-6 pb-4 flex items-start justify-between max-w-7xl mx-auto w-full" style={{ paddingTop: "9.5rem" }}>
        <div>
          <Link href="/modules" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors mb-4 group">
            <ArrowLeft className="w-3.5 h-3.5" /> All Modules
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: meta.color }} />
            <h1 className="text-2xl md:text-3xl font-display font-bold" style={{ color: meta.color }}>{meta.title}</h1>
          </div>
          <p className="text-sm text-white/50 max-w-xl">{meta.description}</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/8 self-end mt-4">
          {([["graph", Network], ["grid", Grid]] as [string, React.ElementType][]).map(([mode, Icon]) => (
            <button key={mode} onClick={() => setViewMode(mode as any)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === mode ? "" : "text-white/40 hover:text-white"}`}
              style={viewMode === mode ? { background: `${meta.color}20`, color: meta.color } : {}}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {moduleData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="relative z-10 px-6 max-w-7xl mx-auto w-full mb-4">
          <div className="grid grid-cols-4 gap-3">
            {[{ label: "Topics", value: moduleData.topics?.length || 0, Icon: BookOpen }, { label: "Interview QAs", value: totalQAs, Icon: Trophy }, { label: "Diagrams", value: totalDiagrams, Icon: GitBranch }, { label: "Completed", value: completedTopics, Icon: ChevronRight }].map(({ label, value, Icon }) => (
              <GlassPanel key={label} className="p-3 border-white/5 bg-black/20 flex items-center gap-3">
                <div className="p-1.5 rounded-lg" style={{ background: `${meta.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <div>
                  <div className="font-display font-bold text-lg text-white">{value}</div>
                  <div className="text-[10px] text-white/40">{label}</div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </motion.div>
      )}

      <div className="relative z-10 flex-1 px-6 pb-28 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {viewMode === "graph" ? (
            <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-[480px] rounded-2xl overflow-hidden border border-white/5 bg-black/30">
              {moduleData ? (
                <TopicConstellationGraph topics={moduleData.topics} moduleSlug={slug} accentColor={meta.color} visitedSlugs={visitedTopicSlugs} />
              ) : (
                <div className="flex items-center justify-center h-full text-white/30 text-xs animate-pulse">Loading constellation...</div>
              )}
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moduleData?.topics?.map((topic: any, idx: number) => {
                const isVisited = visitedTopicSlugs.includes(topic.slug);
                return (
                  <motion.div key={topic.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Link href={`/topic/${topic.slug}`} className="block group h-full">
                      <GlassPanel hoverEffect className="h-full p-5 border-white/5 flex flex-col justify-between"
                        style={{ borderColor: isVisited ? `${meta.color}30` : undefined }}>
                        <div>
                          <h3 className="font-display font-bold text-sm leading-snug mb-2" style={{ color: isVisited ? meta.color : "white" }}>{topic.title}</h3>
                          <p className="text-xs text-white/50 leading-relaxed">{topic.summaryOneLiner}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                          <span className="text-[10px] text-white/35">{topic.estimatedReadMinutes}m · {topic.qaCount} QAs</span>
                          <ChevronRight className="w-3.5 h-3.5 text-white/25 group-hover:text-white/60 transition-colors" />
                        </div>
                      </GlassPanel>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <MissionDock />
    </main>
  );
}