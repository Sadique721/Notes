"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Cpu, Zap, Lock, Unlock } from "lucide-react";
import { useProgressStore } from "@/components/providers/ProgressProvider";

export type TopicNodeData = {
  title: string;
  slug: string;
  moduleSlug: string;
  color: string;
  estimatedReadMinutes: number;
  generated: boolean;
  qaCount: number;
  diagramCount: number;
  visitedProgress: number; // 0-100
  prerequisiteTopicSlugs?: string[];
};

const TopicNode = memo(function TopicNode({ data }: NodeProps) {
  const d = data as TopicNodeData;
  const { visitedTopicSlugs } = useProgressStore();
  const isVisited = d.visitedProgress >= 100;

  // Prerequisite locks
  const prereqs = d.prerequisiteTopicSlugs || [];
  const isLocked = prereqs.some((pSlug) => !visitedTopicSlugs.includes(pSlug));

  return (
    <div className="relative group" style={{ width: 240 }}>
      <Handle type="target" position={Position.Top} style={{ background: `${d.color}80`, border: "none", width: 8, height: 8, top: -4 }} />

      {isLocked ? (
        <div className="rounded-2xl border p-4 relative overflow-hidden bg-black/60 border-white/5 opacity-50 cursor-not-allowed select-none">
          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 z-20">
            <Lock className="w-5 h-5 text-white/50" />
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-xs leading-tight text-white/50 mb-3 pr-6">
            {d.title}
          </h3>

          {/* Stats row */}
          <div className="flex items-center gap-2 text-white/20">
            <div className="flex items-center gap-1 text-[9px]">
              <Clock className="w-2.5 h-2.5" />
              <span>{d.estimatedReadMinutes}m</span>
            </div>
            <div className="flex items-center gap-1 text-[9px]">
              <Cpu className="w-2.5 h-2.5" />
              <span>{d.qaCount} QAs</span>
            </div>
          </div>
        </div>
      ) : (
        <Link href={`/topic/${d.slug}`} className="block cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-2xl border p-4 relative overflow-hidden"
            style={{
              background: isVisited
                ? `linear-gradient(135deg, ${d.color}15 0%, rgba(5,6,10,0.85) 100%)`
                : "rgba(11,15,26,0.9)",
              borderColor: isVisited ? `${d.color}50` : "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              boxShadow: isVisited ? `0 0 20px ${d.color}20, 0 4px 16px rgba(0,0,0,0.4)` : "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            {/* Accent top bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${d.color}, transparent)` }} />

            {/* Generated badge */}
            {d.generated && (
              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider"
                style={{ background: `${d.color}20`, color: d.color, border: `1px solid ${d.color}40` }}>
                <Zap className="w-2 h-2" />
                AI
              </div>
            )}

            {/* Title */}
            <h3 className="font-display font-bold text-xs leading-tight text-white/90 mb-3 pr-6" style={{ color: isVisited ? d.color : undefined }}>
              {d.title}
            </h3>

            {/* Stats row */}
            <div className="flex items-center gap-2 text-white/40">
              <div className="flex items-center gap-1 text-[9px]">
                <Clock className="w-2.5 h-2.5" />
                <span>{d.estimatedReadMinutes}m</span>
              </div>
              <div className="flex items-center gap-1 text-[9px]">
                <Cpu className="w-2.5 h-2.5" />
                <span>{d.qaCount} QAs</span>
              </div>
            </div>

            {/* Progress ring indicator (bottom-right corner) */}
            <div className="absolute bottom-3 right-3">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                <circle
                  cx="12" cy="12" r="9" fill="none"
                  stroke={d.color} strokeWidth="2"
                  strokeDasharray={`${(d.visitedProgress / 100) * 56.5} 56.5`}
                  strokeLinecap="round"
                  transform="rotate(-90 12 12)"
                  style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
              </svg>
            </div>
          </motion.div>
        </Link>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: `${d.color}80`, border: "none", width: 8, height: 8, bottom: -4 }} />
    </div>
  );
});

export default TopicNode;
