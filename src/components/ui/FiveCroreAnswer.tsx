"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

interface FiveCroreAnswerProps {
  question: string;
  children: React.ReactNode;
}

export function FiveCroreAnswer({ question, children }: FiveCroreAnswerProps) {
  return (
    <GlassPanel
      variant="heavy"
      className="my-8 border-yellow-500/40 bg-gradient-to-br from-yellow-500/5 to-amber-600/5 relative overflow-hidden shadow-glow-sm hover:shadow-glow-md transition-shadow duration-500"
    >
      {/* Visual background trophy layer */}
      <div className="absolute right-0 bottom-0 opacity-[0.03] text-yellow-500 transform translate-x-12 translate-y-12 scale-150 pointer-events-none">
        <Trophy className="w-64 h-64" />
      </div>

      <div className="flex gap-4 relative z-10">
        <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-glow-sm h-fit self-start animate-float-slow">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-display font-bold text-yellow-400 text-sm tracking-widest uppercase mb-1">
            ₹5 Crore Interview Answer
          </h4>
          <h5 className="font-display font-semibold text-white/95 text-base mb-3 leading-snug">
            {question}
          </h5>
          <div className="text-white/80 text-sm leading-relaxed border-l-2 border-yellow-500/30 pl-4 space-y-3">
            {children}
          </div>
        </div>
      </div>
      {/* Top shimmer border line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60 animate-shimmer" />
    </GlassPanel>
  );
}
