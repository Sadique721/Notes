"use client";

import React, { useEffect, useState } from "react";
import { ReactFlow, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DiagramSpec } from "@/types/content";
import { GlassPanel } from "./GlassPanel";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Award } from "lucide-react";

interface AnimatedDiagramProps {
  spec: DiagramSpec;
}

export function AnimatedDiagram({ spec }: AnimatedDiagramProps) {
  const [key, setKey] = useState(0); // For replay capability

  const handleReplay = () => {
    setKey((prev) => prev + 1);
  };

  // Render based on diagram kind
  switch (spec.kind) {
    case "flow":
    case "cycle":
    case "layered":
      return (
        <ReactFlowDiagram
          key={key}
          spec={spec}
          onReplay={handleReplay}
        />
      );
    case "comparisonTable":
      return (
        <ComparisonCarousel
          key={key}
          spec={spec}
          onReplay={handleReplay}
        />
      );
    case "timeline":
      return (
        <TimelineDiagram
          key={key}
          spec={spec}
          onReplay={handleReplay}
        />
      );
    case "tree":
    default:
      return (
        <TreeDiagram
          key={key}
          spec={spec}
          onReplay={handleReplay}
        />
      );
  }
}

// Simple layout logic to prevent node overlaps
function computeNodePositions(
  nodes: { id: string; label: string; sublabel?: string }[],
  edges: { from: string; to: string }[],
  direction: "LR" | "TB" = "LR"
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  if (nodes.length === 0) return positions;

  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  });

  edges.forEach((e) => {
    if (adj[e.from]) {
      adj[e.from].push(e.to);
      inDegree[e.to] = (inDegree[e.to] || 0) + 1;
    }
  });

  const queue: string[] = [];
  nodes.forEach((n) => {
    if (inDegree[n.id] === 0) {
      queue.push(n.id);
    }
  });

  if (queue.length === 0) {
    queue.push(nodes[0].id);
  }

  const levels: Record<string, number> = {};
  queue.forEach((id) => {
    levels[id] = 0;
  });

  const visited = new Set<string>();
  while (queue.length > 0) {
    const curr = queue.shift()!;
    visited.add(curr);
    const currLevel = levels[curr] || 0;

    (adj[curr] || []).forEach((next) => {
      levels[next] = Math.max(levels[next] || 0, currLevel + 1);
      if (!visited.has(next) && !queue.includes(next)) {
        queue.push(next);
      }
    });
  }

  const levelGroups: Record<number, string[]> = {};
  nodes.forEach((n) => {
    const lvl = levels[n.id] || 0;
    if (!levelGroups[lvl]) levelGroups[lvl] = [];
    levelGroups[lvl].push(n.id);
  });

  const levelKeys = Object.keys(levelGroups).map(Number).sort((a, b) => a - b);

  levelKeys.forEach((lvl, lvlIdx) => {
    const group = levelGroups[lvl];
    const totalCount = group.length;

    group.forEach((id, groupIdx) => {
      if (direction === "LR") {
        const x = lvlIdx * 180 + 50;
        const centerY = 100;
        const offset = (groupIdx - (totalCount - 1) / 2) * 110;
        positions[id] = { x, y: centerY + offset };
      } else {
        const y = lvlIdx * 120 + 40;
        const centerX = 200;
        const offset = (groupIdx - (totalCount - 1) / 2) * 150;
        positions[id] = { x: centerX + offset, y };
      }
    });
  });

  return positions;
}

// React Flow linear / cycle / layered diagram renderer
function ReactFlowDiagram({
  spec,
  onReplay,
}: {
  spec: DiagramSpec;
  onReplay: () => void;
}) {
  const positions = computeNodePositions(spec.nodes, spec.edges, "LR");

  // Convert spec nodes/edges to React Flow format
  const initialNodes = spec.nodes.map((node) => ({
    id: node.id,
    type: "default",
    data: {
      label: (
        <div className="flex flex-col items-center">
          <span className="font-display font-semibold text-white text-sm">{node.label}</span>
          {node.sublabel && (
            <span className="text-[10px] text-white/50 mt-0.5">{node.sublabel}</span>
          )}
        </div>
      ),
    },
    position: positions[node.id] || { x: 100, y: 100 },
    style: {
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "12px",
      color: "white",
      padding: "10px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
      width: 140,
    },
  }));

  const initialEdges = spec.edges.map((edge) => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    animated: true,
    style: { stroke: "var(--accent-color, #10E39B)", strokeWidth: 2 },
  }));

  return (
    <GlassPanel className="h-[280px] w-full relative p-0 overflow-hidden bg-black/30 border-white/5">
      <div className="absolute top-4 left-4 z-10 font-display font-semibold text-sm text-white/80">
        {spec.title}
      </div>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={onReplay}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors border border-white/10 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={false}
        panOnDrag={false}
        nodesConnectable={false}
        nodesDraggable={false}
      >
        <Background color="#fff" style={{ opacity: 0.03 }} gap={16} />
      </ReactFlow>
    </GlassPanel>
  );
}

// Flip-card comparison table carousel
function ComparisonCarousel({
  spec,
  onReplay,
}: {
  spec: DiagramSpec;
  onReplay: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <GlassPanel className="w-full bg-black/20 border-white/5 relative p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-display font-semibold text-sm text-white/80">{spec.title}</h4>
        <div className="flex gap-2">
          {spec.nodes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                activeIndex === idx ? "bg-emerald-400" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <GlassPanel variant="light" className="p-4 border-white/5 bg-white/2">
            <h5 className="font-display font-bold text-white mb-2">
              {spec.nodes[activeIndex]?.label}
            </h5>
            <p className="text-white/60 text-sm">
              {spec.nodes[activeIndex]?.sublabel || "Technical concept comparison block."}
            </p>
          </GlassPanel>

          <GlassPanel variant="light" className="p-4 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
            <div className="absolute right-4 top-4 text-emerald-400 opacity-20">
              <Award className="w-8 h-8" />
            </div>
            <h5 className="font-display font-bold text-emerald-400 mb-2">Winner Highlight</h5>
            <p className="text-white/85 text-sm">
              Optimized memory layout, high developer productivity, and native compilation profiles.
            </p>
          </GlassPanel>
        </motion.div>
      </AnimatePresence>
    </GlassPanel>
  );
}

// Horizontal timeline diagram
function TimelineDiagram({
  spec,
  onReplay,
}: {
  spec: DiagramSpec;
  onReplay: () => void;
}) {
  return (
    <GlassPanel className="w-full bg-black/20 border-white/5 relative p-6 overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-display font-semibold text-sm text-white/80">{spec.title}</h4>
      </div>

      <div className="flex gap-6 min-w-[600px] py-4 relative">
        {/* Faint center line */}
        <div className="absolute left-6 right-6 top-1/2 h-[1px] bg-white/10 -translate-y-1/2 z-0" />

        {spec.nodes.map((node, idx) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, type: "spring" }}
            className="flex-1 flex flex-col items-center text-center relative z-10"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-400 border-4 border-black/40 shadow-glow-sm mb-3" />
            <GlassPanel variant="light" className="p-3 w-40 text-xs border-white/5 bg-white/2">
              <span className="font-display font-bold text-white block mb-1">{node.label}</span>
              <span className="text-white/50">{node.sublabel || "Timeline Era"}</span>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  );
}

// Collapsible tree diagram (React Flow vertical hierarchy tree)
function TreeDiagram({
  spec,
  onReplay,
}: {
  spec: DiagramSpec;
  onReplay: () => void;
}) {
  const positions = computeNodePositions(spec.nodes, spec.edges, "TB");

  const initialNodes = spec.nodes.map((node) => ({
    id: node.id,
    type: "default",
    data: {
      label: (
        <div className="flex flex-col items-center">
          <span className="font-display font-semibold text-white text-xs">{node.label}</span>
          {node.sublabel && (
            <span className="text-[9px] text-white/40 mt-0.5">{node.sublabel}</span>
          )}
        </div>
      ),
    },
    position: positions[node.id] || { x: 100, y: 100 },
    style: {
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "10px",
      color: "white",
      padding: "8px",
      width: 120,
    },
  }));

  const initialEdges = spec.edges.map((edge) => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    style: { stroke: "var(--accent-color, #10E39B)", strokeWidth: 1.5 },
  }));

  return (
    <GlassPanel className="h-[280px] w-full relative p-0 overflow-hidden bg-black/30 border-white/5">
      <div className="absolute top-4 left-4 z-10 font-display font-semibold text-sm text-white/80">
        {spec.title}
      </div>
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onReplay}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors border border-white/10 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={false}
        panOnDrag={false}
        nodesConnectable={false}
        nodesDraggable={false}
      >
        <Background color="#fff" style={{ opacity: 0.02 }} gap={16} />
      </ReactFlow>
    </GlassPanel>
  );
}
