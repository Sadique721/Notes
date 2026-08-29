"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { forceSimulation, forceCollide, forceLink, forceManyBody, forceCenter } from "d3-force";
import { Compass, Info, ArrowLeft, ArrowRight, Zap, Target, BookOpen } from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { NavBar } from "@/components/layout/NavBar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useProgressStore } from "@/components/providers/ProgressProvider";
import { useGPU } from "@/components/providers/GPUProvider";

type NodeData = {
  id: string;
  label: string;
  type: "module" | "topic";
  moduleSlug: string;
  color: string;
  radius: number;
  quality?: {
    status: string;
    completeness: number;
    technicalDepth: number;
  };
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type LinkData = {
  source: string | NodeData;
  target: string | NodeData;
  type: "module-to-topic" | "prerequisite";
};

export default function KnowledgeGraphPage() {
  const router = useRouter();
  const { visitedTopicSlugs } = useProgressStore();
  const { gsapEnabled } = useGPU();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [modules, setModules] = useState<any[]>([]);
  const [topics, setTopics] = useState<Record<string, any>>({});
  const [level, setLevel] = useState<"galaxy" | "module" | "concept">("galaxy");
  const [activeModuleSlug, setActiveModuleSlug] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  // Pan and Zoom states
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Load modules & topics manifests
  useEffect(() => {
    async function loadManifests() {
      try {
        const mRes = await fetch("/modules-manifest.json");
        const mData = await mRes.json();
        
        const tRes = await fetch("/content-manifest.json");
        const tData = await tRes.json();
        
        setModules(Object.values(mData));
        setTopics(tData);
      } catch (err) {
        console.error("Failed to load graph manifest maps", err);
      }
    }
    loadManifests();
  }, []);

  // Compute Module colors
  const moduleColors: Record<string, string> = useMemo(() => ({
    "spring-framework-fundamentals": "#10E39B",
    "spring-boot": "#22D3EE",
    "spring-boot-annotations": "#38BDF8",
    "microservices": "#A78BFA",
    "java-collections": "#FBBF24",
    "java-8-17-21": "#E879F9",
    "multithreading-concurrency": "#FB7185",
    "sql-database": "#A3E635",
    "jvm-internals": "#FB923C",
    "core-java": "#60A5FA",
  }), []);

  // Construct Nodes & Links based on Progressive Disclosure Level
  const { nodes, links } = useMemo(() => {
    const nodesList: NodeData[] = [];
    const linksList: LinkData[] = [];

    if (modules.length === 0) return { nodes: [], links: [] };

    if (level === "galaxy") {
      // Level 1: Galaxy (Only Modules displayed)
      modules.forEach((mod) => {
        nodesList.push({
          id: mod.slug,
          label: mod.title,
          type: "module",
          moduleSlug: mod.slug,
          color: moduleColors[mod.slug] || "#FFFFFF",
          radius: 28,
        });
      });

      // Interconnect adjacent modules sequentially to outline a cosmic pathway
      for (let i = 0; i < nodesList.length - 1; i++) {
        linksList.push({
          source: nodesList[i].id,
          target: nodesList[i + 1].id,
          type: "module-to-topic",
        });
      }
    } else if (level === "module" && activeModuleSlug) {
      // Level 2: Active Module + surrounding Topic nodes
      const mod = modules.find((m) => m.slug === activeModuleSlug);
      if (mod) {
        nodesList.push({
          id: mod.slug,
          label: mod.title,
          type: "module",
          moduleSlug: mod.slug,
          color: moduleColors[mod.slug] || "#FFFFFF",
          radius: 34,
        });

        mod.topics.forEach((t: any) => {
          const tDetails = topics[t.slug];
          nodesList.push({
            id: t.slug,
            label: t.title,
            type: "topic",
            moduleSlug: mod.slug,
            color: moduleColors[mod.slug] || "#FFFFFF",
            radius: 18,
            quality: tDetails?.quality || { status: "draft", completeness: 10, technicalDepth: 10 },
          });

          linksList.push({
            source: mod.slug,
            target: t.slug,
            type: "module-to-topic",
          });
        });
      }
    } else if (level === "concept" && selectedNode) {
      // Level 3: Active Topic + Prerequisite dependencies tree
      const targetSlug = selectedNode.id;
      const targetDetails = topics[targetSlug];

      if (targetDetails) {
        // Center Target Topic
        nodesList.push({
          id: targetDetails.slug,
          label: targetDetails.title,
          type: "topic",
          moduleSlug: targetDetails.moduleSlug,
          color: moduleColors[targetDetails.moduleSlug] || "#FFFFFF",
          radius: 24,
          quality: targetDetails.quality,
        });

        // Add prerequisites and dependents
        const prereqs = targetDetails.prerequisiteTopicSlugs || [];
        prereqs.forEach((pr: string) => {
          const prMeta = topics[pr];
          if (prMeta) {
            nodesList.push({
              id: pr,
              label: prMeta.title,
              type: "topic",
              moduleSlug: prMeta.moduleSlug,
              color: moduleColors[prMeta.moduleSlug] || "#FFFFFF",
              radius: 16,
              quality: prMeta.quality,
            });

            linksList.push({
              source: pr,
              target: targetSlug,
              type: "prerequisite",
            });
          }
        });

        // Search for dependents (topics referencing targetSlug as a prereq)
        Object.keys(topics).forEach((k) => {
          const tMeta = topics[k];
          if (tMeta.prerequisiteTopicSlugs?.includes(targetSlug)) {
            nodesList.push({
              id: k,
              label: tMeta.title,
              type: "topic",
              moduleSlug: tMeta.moduleSlug,
              color: moduleColors[tMeta.moduleSlug] || "#FFFFFF",
              radius: 16,
              quality: tMeta.quality,
            });

            linksList.push({
              source: targetSlug,
              target: k,
              type: "prerequisite",
            });
          }
        });
      }
    }

    return { nodes: nodesList, links: linksList };
  }, [level, activeModuleSlug, selectedNode, modules, topics, moduleColors]);

  // Run D3-force simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    // Initialize node positions
    nodes.forEach((n, idx) => {
      n.x = 400 + Math.cos(idx) * 150;
      n.y = 250 + Math.sin(idx) * 150;
    });

    const sim = forceSimulation<NodeData>(nodes)
      .force("link", forceLink<NodeData, LinkData>(links).id((d) => d.id).distance(120))
      .force("charge", forceManyBody().strength(-300))
      .force("collide", forceCollide().radius((d: any) => d.radius + 15))
      .force("center", forceCenter(400, 250));

    let animFrame: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas scaling for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // 1. Draw Links
      links.forEach((link) => {
        const sourceNode = link.source as NodeData;
        const targetNode = link.target as NodeData;

        if (sourceNode.x && sourceNode.y && targetNode.x && targetNode.y) {
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          
          if (link.type === "prerequisite") {
            ctx.strokeStyle = "rgba(16, 227, 155, 0.2)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
          } else {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.lineWidth = 1;
            ctx.setLineDash([]);
          }
          ctx.stroke();

          // Animated energy flows along active links if animation is allowed
          if (gsapEnabled && link.type === "prerequisite") {
            const time = Date.now() * 0.002;
            const progress = (time % 1);
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const px = sourceNode.x + dx * progress;
            const py = sourceNode.y + dy * progress;

            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
            ctx.fillStyle = "#10e39b";
            ctx.shadowColor = "#10e39b";
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }
        }
      });

      // 2. Draw Nodes
      nodes.forEach((node) => {
        if (!node.x || !node.y) return;

        const isVisited = node.type === "topic" && visitedTopicSlugs.includes(node.id);
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;

        ctx.save();
        ctx.translate(node.x, node.y);

        // Ambient outer rings
        ctx.beginPath();
        ctx.arc(0, 0, node.radius + 6, 0, 2 * Math.PI);
        ctx.strokeStyle = isSelected ? node.color : isHovered ? "rgba(255, 255, 255, 0.15)" : "transparent";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pulsing glow for target node
        if (isSelected && gsapEnabled) {
          ctx.beginPath();
          ctx.arc(0, 0, node.radius + 12 + Math.sin(Date.now() * 0.005) * 4, 0, 2 * Math.PI);
          ctx.strokeStyle = `${node.color}20`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Inner solid core node
        ctx.beginPath();
        ctx.arc(0, 0, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(5, 6, 10, 0.85)";
        ctx.strokeStyle = isVisited ? "#10e39b" : `${node.color}60`;
        ctx.lineWidth = isVisited ? 2.5 : 1.5;
        ctx.fill();
        ctx.stroke();

        // Text title labels
        ctx.fillStyle = isHovered || isSelected ? "#FFFFFF" : "rgba(255,255,255,0.7)";
        ctx.font = `bold ${node.type === "module" ? 9 : 8}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = "center";
        
        // Wrap text labels into multiple lines if needed
        const words = node.label.split(" ");
        if (words.length > 2 && node.type === "module") {
          ctx.fillText(words.slice(0, 2).join(" "), 0, -2);
          ctx.fillText(words.slice(2).join(" "), 0, 8);
        } else {
          ctx.fillText(node.label.substring(0, 18) + (node.label.length > 18 ? "..." : ""), 0, 3);
        }

        // Mini status indicators for Topic Nodes
        if (node.type === "topic" && node.quality) {
          const status = node.quality.status;
          ctx.beginPath();
          ctx.arc(0, node.radius - 2, 3, 0, 2 * Math.PI);
          ctx.fillStyle = status === "published" ? "#10e39b" : "rgba(255,255,255,0.3)";
          ctx.fill();
        }

        ctx.restore();
      });

      ctx.restore();

      animFrame = requestAnimationFrame(render);
    };

    sim.on("tick", () => {});
    animFrame = requestAnimationFrame(render);

    return () => {
      sim.stop();
      cancelAnimationFrame(animFrame);
    };
  }, [nodes, links, pan, zoom, hoveredNode, selectedNode, visitedTopicSlugs, gsapEnabled]);

  // Handle Mouse Events: Drag, Hover, Click
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging.current) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
      return;
    }

    // Check hit test over nodes
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - pan.x) / zoom;
    const my = (e.clientY - rect.top - pan.y) / zoom;

    let matchNode: NodeData | null = null;
    for (const node of nodes) {
      if (node.x && node.y) {
        const dist = Math.hypot(node.x - mx, node.y - my);
        if (dist <= node.radius) {
          matchNode = node;
          break;
        }
      }
    }
    setHoveredNode(matchNode);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = false;
    
    // Check if it is a simple click or a drag release
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (e.clientX - rect.left - pan.x) / zoom;
    const my = (e.clientY - rect.top - pan.y) / zoom;

    let clickedNode: NodeData | null = null;
    for (const node of nodes) {
      if (node.x && node.y) {
        const dist = Math.hypot(node.x - mx, node.y - my);
        if (dist <= node.radius) {
          clickedNode = node;
          break;
        }
      }
    }

    if (clickedNode) {
      if (clickedNode.type === "module") {
        setActiveModuleSlug(clickedNode.id);
        setLevel("module");
        setSelectedNode(null);
        setPan({ x: 0, y: 0 });
        setZoom(1.1);
      } else {
        setSelectedNode(clickedNode);
        setLevel("concept");
        setPan({ x: 0, y: 0 });
        setZoom(1.2);
      }
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    setZoom((z) => Math.max(0.4, Math.min(3, direction === "in" ? z + 0.15 : z - 0.15)));
  };

  const resetGraph = () => {
    setLevel("galaxy");
    setActiveModuleSlug(null);
    setSelectedNode(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <main className="min-h-screen bg-surface-base text-white relative overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 bg-aurora-2 opacity-5 pointer-events-none z-0" />
      <FloatingParticles />
      <NavBar />

      <div className="w-full max-w-7xl px-6 pb-28 relative z-10 flex flex-col flex-1 gap-6" style={{ paddingTop: "9.5rem" }}>
        {/* Graph control panel */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-display flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-400" /> Interactive Knowledge Graph
            </h1>
            <p className="text-xs text-white/45 mt-1 leading-relaxed">
              Progressive disclosure concept mapping of the complete 194-topic Java &amp; JVM registry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {level !== "galaxy" && (
              <button
                onClick={resetGraph}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-xs hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Galaxy Map
              </button>
            )}
            <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-lg">
              <button
                onClick={() => handleZoom("in")}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded text-xs cursor-pointer"
              >
                +
              </button>
              <button
                onClick={() => handleZoom("out")}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded text-xs cursor-pointer"
              >
                -
              </button>
            </div>
          </div>
        </div>

        {/* Graph Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
          {/* LEFT: Canvas Graph View */}
          <div className="lg:col-span-8 h-[550px] relative rounded-2xl glass border border-white/5 bg-black/30 overflow-hidden flex flex-col justify-end">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            />
            {/* Guide Badge Overlay */}
            <div className="absolute left-4 top-4 p-3 bg-black/70 border border-white/10 rounded-xl backdrop-blur-md space-y-1.5 pointer-events-none text-[10px] font-mono">
              <div className="text-emerald-400 font-bold uppercase tracking-wider">Navigation Guide</div>
              <div className="text-white/60">Level: <span className="text-white capitalize">{level}</span></div>
              <div className="text-white/40">💡 Click Module nodes to expand topic constellations.</div>
            </div>
          </div>

          {/* RIGHT: Metadata & Action Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full"
                >
                  <GlassPanel className="p-6 border-white/8 bg-black/40 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Topic Node
                        </span>
                        <h2 className="text-lg font-display font-bold mt-3 leading-snug" style={{ color: selectedNode.color }}>
                          {selectedNode.label}
                        </h2>
                        <p className="text-xs text-white/40 mt-1 font-mono uppercase tracking-wider">{selectedNode.moduleSlug.replace(/-/g, " ")}</p>
                      </div>

                      {selectedNode.quality && (
                        <div className="border-t border-b border-white/5 py-4 space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-white/45">Completeness Status</span>
                            <span className="font-mono font-bold capitalize" style={{ color: selectedNode.quality.status === "published" ? "#10e39b" : "#fbbf24" }}>
                              {selectedNode.quality.status}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] text-white/40 font-mono">
                              <span>Completeness</span>
                              <span>{selectedNode.quality.completeness}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${selectedNode.quality.completeness}%`, backgroundColor: selectedNode.color }} />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] text-white/40 font-mono">
                              <span>Technical Depth</span>
                              <span>{selectedNode.quality.technicalDepth}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${selectedNode.quality.technicalDepth}%`, backgroundColor: selectedNode.color }} />
                            </div>
                          </div>
                        </div>
                      )}

                      {topics[selectedNode.id]?.prerequisiteTopicSlugs?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-mono uppercase tracking-wider text-white/40">Prerequisites:</h4>
                          <div className="flex flex-col gap-1.5">
                            {topics[selectedNode.id].prerequisiteTopicSlugs.map((pr: string) => (
                              <div key={pr} className="text-xs text-white/70 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="truncate">{topics[pr]?.title || pr}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Link href={`/topic/${selectedNode.id}`} className="block w-full mt-6">
                      <button className="w-full py-3 rounded-xl border font-display font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          backgroundColor: `${selectedNode.color}15`,
                          borderColor: `${selectedNode.color}50`,
                          color: selectedNode.color
                        }}>
                        Launch Mission Control <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </GlassPanel>
                </motion.div>
              ) : activeModuleSlug ? (
                <motion.div
                  key="module"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full"
                >
                  <GlassPanel className="p-6 border-white/5 bg-black/40 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Module Node
                        </span>
                        <h2 className="text-lg font-display font-bold mt-3 leading-snug">
                          {modules.find((m) => m.slug === activeModuleSlug)?.title}
                        </h2>
                        <p className="text-xs text-white/45 mt-2 leading-relaxed">
                          Click any topic node in the constellation view on the left to review depth metrics and prerequisites.
                        </p>
                      </div>

                      <div className="border-t border-white/5 pt-4 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/45">Total Dimensions</span>
                          <span className="font-mono font-bold text-cyan-400">
                            {modules.find((m) => m.slug === activeModuleSlug)?.topics?.length || 0} Topics
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={resetGraph}
                      className="w-full mt-6 py-3 rounded-xl border border-white/10 bg-white/2 font-display font-semibold text-xs text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Galaxy
                    </button>
                  </GlassPanel>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full"
                >
                  <GlassPanel className="p-6 border-white/5 bg-black/40 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Universe Overview
                        </span>
                        <h2 className="text-lg font-display font-bold mt-3 leading-snug">
                          Curriculum Galaxy
                        </h2>
                        <p className="text-xs text-white/45 mt-2 leading-relaxed">
                          Select any of the 10 structural dimensions on the left constellation map to audit learning states and requirements.
                        </p>
                      </div>

                      <div className="border-t border-white/5 pt-4 space-y-3">
                        <div className="flex items-center gap-2.5 text-xs text-white/70">
                          <Target className="w-4 h-4 text-emerald-400" />
                          <span>10 Modules</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-white/70">
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                          <span>194 Learning Topics</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-white/70">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span>Dynamic interactive relationships</span>
                        </div>
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
