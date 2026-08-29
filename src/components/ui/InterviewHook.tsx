"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

interface InterviewHookProps {
  children: React.ReactNode;
}

export function InterviewHook({ children }: InterviewHookProps) {
  return (
    <GlassPanel
      variant="light"
      className="my-6 border-amber-500/30 bg-amber-500/5 relative overflow-hidden"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse-glow">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-display font-semibold text-amber-400 text-sm tracking-wide uppercase mb-1">
            Interview Question (₹5 Crore Level)
          </h4>
          <div className="text-white/80 text-sm leading-relaxed">{children}</div>
        </div>
      </div>
      {/* Decorative background glow */}
      <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
    </GlassPanel>
  );
}
