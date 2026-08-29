"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { GlassPanel } from "./GlassPanel";
import { motion } from "framer-motion";

interface MisconceptionProps {
  claim: string;
  correction: string;
}

export function Misconception({ claim, correction }: MisconceptionProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="perspective-1000 my-6 cursor-pointer h-40"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full h-full relative preserve-3d"
      >
        {/* Card Front: The Misconception (Red/Struck through) */}
        <GlassPanel
          variant="light"
          className="absolute inset-0 backface-hidden border-rose-500/20 bg-rose-500/5 flex items-center gap-4 p-6"
        >
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <X className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-display font-semibold text-rose-400 text-xs tracking-wider uppercase mb-1">
              Common Misconception
            </h5>
            <p className="text-white/80 text-sm line-through leading-relaxed">{claim}</p>
            <p className="text-white/40 text-xs mt-2 italic">Hover or tap to reveal the truth</p>
          </div>
        </GlassPanel>

        {/* Card Back: The Correction (Green/Checkmark) */}
        <GlassPanel
          variant="light"
          className="absolute inset-0 backface-hidden border-emerald-500/20 bg-emerald-500/5 flex items-center gap-4 p-6 rotate-y-180"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-sm">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-display font-semibold text-emerald-400 text-xs tracking-wider uppercase mb-1">
              The Reality (Correct Concept)
            </h5>
            <p className="text-white/95 text-sm leading-relaxed">{correction}</p>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
