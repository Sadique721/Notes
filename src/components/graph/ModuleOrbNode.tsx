"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useProgressStore } from "@/components/providers/ProgressProvider";
import { Compass, Trophy } from "lucide-react";

export type ModuleOrbData = {
  title: string;
  slug: string;
  description: string;
  color: string;
  topicCount: number;
  order: number;
};

const ModuleOrbNode = memo(function ModuleOrbNode({ data }: NodeProps) {
  const d = data as ModuleOrbData;
  const { getModuleCompletion } = useProgressStore();

  const completion = getModuleCompletion(d.slug, d.topicCount);

  return (
    <div className="relative group flex flex-col items-center" style={{ width: 120 }}>
      <Handle type="target" position={Position.Top} style={{ background: "transparent", border: "none", width: 0, height: 0 }} />

      <Link href={`/modules/${d.slug}`} className="block cursor-pointer">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${d.color}66 0%, transparent 70%)`, filter: "blur(12px)" }}
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6 + (d.order % 3), repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.2, rotate: 5 }}
          className="relative w-18 h-18 rounded-full flex items-center justify-center border-2 transition-all duration-300 overflow-hidden"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${d.color}44 0%, rgba(5,6,10,0.95) 100%)`,
            borderColor: `${d.color}80`,
            boxShadow: `0 0 25px ${d.color}40, inset 0 1px 0 ${d.color}30`,
          }}
        >
          {/* Inner core pulse */}
          <motion.div
            animate={{ scale: [0.75, 1.05, 0.75], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: d.color, boxShadow: `0 0 15px ${d.color}` }}
          />
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${d.color}30 0%, transparent 80%)` }} />
        </motion.div>
      </Link>

      <div className="mt-3 text-center pointer-events-none max-w-[120px] space-y-0.5">
        <span className="font-display font-bold text-[10px] leading-tight tracking-wide uppercase block" style={{ color: d.color }}>
          {d.title.split(" ").slice(0, 2).join(" ")}
        </span>
        <div className="flex items-center justify-center gap-1">
          <span className="text-white/40 text-[8px] font-mono">{d.topicCount} topics</span>
          {completion > 0 && (
            <span className="text-emerald-400 text-[8px] font-mono font-semibold">({completion}%)</span>
          )}
        </div>
      </div>

      {/* Hover popover details */}
      <div className="absolute top-22 left-1/2 -translate-x-1/2 w-56 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 translate-y-2 group-hover:translate-y-0">
        <div className="rounded-xl border p-4 text-center space-y-2"
          style={{ background: "rgba(5,6,10,0.96)", backdropFilter: "blur(20px)", borderColor: `${d.color}40`, boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 25px ${d.color}20` }}>
          <h3 className="font-display font-bold text-xs mb-1" style={{ color: d.color }}>{d.title}</h3>
          <p className="text-[9px] text-white/60 leading-relaxed">{d.description}</p>
          
          {/* Progress bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[8px] font-mono text-white/45">
              <span>PROGRESS</span>
              <span>{completion}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completion}%`, backgroundColor: d.color }} />
            </div>
          </div>
          
          <div className="mt-2 text-[9px] font-mono text-white/35 border-t border-white/5 pt-2 flex items-center justify-center gap-1">
            <Compass className="w-3 h-3 text-emerald-400 animate-spin-slow" /> Click to map dimension
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: "transparent", border: "none", width: 0, height: 0 }} />
    </div>
  );
});

export default ModuleOrbNode;
