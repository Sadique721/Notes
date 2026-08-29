"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

interface EnterpriseExampleProps {
  company: string;
  children: React.ReactNode;
}

export function EnterpriseExample({ company, children }: EnterpriseExampleProps) {
  const monogram = company.charAt(0).toUpperCase();

  // Create a predictable hash color for the monogram based on the name
  const getHashColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "from-emerald-500 to-teal-600 shadow-emerald-500/20",
      "from-cyan-500 to-blue-600 shadow-cyan-500/20",
      "from-violet-500 to-purple-600 shadow-violet-500/20",
      "from-amber-500 to-orange-600 shadow-amber-500/20",
      "from-rose-500 to-pink-600 shadow-rose-500/20",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <GlassPanel variant="light" className="my-6 border-white/5 bg-white/2 hover:border-white/10">
      <div className="flex items-start gap-4">
        {/* Monogram Badge */}
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-white text-base shadow-lg bg-gradient-to-br ${getHashColor(
            company
          )}`}
        >
          {monogram}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-display font-semibold text-white/90 text-sm">
              Enterprise Case Study: {company}
            </h4>
            <ExternalLink className="w-3.5 h-3.5 text-white/40" />
          </div>
          <div className="text-white/60 text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </GlassPanel>
  );
}
