"use client";

import React from "react";
import { AnimatedDiagram } from "@/components/ui/AnimatedDiagram";
import { DiagramSpec } from "@/types/content";

export default function DevDiagramsPage() {
  // Check if we are in development environment
  if (process.env.NODE_ENV === "production") {
    return <div className="p-8 text-white">Not Authorized in Production.</div>;
  }

  const sampleFlow: DiagramSpec = {
    id: "sample-flow",
    kind: "flow",
    title: "Application Startup Flow",
    nodes: [
      { id: "jvm", label: "JVM Init", sublabel: "Process boots up" },
      { id: "spring", label: "Spring Core", sublabel: "Context loads" },
      { id: "tomcat", label: "Embedded Tomcat", sublabel: "Accepts requests" },
    ],
    edges: [
      { from: "jvm", to: "spring", animated: true },
      { from: "spring", to: "tomcat", animated: true },
    ],
  };

  const sampleTable: DiagramSpec = {
    id: "sample-table",
    kind: "comparisonTable",
    title: "HashMap vs TreeMap",
    nodes: [
      { id: "hashmap", label: "HashMap", sublabel: "Hash table based structure. Average O(1) operations." },
      { id: "treemap", label: "TreeMap", sublabel: "Red-Black tree based structure. Guaranteed O(log N) operations." },
    ],
    edges: [],
  };

  const sampleTimeline: DiagramSpec = {
    id: "sample-timeline",
    kind: "timeline",
    title: "Java Concurrency Evolution",
    nodes: [
      { id: "t1", label: "Thread API (1.0)", sublabel: "Basic platform threads" },
      { id: "t2", label: "Executor Service (5.0)", sublabel: "Thread pooling models" },
      { id: "t3", label: "Virtual Threads (21)", sublabel: "Project Loom Loom carrier threads" },
    ],
    edges: [
      { from: "t1", to: "t2" },
      { from: "t2", to: "t3" },
    ],
  };

  return (
    <div className="p-8 space-y-8 bg-surface-base min-h-screen text-white">
      <h1 className="text-2xl font-bold tracking-tight">Injoy&read&play Diagram Renderer QA / Debug</h1>
      <div className="grid grid-cols-1 gap-8 max-w-4xl">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-400">1. Linear / Flow Diagram</h2>
          <AnimatedDiagram spec={sampleFlow} />
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-amber-400">2. Comparison Card Carousel</h2>
          <AnimatedDiagram spec={sampleTable} />
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-cyan-400">3. Timeline Diagram</h2>
          <AnimatedDiagram spec={sampleTimeline} />
        </section>
      </div>
    </div>
  );
}
